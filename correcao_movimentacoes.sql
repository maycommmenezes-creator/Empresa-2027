-- Executar somente no projeto existente, com perfis_acesso conforme o login atual.
-- Não altera cadastros nem permite escrita direta no histórico.
begin;
create or replace function public.emp2027_pode_ler_movimentos()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.perfis_acesso
    where usuario_id = (select auth.uid()) and ativo = true
      and perfil::text in ('administrador','editor','visualizador','admin','viewer'));
$$;
revoke all on function public.emp2027_pode_ler_movimentos() from public;
grant execute on function public.emp2027_pode_ler_movimentos() to authenticated;
alter table public.movimentacoes enable row level security;
grant select on public.movimentacoes to authenticated;
drop policy if exists emp2027_movimentos_leitura on public.movimentacoes;
create policy emp2027_movimentos_leitura on public.movimentacoes for select to authenticated using (public.emp2027_pode_ler_movimentos());
drop policy if exists emp2027_movimentos_limite on public.movimentacoes;
create policy emp2027_movimentos_limite on public.movimentacoes as restrictive for select to authenticated using (public.emp2027_pode_ler_movimentos());
commit;
