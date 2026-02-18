-- ============================================================================
-- TASKFLOW - Script de Setup Completo do Banco de Dados
-- ============================================================================
-- Este script deve ser executado no SQL Editor do Supabase após criar o projeto.
-- Ele configura todas as tabelas, políticas RLS, triggers e funções necessárias.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. TABELA DE PERFIS DE USUÁRIO
-- ----------------------------------------------------------------------------

-- Criar tabela de perfis personalizados
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para user_profiles
CREATE POLICY "Perfis são públicos para leitura" ON user_profiles
  FOR SELECT USING (true);

CREATE POLICY "Usuários podem inserir próprio perfil" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar próprio perfil" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_id ON user_profiles(id);

-- Comentários para documentação
COMMENT ON TABLE user_profiles IS 'Perfis personalizados dos usuários';
COMMENT ON COLUMN user_profiles.display_name IS 'Nome de exibição do usuário';
COMMENT ON COLUMN user_profiles.avatar_url IS 'URL customizada do avatar do usuário';

-- ----------------------------------------------------------------------------
-- 2. TRIGGER PARA CRIAÇÃO AUTOMÁTICA DE PERFIS
-- ----------------------------------------------------------------------------

-- Função para criar perfil automaticamente ao criar novo usuário
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, display_name)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger que executa a função acima
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ----------------------------------------------------------------------------
-- 3. CAMPOS DE USUÁRIO NA TABELA TASKS
-- ----------------------------------------------------------------------------

-- Adicionar coluna created_by (quem criou a tarefa)
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Adicionar coluna assigned_to (responsável pela tarefa)
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Criar índices para melhorar performance nas buscas
CREATE INDEX IF NOT EXISTS idx_tasks_created_by ON tasks(created_by);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);

-- Comentários nas colunas
COMMENT ON COLUMN tasks.created_by IS 'Usuário que criou a tarefa';
COMMENT ON COLUMN tasks.assigned_to IS 'Usuário responsável pela tarefa';

-- ----------------------------------------------------------------------------
-- 4. FUNÇÃO RPC PARA LISTAR USUÁRIOS
-- ----------------------------------------------------------------------------

-- Remover função antiga se existir (necessário quando mudamos o tipo de retorno)
DROP FUNCTION IF EXISTS get_all_users();

-- Criar função que retorna lista de usuários com perfis
CREATE OR REPLACE FUNCTION get_all_users()
RETURNS TABLE (
  id UUID,
  email TEXT,
  name TEXT,
  avatar_url TEXT
) 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY 
  SELECT 
    au.id,
    au.email::TEXT,
    COALESCE(
      up.display_name,
      au.raw_user_meta_data->>'name',
      split_part(au.email, '@', 1)
    )::TEXT as name,
    up.avatar_url
  FROM auth.users au
  LEFT JOIN user_profiles up ON au.id = up.id
  ORDER BY au.email;
END;
$$;

-- Garantir que usuários autenticados podem executar a função
GRANT EXECUTE ON FUNCTION get_all_users() TO authenticated;

-- Comentário para documentação
COMMENT ON FUNCTION get_all_users() IS 'Retorna lista de todos os usuários do sistema com seus perfis para seleção de responsáveis';

-- ============================================================================
-- FIM DO SETUP
-- ============================================================================
-- Após executar este script:
-- 1. Verifique se não há erros no console do Supabase
-- 2. Configure as variáveis de ambiente no seu projeto (VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY)
-- 3. A aplicação está pronta para uso!
--
-- RECURSOS CONFIGURADOS:
-- ✓ Perfis de usuário com nomes personalizados e avatares
-- ✓ Suporte a Gravatar para avatars automáticos
-- ✓ Rastreamento de criador e responsável nas tarefas
-- ✓ Políticas RLS para segurança
-- ✓ Criação automática de perfis para novos usuários
-- ============================================================================
