create table public.clinics (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 2 and 160),
  created_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null check (char_length(btrim(full_name)) between 2 and 160),
  email text not null,
  created_at timestamptz not null default now()
);

create table public.clinic_memberships (
  clinic_id uuid not null references public.clinics (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role text not null check (role in ('owner', 'admin', 'vet', 'receptionist')),
  status text not null default 'active' check (status in ('active', 'invited', 'disabled')),
  crmv text,
  crmv_state text,
  created_at timestamptz not null default now(),
  primary key (clinic_id, user_id),
  unique (clinic_id, user_id, role)
);

create table public.tutors (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics (id) on delete cascade,
  full_name text not null check (char_length(btrim(full_name)) between 2 and 160),
  cpf text check (cpf is null or cpf ~ '^[0-9]{11}$'),
  phone text,
  email text,
  address text,
  city text,
  zip text,
  created_by uuid not null default auth.uid() references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (clinic_id, id)
);

create unique index tutors_clinic_cpf_unique
  on public.tutors (clinic_id, cpf)
  where cpf is not null;

create table public.pets (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics (id) on delete cascade,
  tutor_id uuid not null,
  name text not null check (char_length(btrim(name)) between 1 and 100),
  species text not null check (char_length(btrim(species)) between 1 and 80),
  breed text,
  birth_date date,
  weight_kg numeric(7, 2) check (weight_kg is null or weight_kg > 0),
  created_at timestamptz not null default now(),
  unique (clinic_id, id),
  constraint pets_clinic_tutor_fk
    foreign key (clinic_id, tutor_id)
    references public.tutors (clinic_id, id)
    on delete restrict
);

create table public.medical_records (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics (id) on delete cascade,
  pet_id uuid not null,
  veterinarian_id uuid not null,
  visit_at timestamptz not null default now(),
  diagnosis text,
  prescription text,
  vaccination_date date,
  created_by uuid not null default auth.uid() references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (clinic_id, id),
  constraint medical_records_clinic_pet_fk
    foreign key (clinic_id, pet_id)
    references public.pets (clinic_id, id)
    on delete restrict,
  constraint medical_records_clinic_vet_fk
    foreign key (clinic_id, veterinarian_id)
    references public.clinic_memberships (clinic_id, user_id)
    on delete restrict
);

create table public.exam_files (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics (id) on delete cascade,
  medical_record_id uuid not null,
  object_path text not null unique,
  original_name text not null,
  content_type text not null check (content_type = 'application/pdf'),
  size_bytes bigint not null check (size_bytes > 0 and size_bytes <= 10485760),
  created_at timestamptz not null default now(),
  constraint exam_files_path_scope_check
    check (
      object_path like clinic_id::text || '/' || medical_record_id::text || '/%'
    ),
  constraint exam_files_clinic_record_fk
    foreign key (clinic_id, medical_record_id)
    references public.medical_records (clinic_id, id)
    on delete restrict
);

create index clinic_memberships_user_status_idx
  on public.clinic_memberships (user_id, status);
create index tutors_clinic_name_idx on public.tutors (clinic_id, full_name);
create index pets_clinic_tutor_idx on public.pets (clinic_id, tutor_id);
create index medical_records_clinic_pet_visit_idx
  on public.medical_records (clinic_id, pet_id, visit_at desc);
create index exam_files_clinic_record_idx
  on public.exam_files (clinic_id, medical_record_id);

create function public.has_clinic_access(
  target_clinic_id uuid,
  allowed_roles text[] default null
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.clinic_memberships membership
    where membership.clinic_id = target_clinic_id
      and membership.user_id = (select auth.uid())
      and membership.status = 'active'
      and (allowed_roles is null or membership.role = any (allowed_roles))
  );
$$;

revoke all on function public.has_clinic_access(uuid, text[]) from public, anon;
grant execute on function public.has_clinic_access(uuid, text[]) to authenticated;

create function public.create_clinic_with_owner(
  clinic_name text,
  veterinarian_crmv text default null,
  veterinarian_crmv_state text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
  new_clinic_id uuid;
begin
  if current_user_id is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;

  if clinic_name is null or char_length(btrim(clinic_name)) not between 2 and 160 then
    raise exception 'Invalid clinic name' using errcode = '22023';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(current_user_id::text, 0));
  select membership.clinic_id
    into new_clinic_id
    from public.clinic_memberships membership
    where membership.user_id = current_user_id
      and membership.status = 'active'
    order by membership.created_at
    limit 1;
  if new_clinic_id is not null then
    return new_clinic_id;
  end if;

  insert into public.clinics (name)
  values (btrim(clinic_name))
  returning id into new_clinic_id;

  insert into public.clinic_memberships (
    clinic_id, user_id, role, status, crmv, crmv_state
  )
  values (
    new_clinic_id,
    current_user_id,
    'owner',
    'active',
    nullif(btrim(veterinarian_crmv), ''),
    nullif(upper(btrim(veterinarian_crmv_state)), '')
  );

  return new_clinic_id;
end;
$$;

revoke all on function public.create_clinic_with_owner(text, text, text) from public, anon;
grant execute on function public.create_clinic_with_owner(text, text, text) to authenticated;

create function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  submitted_name text := nullif(btrim(new.raw_user_meta_data ->> 'full_name'), '');
begin
  if submitted_name is null then
    raise exception 'User metadata full_name is required';
  end if;

  insert into public.profiles (id, full_name, email)
  values (new.id, submitted_name, coalesce(new.email, ''));

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();
revoke all on function public.handle_new_auth_user() from public, anon, authenticated;

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create function public.prevent_created_by_change()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.created_by is distinct from old.created_by then
    raise exception 'created_by cannot be changed' using errcode = '42501';
  end if;
  return new;
end;
$$;

create trigger tutors_set_updated_at
  before update on public.tutors
  for each row execute function public.set_updated_at();
create trigger medical_records_set_updated_at
  before update on public.medical_records
  for each row execute function public.set_updated_at();
create trigger tutors_prevent_created_by_change
  before update on public.tutors
  for each row execute function public.prevent_created_by_change();
create trigger medical_records_prevent_created_by_change
  before update on public.medical_records
  for each row execute function public.prevent_created_by_change();
revoke all on function public.set_updated_at() from public, anon, authenticated;
revoke all on function public.prevent_created_by_change() from public, anon, authenticated;

alter table public.clinics enable row level security;
alter table public.profiles enable row level security;
alter table public.clinic_memberships enable row level security;
alter table public.tutors enable row level security;
alter table public.pets enable row level security;
alter table public.medical_records enable row level security;
alter table public.exam_files enable row level security;

grant select on public.clinics, public.profiles, public.clinic_memberships to authenticated;
grant update (name) on public.clinics to authenticated;
grant update (full_name) on public.profiles to authenticated;
grant select, insert, update, delete on
  public.tutors, public.pets, public.medical_records, public.exam_files
  to authenticated;

create policy "Clinic members can read their clinics"
  on public.clinics for select to authenticated
  using ((select public.has_clinic_access(id)));
create policy "Clinic admins can update their clinics"
  on public.clinics for update to authenticated
  using ((select public.has_clinic_access(id, array['owner', 'admin'])))
  with check ((select public.has_clinic_access(id, array['owner', 'admin'])));

create policy "Users can read their profile and clinic colleagues"
  on public.profiles for select to authenticated
  using (
    id = (select auth.uid())
    or exists (
      select 1
      from public.clinic_memberships colleague_membership
      where colleague_membership.user_id = profiles.id
        and (select public.has_clinic_access(colleague_membership.clinic_id))
    )
  );
create policy "Users can update their own profile"
  on public.profiles for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

create policy "Members can read clinic memberships"
  on public.clinic_memberships for select to authenticated
  using (
    user_id = (select auth.uid())
    or (select public.has_clinic_access(clinic_id))
  );
create policy "Clinic staff can read tutors"
  on public.tutors for select to authenticated
  using ((select public.has_clinic_access(
    clinic_id, array['owner', 'admin', 'vet', 'receptionist']
  )));
create policy "Clinic staff can create tutors"
  on public.tutors for insert to authenticated
  with check (
    (select public.has_clinic_access(
      clinic_id, array['owner', 'admin', 'vet', 'receptionist']
    ))
    and created_by = (select auth.uid())
  );
create policy "Clinic staff can update tutors"
  on public.tutors for update to authenticated
  using ((select public.has_clinic_access(
    clinic_id, array['owner', 'admin', 'vet', 'receptionist']
  )))
  with check ((select public.has_clinic_access(
    clinic_id, array['owner', 'admin', 'vet', 'receptionist']
  )));
create policy "Clinic staff can delete tutors"
  on public.tutors for delete to authenticated
  using ((select public.has_clinic_access(
    clinic_id, array['owner', 'admin', 'vet', 'receptionist']
  )));

create policy "Clinic staff can access pets"
  on public.pets for all to authenticated
  using ((select public.has_clinic_access(
    clinic_id, array['owner', 'admin', 'vet', 'receptionist']
  )))
  with check ((select public.has_clinic_access(
    clinic_id, array['owner', 'admin', 'vet', 'receptionist']
  )));

create policy "Clinical staff can read medical records"
  on public.medical_records for select to authenticated
  using ((select public.has_clinic_access(clinic_id, array['owner', 'admin', 'vet'])));
create policy "Clinical staff can create medical records"
  on public.medical_records for insert to authenticated
  with check (
    (select public.has_clinic_access(clinic_id, array['owner', 'admin', 'vet']))
    and created_by = (select auth.uid())
    and exists (
      select 1
      from public.clinic_memberships veterinarian_membership
      where veterinarian_membership.clinic_id = medical_records.clinic_id
        and veterinarian_membership.user_id = medical_records.veterinarian_id
        and veterinarian_membership.status = 'active'
        and veterinarian_membership.role in ('owner', 'admin', 'vet')
    )
  );
create policy "Clinical staff can update medical records"
  on public.medical_records for update to authenticated
  using ((select public.has_clinic_access(clinic_id, array['owner', 'admin', 'vet'])))
  with check (
    (select public.has_clinic_access(clinic_id, array['owner', 'admin', 'vet']))
    and exists (
      select 1
      from public.clinic_memberships veterinarian_membership
      where veterinarian_membership.clinic_id = medical_records.clinic_id
        and veterinarian_membership.user_id = medical_records.veterinarian_id
        and veterinarian_membership.status = 'active'
        and veterinarian_membership.role in ('owner', 'admin', 'vet')
    )
  );
create policy "Clinical staff can delete medical records"
  on public.medical_records for delete to authenticated
  using ((select public.has_clinic_access(clinic_id, array['owner', 'admin', 'vet'])));

create policy "Clinical staff can access exam file metadata"
  on public.exam_files for all to authenticated
  using ((select public.has_clinic_access(clinic_id, array['owner', 'admin', 'vet'])))
  with check ((select public.has_clinic_access(clinic_id, array['owner', 'admin', 'vet'])));

create function public.create_visit(
  clinic_id_input uuid,
  tutor_id_input uuid,
  pet_name_input text,
  species_input text,
  breed_input text,
  age_input integer,
  weight_input numeric,
  vaccination_date_input date,
  prescription_input text
)
returns table (pet_id uuid, medical_record_id uuid)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
  new_pet_id uuid;
  new_record_id uuid;
begin
  if current_user_id is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;

  if not public.has_clinic_access(clinic_id_input, array['owner', 'admin', 'vet']) then
    raise exception 'Insufficient clinical permissions' using errcode = '42501';
  end if;

  if pet_name_input is null or char_length(btrim(pet_name_input)) not between 1 and 100
    or species_input is null or char_length(btrim(species_input)) not between 1 and 80
    or age_input is null or age_input not between 0 and 30
    or weight_input is null or weight_input <= 0
    or prescription_input is null or char_length(btrim(prescription_input)) not between 1 and 2000
    or not exists (
      select 1
      from public.tutors tutor
      where tutor.id = tutor_id_input
        and tutor.clinic_id = clinic_id_input
    ) then
    raise exception 'Invalid visit data or tutor' using errcode = '22023';
  end if;

  insert into public.pets (
    clinic_id, tutor_id, name, species, breed, birth_date, weight_kg
  )
  values (
    clinic_id_input,
    tutor_id_input,
    btrim(pet_name_input),
    btrim(species_input),
    nullif(btrim(breed_input), ''),
    (current_date - make_interval(years => age_input))::date,
    weight_input
  )
  returning id into new_pet_id;

  insert into public.medical_records (
    clinic_id, pet_id, veterinarian_id, vaccination_date, prescription
  )
  values (
    clinic_id_input,
    new_pet_id,
    current_user_id,
    vaccination_date_input,
    btrim(prescription_input)
  )
  returning id into new_record_id;

  return query select new_pet_id, new_record_id;
end;
$$;

revoke all on function public.create_visit(
  uuid, uuid, text, text, text, integer, numeric, date, text
) from public, anon;
grant execute on function public.create_visit(
  uuid, uuid, text, text, text, integer, numeric, date, text
) to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('exam-files', 'exam-files', false, 10485760, array['application/pdf'])
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create function public.can_access_exam_storage_path(
  storage_path text,
  allowed_roles text[]
)
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  clinic_folder text := split_part(storage_path, '/', 1);
  record_folder text := split_part(storage_path, '/', 2);
  file_name text := split_part(storage_path, '/', 3);
begin
  if clinic_folder !~ '^[0-9a-fA-F]{8}-([0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}$'
    or record_folder !~ '^[0-9a-fA-F]{8}-([0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}$'
    or file_name !~ '^[0-9a-fA-F]{8}-([0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}\.pdf$'
    or split_part(storage_path, '/', 4) <> '' then
    return false;
  end if;

  return public.has_clinic_access(clinic_folder::uuid, allowed_roles)
    and exists (
      select 1
      from public.medical_records record
      where record.clinic_id = clinic_folder::uuid
        and record.id = record_folder::uuid
    );
end;
$$;

revoke all on function public.can_access_exam_storage_path(text, text[]) from public, anon;
grant execute on function public.can_access_exam_storage_path(text, text[]) to authenticated;

create policy "Clinical staff can read exam PDFs"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'exam-files'
    and (select public.can_access_exam_storage_path(name, array['owner', 'admin', 'vet']))
  );
create policy "Clinical staff can upload exam PDFs"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'exam-files'
    and (select public.can_access_exam_storage_path(name, array['owner', 'admin', 'vet']))
  );
create policy "Clinical staff can update exam PDFs"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'exam-files'
    and (select public.can_access_exam_storage_path(name, array['owner', 'admin', 'vet']))
  )
  with check (
    bucket_id = 'exam-files'
    and (select public.can_access_exam_storage_path(name, array['owner', 'admin', 'vet']))
  );
create policy "Clinical staff can delete exam PDFs"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'exam-files'
    and (select public.can_access_exam_storage_path(name, array['owner', 'admin', 'vet']))
  );
