import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { useToast } from '../Toast';
import { useCreateProntuario, useTutors } from '../../hooks/useApi';

const prontuarioSchema = z.object({
  tutorId: z.string().min(1, { message: 'Selecione um tutor' }),
  petName: z.string().min(1, { message: 'Nome do pet é obrigatório' }).max(100, { message: 'Nome do pet não pode ter mais de 100 caracteres' }),
  species: z.enum(['cachorro', 'gato', 'coelho', 'hamster', 'outro'], { message: 'Espécie inválida' }),
  breed: z.string().min(1, { message: 'Raça é obrigatória' }).max(100, { message: 'Raça não pode ter mais de 100 caracteres' }),
  age: z.number().min(0, { message: 'Idade deve ser maior ou igual a 0' }).max(30, { message: 'Idade não pode ser maior que 30' }),
  weight: z.number().min(0.1, { message: 'Peso deve ser maior que 0' }).max(30, { message: 'Peso não pode ser maior que 30kg' }),
  vaccinationDate: z.string().refine(val => !isNaN(Date.parse(val)), { message: 'Data de vacinação inválida' }),
  prescription: z.string().min(1, { message: 'Prescrição é obrigatória' }).max(2000, { message: 'Prescrição não pode ter mais de 2000 caracteres' }),
  examFiles: z.custom<FileList>().optional().refine(
    files => !files || files.length <= 5,
    'Anexe no máximo 5 arquivos por atendimento',
  ).refine(
    files => !files || Array.from(files).every(file =>
      file.type === 'application/pdf' && file.size <= 10 * 1024 * 1024,
    ),
    'Cada anexo deve ser um PDF de até 10 MB',
  ),
});

type ProntuarioFormValues = z.infer<typeof prontuarioSchema>;

export const ProntuarioForm: React.FC = () => {
  const { showSuccess, showError } = useToast();
  const { data: tutors, isLoading: tutorsLoading, error: tutorsError } = useTutors();
  const { mutate: createProntuario, isLoading: isSaving } = useCreateProntuario();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProntuarioFormValues>({
    resolver: zodResolver(prontuarioSchema),
    mode: 'onSubmit',
  });

      const onSubmit = async (data: ProntuarioFormValues) => {
        try {
          await createProntuario({
            ...data,
            examFiles: Array.from(data.examFiles ?? []),
          });
          showSuccess('Prontuário salvo', 'O pet e o atendimento foram salvos');
        } catch (error: unknown) {
          const message =
            error instanceof Error
              ? error.message
              : typeof error === 'object' && error !== null && 'message' in error
              ? String((error as { message: unknown }).message)
              : typeof error === 'string'
              ? error
              : 'Tente novamente.';

          showError('Não foi possível salvar o prontuário', message);
        }
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
            <div className="form-group">
              <label htmlFor="tutorId" className="form-label form-label-required">Tutor</label>
              <select
                id="tutorId"
                {...register('tutorId', { required: 'Selecione um tutor' })}
                className={`form-select ${errors.tutorId ? 'error' : ''}`}
                disabled={tutorsLoading || tutors.length === 0}
                aria-invalid={errors.tutorId ? 'true' : 'false'}
                aria-describedby={errors.tutorId ? 'tutorId-error' : undefined}
              >
                <option value="">
                  {tutorsLoading ? 'Carregando tutores...' : 'Selecione o tutor'}
                </option>
                {tutors.map(tutor => (
                  <option key={tutor.id} value={tutor.id}>{tutor.name}</option>
                ))}
              </select>
              {errors.tutorId && (
                <p id="tutorId-error" className="form-error" role="alert">{errors.tutorId.message}</p>
              )}
              {tutorsError && (
                <p className="form-error" role="alert">Não foi possível carregar os tutores.</p>
              )}
              {!tutorsLoading && tutors.length === 0 && (
                <p className="form-hint">
                  Cadastre um tutor antes de criar o prontuário. <Link to="/tutores">Cadastrar tutor</Link>
                </p>
              )}
            </div>
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
              <label htmlFor="examFiles" className="form-label">Anexos de Exames (opcional)</label>
              <input
                id="examFiles"
                type="file"
                accept="application/pdf,.pdf"
                multiple
                {...register('examFiles')}
                className={`form-input ${errors.examFiles ? 'error' : ''}`}
                aria-invalid={errors.examFiles ? 'true' : 'false'}
                aria-describedby={errors.examFiles ? 'examFiles-error' : 'examFiles-hint'}
              />
              {errors.examFiles ? (
                <p id="examFiles-error" className="form-error" role="alert">
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="12" y1="8" x2="12" y2="12" />
                                    <line x1="12" y1="16" x2="12.01" y2="16" />
                                  </svg>
                                  {errors.examFiles.message}
                </p>
              ) : (
                <p id="examFiles-hint" className="form-hint">PDFs de até 10 MB cada, máximo de 5 arquivos por atendimento.</p>
              )}
            </div>
          </div>
          <div className="card-footer form-actions">
            <button
              type="submit"
              disabled={isSubmitting || isSaving || tutorsLoading || tutors.length === 0}
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