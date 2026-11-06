import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import InputMask from 'react-input-mask';
import { useToast } from '../../components/Toast';
import { useCreateTutor } from '../../hooks/useApi';

const tutorSchema = z.object({
  name: z.string().min(1, { message: 'Nome é obrigatório' }).max(100, { message: 'Nome não pode ter mais de 100 caracteres' }),
  cpf: z.string().refine(val => /^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(val), { message: 'CPF inválido' }),
  phone: z.string().refine(val => /^\(?\d{2}\)?\s?\d{5}-\d{4}$/.test(val), { message: 'Telefone inválido' }),
  email: z.string().email({ message: 'Email inválido' }),
  address: z.string().min(1, { message: 'Endereço é obrigatório' }),
  city: z.string().min(1, { message: 'Cidade é obrigatória' }),
  zip: z.string().refine(val => /^\d{8}$/.test(val), { message: 'CEP inválido (deve ter 8 dígitos)' }),
});

type TutorFormValues = z.infer<typeof tutorSchema>;

export const TutorForm: React.FC = () => {
  const { showSuccess, showError } = useToast();
  const { mutate: createTutor, isLoading: isSubmitting } = useCreateTutor();

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TutorFormValues>({
    resolver: zodResolver(tutorSchema),
    mode: 'onSubmit',
  });

  const onSubmit = async (data: TutorFormValues) => {
    try {
      await createTutor({ ...data, tutorType: 'cliente' });
      showSuccess('Tutor cadastrado com sucesso!', 'O tutor foi adicionado ao sistema');
    } catch (error) {
      const apiError = error as { status?: number; message?: string; errors?: Record<string, string[]> };
      if (apiError.status === 422 && apiError.errors) {
        // Handle validation errors - could set form errors here
        showError('Dados inválidos', 'Verifique os campos destacados');
      } else {
        showError('Erro ao cadastrar tutor', 'Tente novamente mais tarde');
      }
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="app-page-header">
        <div>
          <h1 className="app-page-title">Cadastro de Tutor</h1>
          <p className="app-page-subtitle">Preencha os dados do tutor para cadastrar no sistema</p>
        </div>
      </div>
      <div className="card">
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="card-body">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name" className="form-label form-label-required">Nome completo</label>
                <input
                                  id="name"
                                  type="text"
                                  autoComplete="name"
                                  {...register('name', { required: 'Nome é obrigatório' })}
                                  className={`form-input ${errors.name ? 'error' : ''}`}
                                  placeholder="João da Silva"
                                  aria-invalid={errors.name ? 'true' : 'false'}
                                  aria-describedby={errors.name ? 'name-error' : undefined}
                />
                {errors.name && (
                                  <p id="name-error" className="form-error" role="alert">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                      <circle cx="12" cy="12" r="10" />
                                      <line x1="12" y1="8" x2="12" y2="12" />
                                      <line x1="12" y1="16" x2="12.01" y2="16" />
                                    </svg>
                                    {errors.name.message}
                                  </p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="cpf" className="form-label form-label-required">CPF</label>
                <Controller
                  name="cpf"
                  control={control}
                  render={({ field }) => {
                    const { ref, ...inputProps } = field;
                    return (
                      <InputMask
                        {...inputProps}
                        inputRef={ref}
                        id="cpf"
                        mask="999.999.999-99"
                        value={field.value ?? ''}
                        className={`form-input ${errors.cpf ? 'error' : ''}`}
                        placeholder="000.000.000-00"
                        aria-invalid={errors.cpf ? 'true' : 'false'}
                        aria-describedby={errors.cpf ? 'cpf-error' : undefined}
                      />
                    );
                  }}
                />
                {errors.cpf && (
                                  <p id="cpf-error" className="form-error" role="alert">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                      <circle cx="12" cy="12" r="10" />
                                      <line x1="12" y1="8" x2="12" y2="12" />
                                      <line x1="12" y1="16" x2="12.01" y2="16" />
                                    </svg>
                                    {errors.cpf.message}
                                  </p>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="phone" className="form-label form-label-required">Telefone</label>
                <Controller
                  name="phone"
                  control={control}
                  render={({ field }) => {
                    const { ref, ...inputProps } = field;
                    return (
                      <InputMask
                        {...inputProps}
                        inputRef={ref}
                        id="phone"
                        mask="(99) 99999-9999"
                        value={field.value ?? ''}
                        className={`form-input ${errors.phone ? 'error' : ''}`}
                        placeholder="(00) 00000-0000"
                        aria-invalid={errors.phone ? 'true' : 'false'}
                        aria-describedby={errors.phone ? 'phone-error' : undefined}
                      />
                    );
                  }}
                />
                {errors.phone && (
                                  <p id="phone-error" className="form-error" role="alert">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                      <circle cx="12" cy="12" r="10" />
                                      <line x1="12" y1="8" x2="12" y2="12" />
                                      <line x1="12" y1="16" x2="12.01" y2="16" />
                                    </svg>
                                    {errors.phone.message}
                                  </p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="email" className="form-label form-label-required">Email</label>
                <input
                                  id="email"
                                  type="email"
                                  autoComplete="email"
                                  {...register('email', { required: 'Email é obrigatório' })}
                                  className={`form-input ${errors.email ? 'error' : ''}`}
                                  placeholder="tutor@email.com"
                                  aria-invalid={errors.email ? 'true' : 'false'}
                                  aria-describedby={errors.email ? 'email-error' : undefined}
                />
                {errors.email && (
                                  <p id="email-error" className="form-error" role="alert">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                      <circle cx="12" cy="12" r="10" />
                                      <line x1="12" y1="8" x2="12" y2="12" />
                                      <line x1="12" y1="16" x2="12.01" y2="16" />
                                    </svg>
                                    {errors.email.message}
                                  </p>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="address" className="form-label form-label-required">Endereço</label>
                <input
                                  id="address"
                                  type="text"
                                  autoComplete="street-address"
                                  {...register('address', { required: 'Endereço é obrigatório' })}
                                  className={`form-input ${errors.address ? 'error' : ''}`}
                                  placeholder="Rua, número, complemento"
                                  aria-invalid={errors.address ? 'true' : 'false'}
                                  aria-describedby={errors.address ? 'address-error' : undefined}
                />
                {errors.address && (
                                  <p id="address-error" className="form-error" role="alert">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                      <circle cx="12" cy="12" r="10" />
                                      <line x1="12" y1="8" x2="12" y2="12" />
                                      <line x1="12" y1="16" x2="12.01" y2="16" />
                                    </svg>
                                    {errors.address.message}
                                  </p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="city" className="form-label form-label-required">Cidade</label>
                <input
                                  id="city"
                                  type="text"
                                  autoComplete="address-level2"
                                  {...register('city', { required: 'Cidade é obrigatória' })}
                                  className={`form-input ${errors.city ? 'error' : ''}`}
                                  placeholder="São Paulo"
                                  aria-invalid={errors.city ? 'true' : 'false'}
                                  aria-describedby={errors.city ? 'city-error' : undefined}
                />
                {errors.city && (
                                  <p id="city-error" className="form-error" role="alert">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                      <circle cx="12" cy="12" r="10" />
                                      <line x1="12" y1="8" x2="12" y2="12" />
                                      <line x1="12" y1="16" x2="12.01" y2="16" />
                                    </svg>
                                    {errors.city.message}
                                  </p>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="zip" className="form-label form-label-required">CEP</label>
                <Controller
                  name="zip"
                  control={control}
                  render={({ field }) => {
                    const { ref, ...inputProps } = field;
                    return (
                      <InputMask
                        {...inputProps}
                        inputRef={ref}
                        id="zip"
                        mask="99999999"
                        value={field.value ?? ''}
                        className={`form-input ${errors.zip ? 'error' : ''}`}
                        placeholder="00000000"
                        aria-invalid={errors.zip ? 'true' : 'false'}
                        aria-describedby={errors.zip ? 'zip-error' : undefined}
                      />
                    );
                  }}
                />
                {errors.zip && (
                                  <p id="zip-error" className="form-error" role="alert">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                      <circle cx="12" cy="12" r="10" />
                                      <line x1="12" y1="8" x2="12" y2="12" />
                                      <line x1="12" y1="16" x2="12.01" y2="16" />
                                    </svg>
                                    {errors.zip.message}
                                  </p>
                )}
              </div>

            </div>
          </div>
          <div className="card-footer form-actions">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary"
            >
              {isSubmitting ? (
                <>
                                  <span className="spinner" aria-hidden="true"></span>
                                  Cadastrando...
                </>
              ) : (
                'Cadastrar Tutor'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};