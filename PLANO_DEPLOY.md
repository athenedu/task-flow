# Plano de Integração Supabase + Deploy Vercel

## 📋 Visão Geral

Este plano detalha os passos para integrar seu gerenciador de tarefas com Supabase (banco de dados) e fazer deploy na Vercel.

---

## 🗄️ Parte 1: Configuração do Supabase

### 1.1 Criar Conta e Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Crie uma conta (pode usar GitHub)
3. Clique em "New Project"
4. Preencha:
   - **Nome do projeto**: `taskflow` (ou o que preferir)
   - **Database Password**: Anote essa senha (importante!)
   - **Region**: Escolha a mais próxima (South America - São Paulo)
5. Aguarde a criação (2-3 minutos)

### 1.2 Criar as Tabelas no Banco de Dados

Acesse o **SQL Editor** no painel do Supabase e execute o seguinte script:

```sql
-- Criar tabela de projetos (compartilhada entre todos os usuários)
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de tarefas (compartilhada entre todos os usuários)
CREATE TABLE tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT NOT NULL CHECK (priority IN ('urgente', 'alta', 'média', 'baixa')),
  due_date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('na fila', 'em preparação', 'iniciada', 'em revisão', 'concluída')),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);

-- Habilitar Row Level Security (RLS)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para projetos (qualquer usuário autenticado pode acessar tudo)
CREATE POLICY "Usuários autenticados podem ver projetos" ON projects
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários autenticados podem criar projetos" ON projects
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários autenticados podem atualizar projetos" ON projects
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários autenticados podem excluir projetos" ON projects
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- Políticas RLS para tarefas (qualquer usuário autenticado pode acessar tudo)
CREATE POLICY "Usuários autenticados podem ver tarefas" ON tasks
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários autenticados podem criar tarefas" ON tasks
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários autenticados podem atualizar tarefas" ON tasks
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários autenticados podem excluir tarefas" ON tasks
  FOR DELETE USING (auth.uid() IS NOT NULL);
```

### 1.3 Obter as Credenciais do Supabase

1. No painel do Supabase, vá em **Settings** > **API**
2. Copie:
   - **Project URL** (algo como: `https://xxxxx.supabase.co`)
   - **anon/public key** (uma chave longa começando com `eyJ...`)

---

## 💻 Parte 2: Integração no Código

### 2.1 Instalar Dependências

Execute no terminal:

```bash
npm install @supabase/supabase-js
```

### 2.2 Criar Arquivo de Configuração do Supabase

Crie o arquivo: `src/lib/supabase.ts`

```typescript
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Faltam variáveis de ambiente do Supabase')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
```

### 2.3 Criar Tipos do Banco de Dados

Crie o arquivo: `src/types/database.ts`

```typescript
export type Database = {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string
          name: string
          description: string | null
          color: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          color: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          color?: string
          created_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          title: string
          description: string | null
          priority: 'urgente' | 'alta' | 'média' | 'baixa'
          due_date: string
          status: 'na fila' | 'em preparação' | 'iniciada' | 'em revisão' | 'concluída'
          project_id: string
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          priority: 'urgente' | 'alta' | 'média' | 'baixa'
          due_date: string
          status: 'na fila' | 'em preparação' | 'iniciada' | 'em revisão' | 'concluída'
          project_id: string
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          priority?: 'urgente' | 'alta' | 'média' | 'baixa'
          due_date?: string
          status?: 'na fila' | 'em preparação' | 'iniciada' | 'em revisão' | 'concluída'
          project_id?: string
          created_at?: string
        }
      }
    }
  }
}
```

### 2.4 Criar Hook com Supabase

Crie o arquivo: `src/hooks/useSupabaseTaskManager.ts`

Este hook substituirá o `useTaskManager.ts` atual, mas integrando com o Supabase. 
*(Código completo será fornecido após confirmação)*

### 2.5 Criar Arquivo .env

Crie o arquivo `.env.local` na raiz do projeto:

```env
VITE_SUPABASE_URL=sua-url-do-supabase-aqui
VITE_SUPABASE_ANON_KEY=sua-chave-anon-aqui
```

### 2.6 Atualizar .gitignore

Adicione ao `.gitignore`:

```
.env.local
.env
```

---

## 🚀 Parte 3: Deploy na Vercel

### 3.1 Preparar o Repositório

```bash
# Inicializar git (se ainda não tiver)
git init

# Adicionar todos os arquivos
git add .

# Fazer commit
git commit -m "Integração com Supabase"

# Criar repositório no GitHub (pela interface do GitHub)
# Depois linkar e enviar:
git remote add origin https://github.com/seu-usuario/seu-repo.git
git branch -M main
git push -u origin main
```

### 3.2 Deploy na Vercel

1. Acesse [vercel.com](https://vercel.com)
2. Faça login com sua conta GitHub
3. Clique em **"Add New"** > **"Project"**
4. Selecione o repositório do seu projeto
5. Configure:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. Clique em **"Environment Variables"** e adicione:
   ```
   VITE_SUPABASE_URL = sua-url
   VITE_SUPABASE_ANON_KEY = sua-chave
   ```
7. Clique em **"Deploy"**
8. Aguarde 2-3 minutos

### 3.3 Configurar Domínio (Opcional)

1. No painel da Vercel, vá em **Settings** > **Domains**
2. Adicione seu domínio personalizado
3. Configure o DNS conforme instruções

---

## ✅ Checklist de Implementação

### Supabase
- [ ] Criar conta no Supabase
- [ ] Criar projeto
- [ ] Executar SQL para criar tabelas
- [ ] Configurar políticas de segurança (RLS)
- [ ] Copiar URL e Anon Key

### Código
- [ ] Instalar `@supabase/supabase-js`
- [ ] Criar `src/lib/supabase.ts`
- [ ] Criar `src/types/database.ts`
- [ ] Criar `src/hooks/useSupabaseTaskManager.ts`
- [ ] Atualizar `App.tsx` para usar novo hook
- [ ] Criar arquivo `.env.local`
- [ ] Atualizar `.gitignore`
- [ ] Testar localmente

### Deploy
- [ ] Criar repositório no GitHub
- [ ] Fazer push do código
- [ ] Criar conta na Vercel
- [ ] Importar projeto do GitHub
- [ ] Configurar variáveis de ambiente
- [ ] Deploy

---

## 🔒 Melhorias Futuras (Opcional)

1. **Autenticação de Usuários**
   - Implementar login com Supabase Auth
   - Cada usuário teria seus próprios projetos/tarefas
   - Atualizar políticas RLS para filtrar por usuário

2. **Realtime**
   - Usar Supabase Realtime para sincronização em tempo real
   - Múltiplas pessoas podem colaborar simultaneamente

3. **Upload de Arquivos**
   - Usar Supabase Storage para anexar arquivos às tarefas

4. **Modo Offline**
   - Implementar cache local
   - Sincronizar quando voltar online

---

## 📝 Notas Importantes

- As variáveis de ambiente **nunca** devem ser commitadas no Git
- A chave `anon` é segura para uso público (RLS protege os dados)
- Para produção com usuários reais, implemente autenticação
- Vercel tem deploy automático: cada push no GitHub faz um novo deploy

---

## 🆘 Precisa de Ajuda?

Se quiser que eu implemente qualquer parte deste plano, é só pedir! Posso:
- Criar todos os arquivos necessários
- Modificar o código existente
- Configurar tudo passo a passo
