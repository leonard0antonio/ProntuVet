import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zResolver } from '@hookform/resolvers/zod';
import InputMask from 'react-input-mask';
import DOMPurify from 'dompurify';

const prontuarioSchema = z.object({
  petName: z.string().min(1, { message: 'Nome do pet é obrigatório' }).max(100, { message: 'Nome do pet não pode ter mais de 100 caracteres' }),
  species: z.enum(['cachorro', 'gato', 'coelho', 'hamster', 'outro'], { message: 'Espécie inválida' }),
  breed: z.string().min(1, { message: 'Raça é obrigatória' }).max(100, { message: 'Raça não pode ter mais de 100 caracteres' }),
  age: z.number().min(0, { message: 'Idade deve ser maior ou igual a 0' }).max(30, { message: 'Idade não pode ser maior que 30' }),
  weight: z.number().min(0.1, { message: 'Peso deve ser maior que 0' }).max(30, { message: 'Peso não pode ser maior que 30kg' }),
  vaccinationDate: z.string().refine(val => !isNaN(Date.parse(val)), { message: 'Data de vacinação inválida' }),
  prescription: z.string().min(1, { message: 'Prescrição é obrigatória' }).max(2000, { message: 'Prescrição não pode ter mais de 2000 caracteres' }),
  examAttachments: z.array(z.string().url({ message: 'Anexo deve ser uma URL válida' })).min(1, { message: 'Adicione pelo menos um exame' }),
});

type ProntuarioFormValues = z.infer<typeof prontuarioSchema>;

export const ProntuarioForm: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProntuarioFormValues>({
    resolver: zResolver(prontuarioSchema),
    mode: 'onSubmit',
  });

  const onSubmit = async (data: ProntuarioFormValues) => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    alert('Prontuário salvo com sucesso');
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h2>Registro de Prontuário</h2>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div>
          <label htmlFor='petName'>Nome do Pet</label>
          <input
            id='petName'
            type='text'
            {...register('petName', { required: 'Nome do pet é obrigatório' })} 
            style={{ width: '100%', marginBottom: '10px' }}
          />
          {errors.petName && <p style={{ color: 'red' }}>{errors.petName.message}</p>}
        </div>

        <div>
          <label htmlFor='species'>Espécie</label>
          <select
            id='species'
            {...register('species', { required: 'Espécie é obrigatória' })} 
            style={{ width: '100%', marginBottom: '10px' }}
          >
            <option value='cachorro'>Cachorro</option>
            <option value='gato'>Gato</option>
            <option value='coelho'>Coelho</option>
            <option value='hamster'>Hamster</option>
            <option value='outro'>Outro</option>
          </select>
          {errors.species && <p style={{ color: 'red' }}>{errors.species.message}</p>}
        </div>

        <div>
          <label htmlFor='breed'>Raça</label>
          <input
            id='breed'
            type='text'
            {...register('breed', { required: 'Raça é obrigatória' })} 
            style={{ width: '100%', marginBottom: '10px' }}
          />
          {errors.breed && <p style={{ color: 'red' }}>{errors.breed.message}</p>}
        </div>

        <div>
          <label htmlFor='age'>Idade (anos)</label>
          <input
            id='age'
            type='number'
            {...register('age', { required: 'Idade é obrigatória' })} 
            style={{ width: '100%', marginBottom: '10px' }}
          />
          {errors.age && <p style={{ color: 'red' }}>{errors.age.message}</p>}
        </div>

        <div>
          <label htmlFor='weight'>Peso (kg)</label>
          <input
            id='weight'
            type='number'
            step="0.1"
            {...register('weight', { required: 'Peso é obrigatório' })} 
            style={{ width: '100%', marginBottom: '10px' }}
          />
          {errors.weight && <p style={{ color: 'red' }}>{errors.weight.message}</p>}
        </div>

        <div>
          <label htmlFor='vaccinationDate'>Data da Vacina</label>
          <input
            id='vaccinationDate'
            type='date'
            {...register('vaccinationDate', { required: 'Data da vacina é obrigatória' })} 
            style={{ width: '100%', marginBottom: '10px' }}
          />
          {errors.vaccinationDate && <p style={{ color: 'red' }}>{errors.vaccinationDate.message}</p>}
        </div>

        <div>
          <label htmlFor='prescription'>Prescrição</label>
          <textarea
            id='prescription'
            rows="5"
            {...register('prescription', { required: 'Prescrição é obrigatória' })} 
            style={{ width: '100%', marginBottom: '10px' }}
          />
          {errors.prescription && <p style={{ color: 'red' }}>{errors.prescription.message}</p>}
        </div>

        <div>
          <label htmlFor='examAttachments'>Anexos de Exames</label>
          <input
            id='examAttachments'
            type="text"
            {...register('examAttachments', { required: 'Adicione pelo menos um exame' })} 
            style={{ width: '100%', marginBottom: '10px' }}
          />
          <small>Adicione URLs de exames (ex: http://example.com/exame.pdf)</small>
          {errors.examAttachments && <p style={{ color: 'red' }}>{errors.examAttachments.message}</p>}
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
                Salvando...
              </span>
            ) : (
              'Salvar Prontuário'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};