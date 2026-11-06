import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

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
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProntuarioFormValues>({
    resolver: zodResolver(prontuarioSchema),
    mode: 'onSubmit',
  });

      const onSubmit = async (_data: ProntuarioFormValues) => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    alert('Prontuário salvo com sucesso');
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div className="app-page-header">
        <div>
          <h1 className="app-page-title">Registro de Prontuário</h1>
          <p className="app-page-subtitle">Preencha os dados do atendimento veterinário</p>
        </div>
      </div>
      <div className="card">
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="card-body">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="petName" className="form-label form-label-required">Nome do Pet</label>
                <input
                                  id="petName"
                                  type="text"
                                  {...register('petName', { required: 'Nome do pet é obrigatório' })}
                                  className={`form-input ${errors.petName ? 'error' : ''}`}
                                  placeholder="Rex"
                                  aria-invalid={errors.petName ? 'true' : 'false'}
                                  aria-describedby={errors.petName ? 'petName-error' : undefined}
                />
                {errors.petName && (
                                  <p id="petName-error" className="form-error" role="alert">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                      <circle cx="12" cy="12" r="10" />
                                      <line x1="12" y1="8" x2="12" y2="12" />
                                      <line x1="12" y1="16" x2="12.01" y2="16" />
                                    </svg>
                                    {errors.petName.message}
                                  </p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="species" className="form-label form-label-required">Espécie</label>
                <select
                                  id="species"
                                  {...register('species', { required: 'Espécie é obrigatória' })}
                                  className={`form-select ${errors.species ? 'error' : ''}`}
                                  aria-invalid={errors.species ? 'true' : 'false'}
                                  aria-describedby={errors.species ? 'species-error' : undefined}
                >
                                  <option value="">Selecione</option>
                                  <option value="cachorro">Cachorro</option>
                                  <option value="gato">Gato</option>
                                  <option value="coelho">Coelho</option>
                                  <option value="hamster">Hamster</option>
                                  <option value="outro">Outro</option>
                </select>
                {errors.species && (
                                  <p id="species-error" className="form-error" role="alert">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                      <circle cx="12" cy="12" r="10" />
                                      <line x1="12" y1="8" x2="12" y2="12" />
                                      <line x1="12" y1="16" x2="12.01" y2="16" />
                                    </svg>
                                    {errors.species.message}
                                  </p>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="breed" className="form-label form-label-required">Raça</label>
                <input
                                  id="breed"
                                  type="text"
                                  {...register('breed', { required: 'Raça é obrigatória' })}
                                  className={`form-input ${errors.breed ? 'error' : ''}`}
                                  placeholder="Labrador"
                                  aria-invalid={errors.breed ? 'true' : 'false'}
                                  aria-describedby={errors.breed ? 'breed-error' : undefined}
                />
                {errors.breed && (
                                  <p id="breed-error" className="form-error" role="alert">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                      <circle cx="12" cy="12" r="10" />
                                      <line x1="12" y1="8" x2="12" y2="12" />
                                      <line x1="12" y1="16" x2="12.01" y2="16" />
                                    </svg>
                                    {errors.breed.message}
                                  </p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="age" className="form-label form-label-required">Idade (anos)</label>
                <input
                                  id="age"
                                  type="number"
                                  min="0"
                                  max="30"
                                  {...register('age', { required: 'Idade é obrigatória', valueAsNumber: true })}
                                  className={`form-input ${errors.age ? 'error' : ''}`}
                                  placeholder="3"
                                  aria-invalid={errors.age ? 'true' : 'false'}
                                  aria-describedby={errors.age ? 'age-error' : undefined}
                />
                {errors.age && (
                                  <p id="age-error" className="form-error" role="alert">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                      <circle cx="12" cy="12" r="10" />
                                      <line x1="12" y1="8" x2="12" y2="12" />
                                      <line x1="12" y1="16" x2="12.01" y2="16" />
                                    </svg>
                                    {errors.age.message}
                                  </p>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="weight" className="form-label form-label-required">Peso (kg)</label>
                <input
                                  id="weight"
                                  type="number"
                                  step="0.1"
                                  min="0.1"
                                  max="30"
                                  {...register('weight', { required: 'Peso é obrigatório', valueAsNumber: true })}
                                  className={`form-input ${errors.weight ? 'error' : ''}`}
                                  placeholder="25.0"
                                  aria-invalid={errors.weight ? 'true' : 'false'}
                                  aria-describedby={errors.weight ? 'weight-error' : undefined}
                />
                {errors.weight && (
                                  <p id="weight-error" className="form-error" role="alert">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                      <circle cx="12" cy="12" r="10" />
                                      <line x1="12" y1="8" x2="12" y2="12" />
                                      <line x1="12" y1="16" x2="12.01" y2="16" />
                                    </svg>
                                    {errors.weight.message}
                                  </p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="vaccinationDate" className="form-label form-label-required">Data da Vacina</label>
                <input
                                  id="vaccinationDate"
                                  type="date"
                                  {...register('vaccinationDate', { required: 'Data da vacina é obrigatória' })}
                                  className={`form-input ${errors.vaccinationDate ? 'error' : ''}`}
                                  aria-invalid={errors.vaccinationDate ? 'true' : 'false'}
                                  aria-describedby={errors.vaccinationDate ? 'vaccinationDate-error' : undefined}
                />
                {errors.vaccinationDate && (
                                  <p id="vaccinationDate-error" className="form-error" role="alert">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                      <circle cx="12" cy="12" r="10" />
                                      <line x1="12" y1="8" x2="12" y2="12" />
                                      <line x1="12" y1="16" x2="12.01" y2="16" />
                                    </svg>
                                    {errors.vaccinationDate.message}
                                  </p>
                )}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="prescription" className="form-label form-label-required">Prescrição</label>
              <textarea
                id="prescription"
                rows={5}
                {...register('prescription', { required: 'Prescrição é obrigatória' })}
                className={`form-textarea ${errors.prescription ? 'error' : ''}`}
                placeholder="Descreva a prescrição médica, dosagens, orientações..."
                aria-invalid={errors.prescription ? 'true' : 'false'}
                aria-describedby={errors.prescription ? 'prescription-error' : 'prescription-hint'}
              />
              {errors.prescription ? (
                <p id="prescription-error" className="form-error" role="alert">
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="12" y1="8" x2="12" y2="12" />
                                    <line x1="12" y1="16" x2="12.01" y2="16" />
                                  </svg>
                                  {errors.prescription.message}
                </p>
              ) : (
                <p id="prescription-hint" className="form-hint">Máximo de 2000 caracteres</p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="examAttachments" className="form-label form-label-required">Anexos de Exames</label>
              <input
                              id="examAttachments"
                              type="text"
                              {...register('examAttachments', { required: 'Adicione pelo menos um exame' })}
                              className={`form-input ${errors.examAttachments ? 'error' : ''}`}
                              placeholder="http://example.com/exame.pdf (separe múltiplas URLs por vírgula)"
                              aria-invalid={errors.examAttachments ? 'true' : 'false'}
                              aria-describedby={errors.examAttachments ? 'examAttachments-error' : 'examAttachments-hint'}
                            />
              {errors.examAttachments ? (
                <p id="examAttachments-error" className="form-error" role="alert">
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="12" y1="8" x2="12" y2="12" />
                                    <line x1="12" y1="16" x2="12.01" y2="16" />
                                  </svg>
                                  {errors.examAttachments.message}
                </p>
              ) : (
                <p id="examAttachments-hint" className="form-hint">Adicione URLs de exames (ex: http://example.com/exame.pdf)</p>
              )}
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
                                  Salvando...
                </>
              ) : (
                'Salvar Prontuário'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};