-- Evita exposição de dados de carteiras anteriores em movimentações de transferência.
BEGIN;
DROP POLICY IF EXISTS movimentos_restricao_grupo ON public.movimentacoes;
CREATE POLICY movimentos_restricao_grupo ON public.movimentacoes AS RESTRICTIVE FOR SELECT TO authenticated USING (
 public.perfil_atual() = 'administrador' OR (
 EXISTS (SELECT 1 FROM public.empresas e WHERE e.id=movimentacoes.empresa_id AND public.pode_acessar_grupo(e.grupo))
 AND (detalhes->'anterior' IS NULL OR public.pode_acessar_grupo(detalhes->'anterior'->>'grupo'))
 AND (detalhes->'novo' IS NULL OR public.pode_acessar_grupo(detalhes->'novo'->>'grupo'))
 AND (detalhes->'anterior' IS NOT NULL OR detalhes->'novo' IS NOT NULL)
 ));
COMMIT;
