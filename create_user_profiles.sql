-- Script para criar tabela de perfis de usuário
-- Execute este script no SQL Editor do Supabase

-- Criar tabela de perfis
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
-- Todos podem ler perfis
CREATE POLICY "Perfis são públicos para leitura" ON user_profiles
  FOR SELECT USING (true);

-- Usuários podem inserir seu próprio perfil
CREATE POLICY "Usuários podem inserir próprio perfil" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Usuários podem atualizar seu próprio perfil
CREATE POLICY "Usuários podem atualizar próprio perfil" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Criar índice para melhor performance
CREATE INDEX idx_user_profiles_id ON user_profiles(id);

-- Função para criar perfil automaticamente ao criar usuário
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

-- Trigger para criar perfil automaticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Remover função antiga se existir (necessário quando mudamos o tipo de retorno)
DROP FUNCTION IF EXISTS get_all_users();

-- Atualizar função get_all_users para incluir perfis
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

GRANT EXECUTE ON FUNCTION get_all_users() TO authenticated;

-- Comentários
COMMENT ON TABLE user_profiles IS 'Perfis personalizados dos usuários';
COMMENT ON COLUMN user_profiles.display_name IS 'Nome de exibição do usuário';
COMMENT ON COLUMN user_profiles.avatar_url IS 'URL do avatar do usuário';
