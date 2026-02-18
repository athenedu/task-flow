-- Função RPC para listar usuários (OPCIONAL MAS RECOMENDADO)
-- Execute este script no SQL Editor do Supabase para melhorar o carregamento de usuários

-- Criar função que retorna lista de usuários
CREATE OR REPLACE FUNCTION get_all_users()
RETURNS TABLE (
  id UUID,
  email TEXT,
  name TEXT
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
      au.raw_user_meta_data->>'name',
      split_part(au.email, '@', 1)
    )::TEXT as name
  FROM auth.users au
  ORDER BY au.email;
END;
$$;

-- Garantir que a função pode ser executada por usuários autenticados
GRANT EXECUTE ON FUNCTION get_all_users() TO authenticated;

-- Comentário para documentação
COMMENT ON FUNCTION get_all_users() IS 'Retorna lista de todos os usuários do sistema para seleção de responsáveis';
