-- Migração para adicionar campos de usuário às tarefas
-- Execute este script no SQL Editor do Supabase

-- Adicionar coluna created_by (obrigatório)
ALTER TABLE tasks 
ADD COLUMN created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Adicionar coluna assigned_to (opcional)
ALTER TABLE tasks 
ADD COLUMN assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Para tarefas existentes, definir created_by como o usuário atual
-- (você pode precisar ajustar isso baseado no seu contexto)
-- UPDATE tasks SET created_by = auth.uid() WHERE created_by IS NULL;

-- Criar índices para melhorar performance nas buscas
CREATE INDEX idx_tasks_created_by ON tasks(created_by);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);

-- Comentários nas colunas para documentação
COMMENT ON COLUMN tasks.created_by IS 'Usuário que criou a tarefa';
COMMENT ON COLUMN tasks.assigned_to IS 'Usuário responsável pela tarefa';
