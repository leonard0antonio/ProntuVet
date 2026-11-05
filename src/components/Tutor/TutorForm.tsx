import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zResolver } from '@hookform/resolvers/zod';
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
    resolver: zResolver(tutorSchema),
    mode: 'onSubmit',
  });

  const onSubmit = async (data: TutorFormValues) => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    alert('Cadastro realizado com sucesso');
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h2>Cadastro de Tutor</h2>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div>
          <label htmlFor='name'>Nome completo</label>
          <input
            id='name'
            type='text'
            {...register('name', { required: 'Nome é obrigatório' })} 
            style={{ width: '100%', marginBottom: '10px' }}
          />
          {errors.name && <p style={{ color: 'red' }}>{errors.name.message}</p>}
        </div>

        <div>
          <label htmlFor='cpf'>CPF</label>
          <InputMask
            mask="000.000.000-00"
            value={register('cpf')?.value || ''}
            onAccept={val => {
              if (val.length > 14) {
                return val.slice(0, 14);
              }
              return val;
            }}
            style={{ width: '100%', marginBottom: '10px' }}
          />
          {errors.cpf && <p style={{ color: 'red' }}>{errors.cpf.message}</p>}
        </div>

        <div>
          <label htmlFor='phone'>Telefone</label>
          <InputMask
            mask="(00) 00000-0000"
            value={register('phone')?.value || ''}
            onAccept={val => {
              if (val.length > 15) {
                return val.slice(0, 15);
              }
              return val;
            }}
            style={{ width: '100%', marginBottom: '10px' }}
          />
          {errors.phone && <p style={{ color: 'red' }}>{errors.phone.message}</p>}
        </div>

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
          <label htmlFor='address'>Endereço</label>
          <input
            id='address'
            type='text'
            {...register('address', { required: 'Endereço é obrigatório' })} 
            style={{ width: '100%', marginBottom: '10px' }}
          />
          {errors.address && <p style={{ color: 'red' }}>{errors.address.message}</p>}
        </div>

        <div>
          <label htmlFor='city'>Cidade</label>
          <input
            id='city'
            type='text'
            {...register('city', { required: 'Cidade é obrigatória' })} 
            style={{ width: '100%', marginBottom: '10px' }}
          />
          {errors.city && <p style={{ color: 'red' }}>{errors.city.message}</p>}
        </div>

        <div>
          <label htmlFor='zip'>CEP</label>
          <InputMask
            mask="00000000"
            value={register('zip')?.value || ''}
            onAccept={val => {
              if (val.length > 8) {
                return val.slice(0, 8);
              }
              return val;
            }}
            style={{ width: '100%', marginBottom: '10px' }}
          />
          {errors.zip && <p style={{ color: 'red' }}>{errors.zip.message}</p>}
        </div>

        <div>
          <label htmlFor='tutorType'>Tipo de Tutor</label>
          <select
            id='tutorType'
            {...register('tutorType', { required: 'Tipo é obrigatório' })} 
            style={{ width: '100%', marginBottom: '10px' }}
          >
            <option value='veterinario'>Veterinário</option>
            <option value='cliente'>Cliente</option>
          </select>
          {errors.tutorType && <p style={{ color: 'red' }}>{errors.tutorType.message}</p>}
        </div>

        <div>
          <label htmlFor='crmv'>CRMV</label>
          <input
            id='crmv'
            type='text'
            {...register('crmv', { required: 'CRMV é obrigatório' })} 
            style={{ width: '100%', marginBottom: '10px' }}
          />
          {errors.crmv && <p style={{ color: 'red' }}>{errors.crmv.message}</p>}
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
              'Cadastrar'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};