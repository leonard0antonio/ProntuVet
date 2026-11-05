import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zResolver } from '@hookform/resolvers/zod';

const loginSchema = z.object({
  email: z.string().email({ message: 'Email inválido' }),
  password: z.string().min(6, { message: 'Senha deve ter ao menos 6 caracteres' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zResolver(loginSchema),
    mode: 'onSubmit',
  });

  const onSubmit = async (data: LoginFormValues) => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    alert('Login successful');
  };

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px' }}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div>
          <label htmlFor='email'>Email</label>
          <input
            id='email'
            type='email'
            {...register('email', { required: 'Email é obrigatório' })} 
            style={{ width: '100%', marginBottom: '10px' }}
          />
          {errors.email && <p style={{ color: 'red' }}>{errors.email.message}</p>}
        </div>

        <div>
          <label htmlFor='password'>Senha</label>
          <div style={{ position: 'relative' }}>
            <input
              id='password'
              type={showPassword ? 'text' : 'password'}
              {...register('password', { required: 'Senha é obrigatória' })} 
              style={{ width: '100%', marginBottom: '10px' }}
            />
            <button
              type='button'
              onClick={() => setShowPassword(prev => !prev)}
              style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)' }}
            >
              {showPassword ? '👁️' : '🔒'}
            </button>
          </div>
          {errors.password && <p style={{ color: 'red' }}>{errors.password.message}</p>}
        </div>

        <div>
          <button
            type='submit'
            disabled={isSubmitting}
            style={{
              width: '100%',
              padding: '10px',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              opacity: isSubmitting ? 0.5 : 1,
            }}
          >
            {isSubmitting ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg
                                  width={20}
                                  height={20}
                  viewBox="0 0 24 24"
                  style={{ marginRight: '8px' }}
                >
                                  <circle cx={12} cy={12} r={10} stroke="currentColor" strokeWidth={4} fill="none" />
                                  <path d="M4 12a8 8 0 018-8v8z" stroke="currentColor" strokeWidth={4} fill="none" />
                </svg>
                Carregando...
              </span>
            ) : (
              'Entrar'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};