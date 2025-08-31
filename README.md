# WSP Platform - PostgreSQL Version

Uma plataforma completa de treinamento e desenvolvimento em vendas com backend PostgreSQL.

## 🚀 Instalação Local

### Pré-requisitos
- Node.js 18+ 
- PostgreSQL 12+
- npm ou yarn

### 1. Configurar PostgreSQL

#### No Windows/Mac/Linux:
```bash
# Instalar PostgreSQL
# Windows: Baixar do site oficial postgresql.org
# Mac: brew install postgresql
# Ubuntu: sudo apt-get install postgresql postgresql-contrib

# Iniciar serviço PostgreSQL
# Windows: Iniciar pelo Services
# Mac: brew services start postgresql
# Linux: sudo systemctl start postgresql

# Criar banco de dados
psql -U postgres
CREATE DATABASE wsp_platform;
\q
```

### 2. Configurar o Projeto

```bash
# Clonar e instalar dependências do frontend
npm install

# Instalar dependências do backend
cd server
npm install
cd ..

# Configurar variáveis de ambiente
cp .env.example .env
```

### 3. Configurar .env

Edite o arquivo `.env` com suas configurações:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=sua_senha_postgres
DB_NAME=wsp_platform

# JWT Secret (mude em produção)
JWT_SECRET=sua-chave-secreta-jwt-super-segura

# Node Environment
NODE_ENV=development
```

### 4. Executar o Projeto

```bash
# Opção 1: Executar tudo junto
npm run dev:full

# Opção 2: Executar separadamente
# Terminal 1 - Backend
npm run server

# Terminal 2 - Frontend  
npm run dev
```

### 5. Acessar a Aplicação

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

**Login padrão:**
- Email: admin@wsp.com
- Senha: admin123

## 🌐 Deploy no Hostinger

### 1. Preparar o Servidor

1. Acesse seu painel Hostinger
2. Vá em "Hosting" → "Gerenciar"
3. Ative o Node.js (versão 18+)
4. Crie um banco PostgreSQL:
   - Vá em "Databases" → "PostgreSQL"
   - Crie um novo banco: `wsp_platform`
   - Anote: host, porta, usuário, senha

### 2. Upload dos Arquivos

```bash
# Fazer build do frontend
npm run build

# Comprimir arquivos para upload
zip -r wsp-platform.zip . -x node_modules/\* .git/\*
```

1. Faça upload do arquivo zip via File Manager
2. Extraia na pasta public_html ou pasta do seu domínio

### 3. Configurar no Servidor

```bash
# Via SSH ou Terminal do Hostinger
cd public_html/seu-projeto

# Instalar dependências do backend
cd server
npm install --production

# Voltar para raiz e instalar frontend
cd ..
npm install --production
```

### 4. Configurar Variáveis de Ambiente

Crie `.env` no servidor:

```env
# Database Configuration (dados do PostgreSQL do Hostinger)
DB_HOST=seu-host-postgres.hostinger.com
DB_PORT=5432
DB_USER=seu_usuario_postgres
DB_PASSWORD=sua_senha_postgres
DB_NAME=wsp_platform

# JWT Secret (use uma chave forte)
JWT_SECRET=sua-chave-jwt-super-segura-para-producao

# Node Environment
NODE_ENV=production
```

### 5. Configurar Aplicação Node.js no Hostinger

1. No painel Hostinger, vá em "Node.js"
2. Clique em "Create Application"
3. Configure:
   - **Application root:** `/public_html/seu-projeto/server`
   - **Application URL:** seu-dominio.com/api (ou subdomínio)
   - **Application startup file:** `index.js`
   - **Node.js version:** 18+

### 6. Configurar Proxy (se necessário)

Crie `.htaccess` na raiz:

```apache
RewriteEngine On

# API routes
RewriteRule ^api/(.*)$ http://localhost:3001/api/$1 [P,L]

# Frontend routes
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

### 7. Inicializar Banco de Dados

```bash
# Via SSH, execute uma vez para criar tabelas e dados iniciais
cd server
node index.js
```

## 🔧 Estrutura do Projeto

```
├── src/                 # Frontend React
│   ├── components/      # Componentes reutilizáveis
│   ├── pages/          # Páginas da aplicação
│   ├── store/          # Estados Zustand
│   └── utils/          # Utilitários
├── server/             # Backend Express
│   ├── index.js        # Servidor principal
│   └── package.json    # Dependências do backend
└── dist/               # Build do frontend
```

## 📝 Funcionalidades

- ✅ Autenticação JWT com cookies
- ✅ Gestão de usuários (admin)
- ✅ Sistema de vídeos/aulas
- ✅ Sistema de perguntas e votação
- ✅ Interface responsiva
- ✅ Banco PostgreSQL completo

## 🔒 Segurança

- Senhas hasheadas com bcrypt
- JWT tokens seguros
- Cookies httpOnly
- Validação de dados
- Proteção contra SQL injection

## 🆘 Troubleshooting

### Erro de conexão com banco:
1. Verifique se PostgreSQL está rodando
2. Confirme credenciais no .env
3. Teste conexão: `psql -h host -U user -d database`

### Erro 404 nas rotas da API:
1. Verifique se o backend está rodando na porta 3001
2. Confirme configuração de proxy/CORS

### Problemas no Hostinger:
1. Verifique logs da aplicação Node.js
2. Confirme configuração do PostgreSQL
3. Teste conectividade do banco