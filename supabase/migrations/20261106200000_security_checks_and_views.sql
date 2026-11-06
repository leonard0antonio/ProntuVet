-- ==============================================================================
-- Migração: Segurança em Banco de Dados (Check Constraints & Ocultação Estrutural)
-- Aplicada às tabelas do ProntuVet: tutors, pets e medical_records
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- Exercício 1: Implementação de Restrições de Validação (Check Constraints)
-- Garante que dados inválidos sejam bloqueados pelo PostgreSQL na camada de persistência.
-- ------------------------------------------------------------------------------

-- 1.1 Segurança em Pets: peso biológico plausível e nascimento não futuro
ALTER TABLE public.pets
  DROP CONSTRAINT IF EXISTS chk_pets_weight_positive,
  DROP CONSTRAINT IF EXISTS chk_pets_birth_date_past;

ALTER TABLE public.pets
  ADD CONSTRAINT chk_pets_weight_positive
    CHECK (weight_kg IS NULL OR (weight_kg > 0 AND weight_kg <= 500));

ALTER TABLE public.pets
  ADD CONSTRAINT chk_pets_birth_date_past
    CHECK (birth_date IS NULL OR birth_date <= current_date);

-- 1.2 Segurança em Tutors: validação de e-mail e formato de telefone
ALTER TABLE public.tutors
  DROP CONSTRAINT IF EXISTS chk_tutors_email_format,
  DROP CONSTRAINT IF EXISTS chk_tutors_phone_format;

ALTER TABLE public.tutors
  ADD CONSTRAINT chk_tutors_email_format
    CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

ALTER TABLE public.tutors
  ADD CONSTRAINT chk_tutors_phone_format
    CHECK (phone IS NULL OR char_length(regexp_replace(phone, '\D', '', 'g')) BETWEEN 8 AND 15);

-- 1.3 Segurança em Medical Records: bloqueio de consulta no futuro distante
-- e obrigatoriedade de ter conteúdo clínico (diagnóstico ou prescrição)
ALTER TABLE public.medical_records
  DROP CONSTRAINT IF EXISTS chk_medical_records_visit_not_future,
  DROP CONSTRAINT IF EXISTS chk_medical_records_has_content;

ALTER TABLE public.medical_records
  ADD CONSTRAINT chk_medical_records_visit_not_future
    CHECK (visit_at <= now() + interval '10 minutes');

ALTER TABLE public.medical_records
  ADD CONSTRAINT chk_medical_records_has_content
    CHECK (
      (diagnosis IS NOT NULL AND char_length(btrim(diagnosis)) > 0)
      OR (prescription IS NOT NULL AND char_length(btrim(prescription)) > 0)
    );


-- ------------------------------------------------------------------------------
-- Exercício 2: Criação de Views para Ocultação Estrutural (Princípio do Menor Privilégio)
-- Segmenta os dados sensíveis (como CPF completo, endereço e histórico clínico)
-- criando visões seguras para a equipe de atendimento/recepção.
-- ------------------------------------------------------------------------------

-- 2.1 View para Atendimento/Recepção de Tutores:
-- Oculta endereço completo e mascara o CPF, permitindo contato telefônico e conferência segura
CREATE OR REPLACE VIEW public.vw_tutors_atendimento
WITH (security_invoker = true) AS
SELECT
  t.id,
  t.clinic_id,
  t.full_name,
  t.phone,
  t.email,
  CASE
    WHEN t.cpf IS NOT NULL AND char_length(t.cpf) = 11 THEN
      '***.***.***-' || right(t.cpf, 2)
    ELSE
      'Não informado'
  END AS cpf_mascarado,
  t.created_at
FROM public.tutors t;

-- 2.2 View para Atendimento de Pets:
-- Permite visualizar cadastro básico do animal para recepção sem expor prontuários confidenciais
CREATE OR REPLACE VIEW public.vw_pets_atendimento
WITH (security_invoker = true) AS
SELECT
  p.id,
  p.clinic_id,
  p.tutor_id,
  p.name,
  p.species,
  p.breed,
  p.birth_date,
  p.weight_kg,
  p.created_at
FROM public.pets p;

-- 2.3 Atribuição de permissões (Least Privilege)
-- Concede acesso às Views aos usuários autenticados (respeitando o isolamento por clínica via RLS)
GRANT SELECT ON public.vw_tutors_atendimento TO authenticated;
GRANT SELECT ON public.vw_pets_atendimento TO authenticated;

