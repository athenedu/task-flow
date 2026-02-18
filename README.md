# 📋 TaskFlow

Sistema de gerenciamento de tarefas e projetos colaborativo, desenvolvido com React, TypeScript e Supabase.

## 🚀 Funcionalidades

- ✅ **Gestão de Projetos**: Crie e organize projetos com cores personalizadas
- ✅ **Tarefas Completas**: Título, descrição, prioridade, previsão e status
- ✅ **Visualizações**: Modo lista (tabela) e modo grid (cards)
- ✅ **Filtros Avançados**: Por status, prioridade e busca textual
- ✅ **Autenticação**: Sistema seguro com Supabase Auth
- ✅ **Colaborativo**: Todos os usuários autenticados compartilham os mesmos dados
- ✅ **Gerenciamento de Senha**: Usuários podem alterar suas próprias senhas
- ✅ **Perfis de Usuário**: Nome personalizado e avatar com Gravatar
- ✅ **Rastreamento**: Visualize quem criou e quem é responsável por cada tarefa
- ✅ **Atribuição de Tarefas**: Atribua responsáveis ao criar ou editar tarefas

## 🛠️ Tecnologias

- **Frontend**: React 19 + TypeScript + Vite
- **Estilização**: Tailwind CSS + shadcn/ui
- **Backend**: Supabase (PostgreSQL + Auth)
- **Deploy**: Vercel

## 📦 Instalação Local

1. **Clone o repositório**
```bash
git clone https://github.com/athenedu/task-flow.git
cd task-flow
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**

Copie o arquivo de exemplo:
```bash
cp .env.local.example .env.local
```

Edite `.env.local` com suas credenciais do Supabase:
```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-aqui
```

4. **Execute o projeto**
```bash
npm run dev
```

Acesse: [http://localhost:5173](http://localhost:5173)

## 🗄️ Configuração do Banco de Dados

### 1. Criar Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com) e crie uma conta
2. Crie um novo projeto
3. Anote a senha do banco de dados

### 2. Executar Script de Setup

No **SQL Editor** do Supabase, execute o script completo `database_setup.sql` que configura:

- ✅ Tabelas `projects`, `tasks` e `user_profiles`
- ✅ Campos de rastreamento de usuários (criador e responsável)
- ✅ Perfis personalizados com nome e avatar
- ✅ Políticas RLS (Row Level Security)
- ✅ Trigger para criar perfis automaticamente
- ✅ Função RPC para listar usuários
- ✅ Índices de performance

**Arquivo**: [`database_setup.sql`](database_setup.sql)

### 3. Obter Credenciais

Em **Settings > API**, copie:
- **Project URL**: `VITE_SUPABASE_URL`
- **anon/public key**: `VITE_SUPABASE_ANON_KEY`

## 🚀 Deploy na Vercel

### Passo a Passo

1. **Push para o GitHub**
```bash
git add .
git commit -m "Seu commit"
git push origin main
```

2. **Importar na Vercel**
   - Acesse [vercel.com](https://vercel.com)
   - Faça login com GitHub
   - Clique em **"Add New Project"**
   - Selecione seu repositório

3. **Configurar Variáveis de Ambiente**

Na seção **Environment Variables**, adicione:
```
VITE_SUPABASE_URL = https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY = sua-chave-anon
```

4. **Deploy**
   - Clique em **"Deploy"**
   - Aguarde 2-3 minutos
   - Acesse a URL fornecida

### Deploy Automático

Após a primeira configuração, cada `git push` para `main` faz deploy automático! 🎉

## 👥 Gerenciamento de Usuários

### Criar Usuários (Admin)

1. Acesse o Supabase Dashboard
2. Vá em **Authentication > Users**
3. Clique em **"Add user"**
4. Crie usuário com senha temporária (ex: `temp123456`)
5. **IMPORTANTE**: Desative "Auto Confirm User" se quiser controle total

### Primeiro Acesso

Os usuários devem:
1. Fazer login com credenciais fornecidas
2. Clicar no avatar → **"Alterar Senha"**
3. Inserir senha temporária e definir nova senha

### Personalizando Perfil

Após o login, os usuários podem:
1. Clicar no avatar → **"Editar Perfil"**
2. Definir um nome de exibição personalizado
3. Configurar avatar via [Gravatar](https://gravatar.com) (usando o email cadastrado)
4. Opcionalmente adicionar URL customizada de avatar

## 🔒 Segurança

- ✅ Arquivo `.env` não é commitado (protegido pelo `.gitignore`)
- ✅ Senhas criptografadas pelo Supabase Auth
- ✅ Row Level Security (RLS) protege acesso ao banco
- ✅ Apenas usuários autenticados podem acessar dados
- ✅ Chave `anon` é segura para uso público

## 🏗️ Estrutura do Projeto

```
src/
├── components/        # Componentes React
│   ├── ui/           # Componentes shadcn/ui
│   ├── AuthPage.tsx  # Tela de login
│   └── ...
├── hooks/            # Custom hooks
│   └── useSupabaseTaskManager.ts
├── contexts/         # React Context (Auth)
├── lib/              # Utilitários e config
│   └── supabase.ts   # Cliente Supabase
└── types/            # Definições TypeScript
```

## 📝 Scripts Disponíveis

```bash
npm run dev         # Servidor de desenvolvimento
npm run build       # Build para produção
npm run preview     # Preview do build
npm run lint        # Verifica código com ESLint
```

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para:
- Reportar bugs
- Sugerir novas funcionalidades
- Enviar pull requests

## 📄 Licença

Este projeto é open source e está disponível para uso livre.

---

**Desenvolvido com ❤️ usando React + TypeScript + Supabase**
