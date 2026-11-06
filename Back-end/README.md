# ProntuVet local mock backend and Supabase schema

This folder contains a browser-only mock of the planned Supabase boundary. It uses
`localStorage` and React only; it is for local UI testing and is not an API server
or a security boundary.

The Supabase database schema, tenant constraints, RLS policies, and private exam
file bucket are prepared in
[`supabase/migrations/20261106190000_initial_schema.sql`](../supabase/migrations/20261106190000_initial_schema.sql).
The React application still uses the local mock; applying the migration does not
switch the UI to Supabase.

## Prepare a Supabase project

1. Create a Supabase project and install the Supabase CLI.
2. Link this repository to the project, then apply the migration:

   ```sh
   supabase login
   supabase link --project-ref YOUR_PROJECT_REF
   supabase db push
   ```

3. Keep the project's `service_role` key private. Never expose it in Vite
   environment variables or browser code. A future browser client must use only
   the publishable/anon key; authorization is enforced by RLS.
4. Configure Auth redirect URLs for the deployed application. If email
   confirmation is enabled, the UI must wait for verification before creating an
   authenticated clinic session.
5. Test tenant isolation with two users in different clinics before connecting
   the frontend. The `exam-files` bucket is private and limited to 10 MiB PDFs;
   Storage object paths must begin with the clinic UUID, such as
   `<clinic-uuid>/<medical-record-uuid>/<file-uuid>.pdf`.

The migration creates profiles from Auth user metadata (`full_name`) and provides
`create_clinic_with_owner(clinic_name, veterinarian_crmv, veterinarian_crmv_state)`
for atomic clinic-owner creation by an authenticated user. It also enforces
clinic-scoped foreign keys so pets, records, and exam metadata cannot reference
rows from a different clinic.

The Content Security Policy in `index.html` allows Supabase-hosted HTTPS and
Realtime WebSocket connections. If the project uses a custom Supabase domain,
add that exact origin to `connect-src` before deployment.

## Demo login

- Email: `vet@prontuvet.local`
- Password: `ProntuVet123!`

The demo clinic and user are created on the first successful login. The data tables
are initialized as empty arrays on first use. Alternatively, the login screen lets
you create a clinic owner account; the account, clinic, profile, and membership are
then persisted locally.

## Example

The React app already wraps its routes with `AuthProvider`. In a component, access
the current account and create a clinic like this:

```tsx
const { signUp, clinicId, user } = useAuth();
await signUp({
  fullName: 'Ana Veterinária',
  clinicName: 'Clínica Exemplo',
  email: 'ana@example.test',
  password: 'SenhaCom8Caracteres!',
});
```

The application adapter is exported from `src/services/api.ts` and is what the
existing React hooks use. It exposes Supabase-shaped async operations backed by
these local services. For direct domain-service calls, create a tutor with
frontend-style camelCase input:

```ts
const tutor = await tutorsApi.create({
  clinicId: DEMO_CLINIC_ID,
  fullName: 'Maria Silva',
  cpf: '12345678900',
});
```

For a medical record, create a pet row for the active clinic first; the mock
enforces clinic membership and the pet/veterinarian relationships:

```ts
const record = await medicalRecordsApi.create({
  clinicId: DEMO_CLINIC_ID,
  petId: existingPetId,
  veterinarianId: DEMO_USER_ID,
  diagnosis: 'Consulta de rotina',
});
```

All domain operations simulate 500–1000 ms of network latency. Tutor deletion
fails with a foreign-key-style error when that tutor still has pets. Medical-record
deletion similarly fails while exam-file rows reference the record.

`localStorage` is user-editable and this mock cannot provide real authentication,
tenant isolation, or data confidentiality. Never use these credentials or this
implementation in production. The schema migration is a database foundation,
not a completed frontend integration: replace the storage and mock auth adapters
with Supabase Auth, queries, and RLS-protected tables before deployment.
