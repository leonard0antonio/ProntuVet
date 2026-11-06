import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useToast } from '../../components/Toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../Back-end/src/features/auth';

const loginSchema = z.object({
  email: z.string().email({ message: 'Email inválido' }),
  password: z.string().min(6, { message: 'Senha deve ter ao menos 6 caracteres' }),
});

const signUpSchema = loginSchema.extend({
  fullName: z.string().trim().min(2, { message: 'Informe seu nome completo' }),
  clinicName: z.string().trim().min(2, { message: 'Informe o nome da clínica' }),
  password: z.string().min(8, { message: 'A senha deve ter ao menos 8 caracteres' }),
});

type LoginFormValues = {
  email: string;
  password: string;
  fullName?: string;
  clinicName?: string;
};

export const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const { signIn, signUp } = useAuth();

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<LoginFormValues>({
    mode: 'onSubmit',
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsSubmitting(true);
    try {
      if (isSignUp) {
        const result = signUpSchema.safeParse(data);
        if (!result.success) {
          result.error.issues.forEach(issue => {
            const field = issue.path[0];
            if (field === 'email' || field === 'password' || field === 'fullName' || field === 'clinicName') {
              setError(field, { type: 'manual', message: issue.message });
            }
          });
          return;
        }

        await signUp(result.data);
        showSuccess('Clínica cadastrada com sucesso!', 'Sua conta já está pronta para uso');
      } else {
        const result = loginSchema.safeParse(data);
        if (!result.success) {
          result.error.issues.forEach(issue => {
            const field = issue.path[0];
            if (field === 'email' || field === 'password') {
              setError(field, { type: 'manual', message: issue.message });
            }
          });
          return;
        }

        await signIn(result.data.email, result.data.password);
        showSuccess('Login realizado com sucesso!', 'Bem-vindo ao ProntuVet');
      }
      navigate('/');
    } catch (error) {
      if (error instanceof Error && error.message === 'Invalid login credentials') {
        showError('Credenciais inválidas', 'Verifique seu email e senha');
      } else {
        showError(
          isSignUp ? 'Erro ao cadastrar clínica' : 'Erro ao fazer login',
          error instanceof Error ? error.message : 'Tente novamente mais tarde',
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="login-logo" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <h1 className="login-title">{isSignUp ? 'Cadastre sua clínica' : 'Bem-vindo ao ProntuVet'}</h1>
            <p className="login-subtitle">
              {isSignUp ? 'Crie sua conta de acesso para começar' : 'Faça login para acessar o sistema'}
            </p>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="login-form">
            {isSignUp && (
              <>
                <div className="form-group">
                  <label htmlFor="fullName" className="form-label form-label-required">Seu nome</label>
                  <input
                    id="fullName"
                    type="text"
                    autoComplete="name"
                    {...register('fullName', { required: 'Informe seu nome completo' })}
                    className={`form-input ${errors.fullName ? 'error' : ''}`}
                    placeholder="Nome do responsável"
                    aria-invalid={errors.fullName ? 'true' : 'false'}
                    aria-describedby={errors.fullName ? 'fullName-error' : undefined}
                  />
                  {errors.fullName && <p id="fullName-error" className="form-error" role="alert">{errors.fullName.message}</p>}
                </div>
                <div className="form-group">
                  <label htmlFor="clinicName" className="form-label form-label-required">Nome da clínica</label>
                  <input
                    id="clinicName"
                    type="text"
                    autoComplete="organization"
                    {...register('clinicName', { required: 'Informe o nome da clínica' })}
                    className={`form-input ${errors.clinicName ? 'error' : ''}`}
                    placeholder="Clínica Veterinária"
                    aria-invalid={errors.clinicName ? 'true' : 'false'}
                    aria-describedby={errors.clinicName ? 'clinicName-error' : undefined}
                  />
                  {errors.clinicName && <p id="clinicName-error" className="form-error" role="alert">{errors.clinicName.message}</p>}
                </div>
              </>
            )}
            <div className="form-group">
              <label htmlFor="email" className="form-label form-label-required">Email</label>
              <div className="input-wrapper">
                <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                  <rect x="2" y="4" width="20" height="16" rx="2" />
                                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
                <input
                                  id="email"
                                  type="email"
                                  autoComplete="email"
                                  {...register('email', { required: 'Email é obrigatório' })}
                                  className={`form-input ${errors.email ? 'error' : ''}`}
                                  placeholder="seu@email.com"
                                  aria-invalid={errors.email ? 'true' : 'false'}
                                  aria-describedby={errors.email ? 'email-error' : undefined}
                />
              </div>
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

            <div className="form-group">
              <label htmlFor="password" className="form-label form-label-required">Senha</label>
              <div className="input-wrapper">
                <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <input
                                  id="password"
                                  type={showPassword ? 'text' : 'password'}
                                  autoComplete="current-password"
                                  {...register('password', {
                                    required: 'Senha é obrigatória',
                                    minLength: {
                                      value: isSignUp ? 8 : 6,
                                      message: `Senha deve ter ao menos ${isSignUp ? 8 : 6} caracteres`,
                                    },
                                  })}
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

            <div className="form-group">
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary btn-lg"
                style={{ width: '100%' }}
              >
                {isSubmitting ? (
                                  <>
                                    <span className="spinner" aria-hidden="true"></span>
                                    {isSignUp ? 'Cadastrando...' : 'Entrando...'}
                                  </>
                ) : (
                                  isSignUp ? 'Criar Conta' : 'Entrar no Sistema'
                )}
              </button>
            </div>
          </form>
          <div className="login-footer">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                setIsSignUp(current => !current);
                clearErrors();
              }}
            >
              {isSignUp ? 'Já tem cadastro? Entrar' : 'Cadastrar uma clínica'}
            </button>
          </div>
          <div className="login-footer">
            <p>ProntuVet - Sistema de Prontuário Eletrônico Veterinário</p>
          </div>
        </div>
      </div>
    </div>
  );
};