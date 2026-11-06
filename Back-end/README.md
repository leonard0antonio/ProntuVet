# ProntuVet local mock backend

This folder contains a browser-only mock of the planned Supabase boundary. It uses
`localStorage` and React only; it is for local UI testing and is not an API server
or a security boundary.

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
implementation in production. Replace the storage and mock auth adapters with
Supabase Auth, queries, and RLS-protected tables before deployment.
