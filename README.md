# Empresas 2027 — Supabase + Vercel

Sistema web com login, permissões e dados centralizados. Inclui **251 cadastros iniciais** extraídos do arquivo Empresas_2027_Melhorado.html, sem modificar os valores de grupo, status ou observações. As divergências de origem permanecem para conferência.

## Papéis

- `admin`: leitura, cadastro, edição, exclusão permitida pelas regras do banco, importação inicial e gestão de permissões.
- `editor`: leitura, cadastro e edição; não altera usuários.
- `viewer`: consulta, pesquisa, relatórios e exportação; não edita.

As permissões são aplicadas **no Supabase via Row Level Security (RLS)**, não apenas escondendo botões no navegador. Toda inserção, edição e exclusão de empresas produz um registro de auditoria no servidor. O histórico inclui usuário autenticado, horário e versões anterior/nova. Não há botão de exclusão na interface para reduzir risco de remoção acidental.

## Publicação (primeira vez)

1. Crie um projeto em https://supabase.com/dashboard e guarde a **Project URL** e a chave pública **anon/publishable** (nunca a `service_role` ou chave secreta).
2. No SQL Editor do Supabase, execute `supabase/schema.sql` em um projeto novo. **Não execute cegamente em um banco com tabelas existentes.**
3. Em **Authentication → Providers → Email**, habilite autenticação por e-mail e senha. Desative cadastros públicos ("Allow new users to sign up") para que somente administradores do Supabase criem contas.
4. Em **Authentication → Users**, crie seu usuário administrador e configure a senha. No SQL Editor execute, substituindo o e-mail:

   ```sql
   insert into public.profiles(user_id,nome,role,ativo)
   select id,'Administrador','admin',true
   from auth.users where email='SEU_EMAIL@EXEMPLO.COM';
   ```

5. Copie `public/config.example.js` para `public/config.js` e preencha `supabaseUrl` e `supabaseAnonKey` com os valores públicos do projeto. **Não use chaves secretas.** O arquivo `config.js` fica público na hospedagem; a proteção real é o RLS.
6. Suba a pasta do projeto em um repositório privado do GitHub e importe-o em https://vercel.com/new. Nas configurações da Vercel, defina **Root Directory** como a raiz do projeto e **Output Directory** como `public`, com framework `Other`, sem comando de build.
7. Abra a URL HTTPS fornecida pela Vercel, entre com o administrador e acesse **Empresas → Importar JSON local** e selecione o arquivo `empresas-iniciais.json` incluído na raiz do pacote. O botão só importa se o banco estiver vazio. Confira o total de 251 registros e os grupos.
8. Para criar colaboradores, adicione usuários em **Supabase → Authentication → Users** e execute no SQL Editor:

   ```sql
   insert into public.profiles(user_id,nome,role,ativo)
   select id,'Nome do colaborador','editor',true
   from auth.users where email='COLABORADOR@EXEMPLO.COM';
   ```

   Use `viewer` no lugar de `editor` para acesso somente de leitura. O administrador também pode alterar função ou bloquear usuários na tela **Equipe e acessos**.

## Cuidados antes de uso real

- **O sistema não está publicado automaticamente.** É preciso criar os projetos e configurar os serviços.
- **Migração:** a base inicial vem do HTML fornecido, mas alterações feitas depois no `localStorage` de outro navegador não são transferidas. Antes de usar em produção, compare os dados com o arquivo/backup mais recente.
- **Importação inicial:** se ocorrer falha parcial, não clique novamente sem conferir os dados importados. O gatilho de auditoria registra também os cadastros da importação.
- **Dados pessoais:** a base contém identificadores de pessoas e empresas. Utilize repositório privado, limite o acesso à equipe e avalie as obrigações da LGPD. O arquivo JSON inicial está **fora de `public/`** e não deve ser colocado na pasta pública do site. Faça a importação escolhendo o arquivo local no computador do administrador.
- **Segurança operacional:** habilite MFA para administradores quando disponível, configure backups e revise permissões periodicamente. Revogar um usuário no perfil impede novas consultas, mas não substitui encerrar sessões no painel do Supabase quando necessário.
- **Conferência:** registros marcados `ativa` não significam validação cadastral/fiscal oficial; alguns dados originais estão pendentes de conferência.
- **Auditoria:** o sistema registra alterações efetuadas por usuários autenticados na tabela `empresas`; mudanças administrativas diretas no SQL Editor não possuem necessariamente a mesma identificação de usuário.

## Estrutura

- `public/index.html`: interface responsiva.
- `public/app.js`: autenticação, painel, filtros, CRUD, auditoria e controle de equipe.
- `empresas-iniciais.json`: base inicial privada, fora da pasta publicada.
- `public/config.example.js`: exemplo de configuração pública.
- `supabase/schema.sql`: banco, papéis, RLS e gatilhos de auditoria.
- `vercel.json`: cabeçalhos de segurança básicos.
- Atualização de implantação do Empresas 2027.

