# Funcionalidade: Rastreamento de Criador e Atribuição de Responsável

## Resumo

Esta funcionalidade adiciona dois novos campos às tarefas:
- **createdBy**: Registra automaticamente o usuário que criou a tarefa
- **assignedTo**: Permite atribuir um usuário como responsável pela tarefa

## Mudanças Implementadas

### 1. Tipos e Schema do Banco de Dados

**Arquivos modificados:**
- `src/types/index.ts` - Adicionado tipo `AppUser` e campos `createdBy` e `assignedTo` em `Task`
- `src/types/database.ts` - Atualizado schema para incluir os novos campos

### 2. Migração do Banco de Dados

**Arquivo criado:** `migration_add_user_fields.sql`

⚠️ **IMPORTANTE**: Execute este script no SQL Editor do Supabase antes de usar a aplicação:

```sql
-- Adicionar coluna created_by (obrigatório)
ALTER TABLE tasks 
ADD COLUMN created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Adicionar coluna assigned_to (opcional)
ALTER TABLE tasks 
ADD COLUMN assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Criar índices para melhorar performance
CREATE INDEX idx_tasks_created_by ON tasks(created_by);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
```

**Para tarefas existentes**: Se você já tem tarefas no banco, você pode definir um criador padrão:
```sql
-- Substitua 'USER_ID_AQUI' pelo ID de um usuário válido
UPDATE tasks 
SET created_by = 'USER_ID_AQUI' 
WHERE created_by IS NULL;
```

### 3. Hook useSupabaseTaskManager

**Mudanças:**
- Adicionado estado `users` para armazenar lista de usuários
- Nova função `loadUsers()` para buscar usuários do sistema
- Atualizado `loadTasks()` para incluir campos `created_by` e `assigned_to`
- Atualizado `addTask()` para salvar criador e responsável
- Atualizado `updateTask()` para permitir alterar o responsável
- Exporta `users` no retorno do hook

**Nota**: A função `loadUsers()` tenta usar `supabase.auth.admin.listUsers()`, mas como fallback, usa apenas o usuário atual. Se você tiver acesso ao Admin API do Supabase, a lista completa será carregada.

### 4. Interface - TaskModal

**Mudanças:**
- Adicionado campo de seleção "Responsável"
- Lista todos os usuários disponíveis no select
- Exibe nome do usuário (ou email se nome não estiver disponível)
- Campo é opcional - pode criar tarefa sem responsável
- Grava automaticamente o ID do usuário logado como `createdBy`

### 5. Visualizações - TaskCard e TaskTable

**TaskCard:**
- Exibe ícone de usuário e nome do responsável (se atribuído)
- Aparece abaixo da data de previsão

**TaskTable:**
- Nova coluna "Responsável" entre "Prioridade" e "Previsão"
- Exibe nome do usuário ou "Sem responsável"

## Como Usar

### Criar uma Tarefa com Responsável

1. Clique em "Nova Tarefa"
2. Preencha os campos obrigatórios (Título, Projeto, Data)
3. No campo "Responsável", selecione um usuário ou deixe vazio
4. Clique em "Criar Tarefa"

O sistema automaticamente:
- Registra seu ID de usuário como criador (`createdBy`)
- Salva o responsável selecionado (`assignedTo`)

### Editar o Responsável de uma Tarefa

1. Abra a tarefa para edição
2. Altere o campo "Responsável"
3. Clique em "Salvar"

**Nota**: O campo `createdBy` nunca é alterado após a criação - sempre mantém o criador original.

### Visualizar Responsável

- **No Card**: Aparece com ícone de usuário abaixo da data
- **Na Tabela**: Coluna dedicada "Responsável"

## Estrutura de Dados

### Task Interface
```typescript
interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  dueDate: string;
  status: Status;
  projectId: string;
  createdAt: string;
  createdBy: string;        // Novo: ID do usuário que criou
  assignedTo: string | null; // Novo: ID do usuário responsável
}
```

### AppUser Interface
```typescript
interface AppUser {
  id: string;
  email: string;
  name?: string;
}
```

## Próximos Passos Sugeridos

1. **Buscar Usuários do Sistema**: Implementar uma view ou RPC no Supabase para buscar usuários:
   ```sql
   CREATE VIEW public_users AS 
   SELECT id, email, raw_user_meta_data->>'name' as name 
   FROM auth.users;
   ```

2. **Filtros por Responsável**: Adicionar filtros na UI para mostrar apenas tarefas atribuídas a você

3. **Dashboard de Equipe**: Mostrar estatísticas de tarefas por usuário

4. **Notificações**: Notificar usuário quando uma tarefa for atribuída a ele

5. **Histórico**: Rastrear mudanças de responsável ao longo do tempo

## Possíveis Problemas e Soluções

### Erro: "column created_by does not exist"
**Solução**: Execute o script de migração no Supabase SQL Editor

### Lista de usuários aparece vazia
**Solução**: A função `loadUsers()` precisa de permissões Admin. Considere criar uma view ou RPC pública:
```sql
-- No Supabase SQL Editor
CREATE OR REPLACE FUNCTION get_all_users()
RETURNS TABLE (id UUID, email TEXT, name TEXT) AS $$
BEGIN
  RETURN QUERY 
  SELECT 
    auth.users.id, 
    auth.users.email,
    (auth.users.raw_user_meta_data->>'name')::TEXT as name
  FROM auth.users;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

Depois atualize `loadUsers()` para usar esta função.

### RLS (Row Level Security)
Se suas políticas RLS estiverem muito restritivas, adicione:
```sql
-- Permitir que usuários vejam o nome de outros usuários
CREATE POLICY "Users can view other users" ON tasks
  FOR SELECT USING (true);
```

## Suporte

Se encontrar problemas, verifique:
1. ✅ Script de migração foi executado no Supabase
2. ✅ Campos estão presentes na tabela tasks
3. ✅ Políticas RLS permitem acesso adequado
4. ✅ Não há erros no console do navegador
