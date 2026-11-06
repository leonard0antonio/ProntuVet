import { useState } from 'react';
import { useForm, type FieldPath, type FieldValues } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

export type BaseFormProps<T extends FieldValues> = {
  schema: z.ZodSchema<T>;
  onSubmit: (data: T) => Promise<void>;
  className?: string;
};

export const BaseForm = <T extends FieldValues>({ schema, onSubmit, className = '' }: BaseFormProps<T>) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<T>({
    resolver: zodResolver(schema),
    mode: 'onSubmit',
  });

  const onSubmitWithLoading = async (data: T) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className={className} onSubmit={handleSubmit(onSubmitWithLoading)} noValidate>
      {Object.entries(errors).map(([field, error]) => (
        <div key={field} style={{ marginBottom: '10px' }}>
          <label htmlFor={field}>{field.charAt(0).toUpperCase() + field.slice(1)}</label>
          <div style={{ position: 'relative', marginBottom: '10px' }}>
            <input
              id={field}
              type={field === 'password' && !showPassword ? 'password' : 'text'}
              {...register(field as FieldPath<T>)}
              style={{ width: '100%', marginBottom: '5px' }}
            />
            {field === 'password' && (
              <button
                type='button'
                onClick={() => setShowPassword(prev => !prev)}
                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)' }}
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showPassword ? '👁️' : '🔒'}
              </button>
            )}
          </div>
          {error?.message && <p style={{ color: 'red' }}>{String(error.message)}</p>}
        </div>
      ))}

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
          'Enviar'
        )}
      </button>
    </form>
  );
};