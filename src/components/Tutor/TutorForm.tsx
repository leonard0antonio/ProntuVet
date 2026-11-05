import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import InputMask from 'react-input-mask';
import DOMPurify from 'dompurify';

const tutorSchema = z.object({
  name: z.string().min(1, { message: 'Nome é obrigatório' }).max(100, { message: 'Nome não pode ter mais de 100 caracteres' }),
  cpf: z.string().refine(val => /^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(val), { message: 'CPF inválido' }),
  phone: z.string().refine(val => /^\(?\d{2}\)?\s?\d{5}-\d{4}$/.test(val), { message: 'Telefone inválido' }),
  email: z.string().email({ message: 'Email inválido' }),
  address: z.string().min(1, { message: 'Endereço é obrigatório' }),
  city: z.string().min(1, { message: 'Cidade é obrigatória' }),
  zip: z.string().refine(val => /^\d{8}$/.test(val), { message: 'CEP inválido (deve ter 8 dígitos)' }),
  tutorType: z.enum(['veterinario', 'cliente'], { message: 'Tipo inválido' }),
  crmv: z.string().refine(val => /^\d{7}$/.test(val), { message: 'CRMV deve conter 7 dígitos' }),
  password: z.string().min(6, { message: 'Senha deve ter ao menos 6 caracteres' }),
});

type TutorFormValues = z.infer<typeof tutorSchema>;

export const TutorForm: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TutorFormValues>({
    resolver: zodResolver(tutorSchema),
    mode: 'onSubmit',
  });

  const onSubmit = async (data: TutorFormValues) => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    alert('Cadastro realizado com sucesso');
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
                <InputMask
                                  mask="000.000.000-00"
                                  value={register('cpf')?.value || ''}
                                  onAccept={val => {
                                    if (val.length > 14) {
                                      return val.slice(0, 14);
                                    }
                                    return val;
                                  }}
                                  className={`form-input ${errors.cpf ? 'error' : ''}`}
                                  placeholder="000.000.000-00"
                                  aria-invalid={errors.cpf ? 'true' : 'false'}
                                  aria-describedby={errors.cpf ? 'cpf-error' : undefined}
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
                <InputMask
                                  mask="(00) 00000-0000"
                                  value={register('phone')?.value || ''}
                                  onAccept={val => {
                                    if (val.length > 15) {
                                      return val.slice(0, 15);
                                    }
                                    return val;
                                  }}
                                  className={`form-input ${errors.phone ? 'error' : ''}`}
                                  placeholder="(00) 00000-0000"
                                  aria-invalid={errors.phone ? 'true' : 'false'}
                                  aria-describedby={errors.phone ? 'phone-error' : undefined}
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
                <InputMask
                                  mask="00000000"
                                  value={register('zip')?.value || ''}
                                  onAccept={val => {
                                    if (val.length > 8) {
                                      return val.slice(0, 8);
                                    }
                                    return val;
                                  }}
                                  className={`form-input ${errors.zip ? 'error' : ''}`}
                                  placeholder="00000000"
                                  aria-invalid={errors.zip ? 'true' : 'false'}
                                  aria-describedby={errors.zip ? 'zip-error' : undefined}
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

              <div className="form-group">
                <label htmlFor="tutorType" className="form-label form-label-required">Tipo de Tutor</label>
                <select
                                  id="tutorType"
                                  {...register('tutorType', { required: 'Tipo é obrigatório' })}
                                  className={`form-select ${errors.tutorType ? 'error' : ''}`}
                                  aria-invalid={errors.tutorType ? 'true' : 'false'}
                                  aria-describedby={errors.tutorType ? 'tutorType-error' : undefined}
                >
                                  <option value="">Selecione</option>
                                  <option value="veterinario">Veterinário</option>
                                  <option value="cliente">Cliente</option>
                </select>
                {errors.tutorType && (
                                  <p id="tutorType-error" className="form-error" role="alert">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                      <circle cx="12" cy="12" r="10" />
                                      <line x1="12" y1="8" x2="12" y2="12" />
                                      <line x1="12" y1="16" x2="12.01" y2="16" />
                                    </svg>
                                    {errors.tutorType.message}
                                  </p>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="crmv" className="form-label form-label-required">CRMV</label>
                <input
                                  id="crmv"
                                  type="text"
                                  {...register('crmv', { required: 'CRMV é obrigatório' })}
                                  className={`form-input ${errors.crmv ? 'error' : ''}`}
                                  placeholder="1234567"
                                  aria-invalid={errors.crmv ? 'true' : 'false'}
                                  aria-describedby={errors.crmv ? 'crmv-error' : undefined}
                />
                {errors.crmv && (
                                  <p id="crmv-error" className="form-error" role="alert">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                      <circle cx="12" cy="12" r="10" />
                                      <line x1="12" y1="8" x2="12" y2="12" />
                                      <line x1="12" y1="16" x2="12.01" y2="16" />
                                    </svg>
                                    {errors.crmv.message}
                                  </p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label form-label-required">Senha</label>
                <div className="input-wrapper">
                                  <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="new-password"
                                    {...register('password', { required: 'Senha é obrigatória' })}
                                    className={`form-input ${errors.password ? 'error' : ''}`}
                                    placeholder="••••••••"
                                    aria-invalid={errors.password ? 'true' : 'false'}
                                    aria-describedby={errors.password ? 'password-error' : undefined}
                                  />
                                  <button
                                    type="button"
                                    className="input-toggle"
                                    onClick={() => setShowPassword(prev => !prev)}
                                    aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                                    aria-pressed={showPassword}
                                  >
                                    {showPassword ? (
                                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                        <line x1="1" y1="1" x2="23" y2="23" />
                                      </svg>
                                    ) : (
                                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                        <circle cx="12" cy="12" r="3" />
                                      </svg>
                                    )}
                                  </button>
                </div>
                {errors.password && (
                                  <p id="password-error" className="form-error" role="alert">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                      <circle cx="12" cy="12" r="10" />
                                      <line x1="12" y1="8" x2="12" y2="12" />
                                      <line x1="12" y1="16" x2="12.01" y2="16" />
                                    </svg>
                                    {errors.password.message}
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