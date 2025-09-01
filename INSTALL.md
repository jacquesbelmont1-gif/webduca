# 🚀 WSP Platform - Guia de Instalação Completo

## 📋 Sobre o Sistema

O **WSP Platform** é um sistema completo de treinamento e desenvolvimento em vendas que inclui:

- ✅ **Sistema de Autenticação** com JWT e cookies seguros
- ✅ **Gestão de Usuários** com sistema de convites por token
- ✅ **Biblioteca de Vídeos** com suporte a YouTube, Vimeo e Loom
- ✅ **Sistema de Perguntas** com votação da comunidade
- ✅ **Painel Administrativo** completo
- ✅ **Interface Responsiva** com design moderno
- ✅ **Banco PostgreSQL** com dados de exemplo

---

## 🏠 INSTALAÇÃO LOCAL (Desenvolvimento)

### 1. Pré-requisitos

- **Node.js 18+** ([Download](https://nodejs.org/))
- **PostgreSQL 12+** ([Download](https://www.postgresql.org/download/))
- **Git** ([Download](https://git-scm.com/))

### 2. Instalar PostgreSQL

#### Windows:
1. Baixe o instalador do [site oficial](https://www.postgresql.org/download/windows/)
2. Execute o instalador e siga as instruções
3. **IMPORTANTE:** Anote a senha do usuário `postgres`
4. Inicie o PostgreSQL pelo Services ou pgAdmin

#### macOS:
```bash
# Usando Homebrew
brew install postgresql
brew services start postgresql

# Criar usuário postgres (se necessário)
createuser -s postgres
```

#### Linux (Ubuntu/Debian):
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Configurar senha do postgres
sudo -u postgres psql
\password postgres
\q
```

### 3. Configurar o Banco de Dados

```bash
# Conectar ao PostgreSQL
psql -U postgres

# Criar banco de dados
CREATE DATABASE wsp_platform;

# Sair do psql
\q
```

### 4. Configurar o Projeto

```bash
# Clonar o projeto (ou baixar os arquivos)
git clone <seu-repositorio>
cd wsp-platform

# Instalar dependências do frontend
npm install

# Instalar dependências do backend
cd server
npm install
cd ..

# Configurar variáveis de ambiente
cp .env.example .env
```

### 5. Configurar o arquivo .env

Edite o arquivo `.env` com suas configurações:

```env
# CONFIGURAÇÕES DO BANCO
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=SUA_SENHA_POSTGRES_AQUI
DB_NAME=wsp_platform

# SEGURANÇA
JWT_SECRET=wsp-platform-jwt-secret-key-change-in-production-2024

# SERVIDOR
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:5173

# ADMIN MASTER
ADMIN_EMAIL=admin@wsp.com
ADMIN_PASSWORD=WSP@Admin2024!
ADMIN_NAME=Administrador Master
```

### 6. Inicializar o Banco de Dados

```bash
# Executar script de configuração do banco
cd server
npm run setup
cd ..
```

### 7. Executar o Sistema

```bash
# Opção 1: Executar tudo junto
npm run dev:full

# Opção 2: Executar separadamente
# Terminal 1 - Backend
npm run server

# Terminal 2 - Frontend
npm run dev
```

### 8. Acessar o Sistema

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3001

**🔑 Login Master:**
- **Email:** admin@wsp.com
- **Senha:** WSP@Admin2024!

---

## 🌐 INSTALAÇÃO NO HOSTINGER (Produção)

### 1. Preparar o Servidor Hostinger

1. **Acesse seu painel Hostinger**
2. **Ative o Node.js:**
   - Vá em "Hosting" → "Gerenciar"
   - Ative Node.js (versão 18+)
3. **Criar banco PostgreSQL:**
   - Vá em "Databases" → "PostgreSQL"
   - Crie um novo banco: `wsp_platform`
   - **ANOTE:** host, porta, usuário, senha

### 2. Preparar os Arquivos

```bash
# No seu computador local:

# Fazer build do frontend
npm run build

# Criar arquivo compactado (excluindo node_modules)
zip -r wsp-platform.zip . -x node_modules/\* .git/\* .env

# Ou no Windows (PowerShell):
Compress-Archive -Path . -DestinationPath wsp-platform.zip -Exclude node_modules,.git,.env
```

### 3. Upload e Configuração

1. **Upload via File Manager:**
   - Acesse File Manager no painel Hostinger
   - Faça upload do `wsp-platform.zip`
   - Extraia na pasta do seu domínio (ex: `public_html`)

2. **Instalar dependências via SSH:**
```bash
# Conectar via SSH
ssh usuario@seu-servidor.hostinger.com

# Navegar para o projeto
cd public_html/wsp-platform

# Instalar dependências do frontend
npm install --production

# Instalar dependências do backend
cd server
npm install --production
cd ..
```

### 4. Configurar Variáveis de Ambiente

Crie o arquivo `.env` no servidor:

```bash
# Via SSH ou File Manager, criar .env:
nano .env
```

```env
# CONFIGURAÇÕES DO BANCO (dados do Hostinger)
DB_HOST=seu-host-postgres.hostinger.com
DB_PORT=5432
DB_USER=seu_usuario_hostinger
DB_PASSWORD=sua_senha_hostinger
DB_NAME=wsp_platform

# SEGURANÇA (use uma chave forte!)
JWT_SECRET=sua-chave-jwt-super-segura-para-producao-2024

# SERVIDOR
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://seu-dominio.com

# ADMIN MASTER
ADMIN_EMAIL=admin@wsp.com
ADMIN_PASSWORD=WSP@Admin2024!
ADMIN_NAME=Administrador Master

# EMAIL (opcional - para sistema de convites)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=seu-email@gmail.com
EMAIL_PASS=sua-senha-de-app
```

### 5. Configurar Aplicação Node.js

1. **No painel Hostinger:**
   - Vá em "Node.js"
   - Clique em "Create Application"
   - Configure:
     - **Application root:** `/public_html/wsp-platform/server`
     - **Application URL:** `seu-dominio.com/api` (ou subdomínio)
     - **Application startup file:** `index.js`
     - **Node.js version:** 18+

### 6. Configurar Proxy (.htaccess)

Crie `.htaccess` na raiz do projeto:

```apache
RewriteEngine On

# Redirecionar API para Node.js
RewriteRule ^api/(.*)$ http://localhost:3001/api/$1 [P,L]

# Servir arquivos estáticos do build
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /dist/index.html [L]
```

### 7. Inicializar o Banco de Dados

```bash
# Via SSH, executar uma vez:
cd server
npm run setup
```

### 8. Iniciar a Aplicação

No painel Hostinger → Node.js → Restart Application

---

## 🔧 ESTRUTURA DO PROJETO

```
wsp-platform/
├── src/                    # Frontend React + TypeScript
│   ├── components/         # Componentes reutilizáveis
│   ├── pages/             # Páginas da aplicação
│   │   ├── admin/         # Páginas administrativas
│   │   ├── Login.tsx      # Tela de login
│   │   └── Register.tsx   # Tela de registro
│   ├── store/             # Estados Zustand
│   └── utils/             # Utilitários
├── server/                # Backend Express + PostgreSQL
│   ├── index.js          # Servidor principal
│   ├── setup-database.js # Script de configuração do banco
│   └── package.json      # Dependências do backend
├── dist/                 # Build do frontend (gerado)
├── .env                  # Variáveis de ambiente
└── INSTALL.md           # Este arquivo
```

---

## 🔐 SISTEMA DE SEGURANÇA

### Usuário Master
- **Email:** admin@wsp.com
- **Senha:** WSP@Admin2024!
- **Função:** Administrador com acesso total

### Sistema de Convites
1. **Admin gera convite** com email do usuário
2. **Token único** é criado (válido por 24h)
3. **Link de convite** é enviado (se email configurado)
4. **Usuário acessa** o link e cria sua conta
5. **Token é invalidado** após uso

### Funcionalidades de Segurança
- ✅ Senhas hasheadas com bcrypt (salt 12)
- ✅ JWT tokens seguros com expiração
- ✅ Cookies httpOnly para autenticação
- ✅ Validação de dados em todas as rotas
- ✅ Proteção contra SQL injection
- ✅ Middleware de autorização por roles

---

## 📊 FUNCIONALIDADES PRINCIPAIS

### Para Usuários:
- 🏠 **Dashboard** com últimas aulas e estatísticas
- 👥 **Gestão de Equipe** com visualização de membros
- 🎓 **Treinamentos** com biblioteca de vídeos
- 🎬 **Mídias** com conteúdos especiais
- ❓ **Dúvidas** com sistema de votação
- 👤 **Perfil** com edição de dados pessoais

### Para Administradores:
- 📊 **Dashboard** com estatísticas completas
- 👥 **Gestão de Usuários** (criar, editar, desativar)
- 📧 **Sistema de Convites** com tokens únicos
- 🎥 **Gestão de Vídeos** (upload, edição, categorização)
- 🆘 **Suporte** (responder dúvidas, vincular vídeos)

---

## 🆘 TROUBLESHOOTING

### Erro de Conexão com Banco:
```bash
# Verificar se PostgreSQL está rodando
# Windows:
services.msc → PostgreSQL

# macOS:
brew services list | grep postgresql

# Linux:
sudo systemctl status postgresql

# Testar conexão manual:
psql -h localhost -U postgres -d wsp_platform
```

### Erro 404 nas Rotas da API:
1. Verificar se backend está rodando na porta 3001
2. Confirmar configuração de CORS no servidor
3. Verificar arquivo .htaccess (produção)

### Problemas no Hostinger:
1. **Verificar logs:** Painel → Node.js → View Logs
2. **Testar banco:** Painel → Databases → PostgreSQL → Connect
3. **Verificar .env:** Confirmar todas as variáveis
4. **Restart:** Painel → Node.js → Restart Application

### Erro de Permissões:
```bash
# Dar permissões corretas (Linux/macOS)
chmod -R 755 wsp-platform/
chmod 600 .env
```

---

## 🔄 COMANDOS ÚTEIS

```bash
# Desenvolvimento
npm run dev:full          # Frontend + Backend
npm run dev              # Apenas frontend
npm run server           # Apenas backend

# Produção
npm run build            # Build do frontend
cd server && npm start   # Iniciar backend

# Banco de dados
cd server && npm run setup  # Configurar banco
psql -U postgres -d wsp_platform  # Conectar ao banco
```

---

## 📞 SUPORTE

### Logs Importantes:
- **Backend:** Console do terminal onde rodou `npm run server`
- **Frontend:** Console do navegador (F12)
- **Banco:** Logs do PostgreSQL

### Verificações Rápidas:
1. ✅ PostgreSQL rodando?
2. ✅ Arquivo .env configurado?
3. ✅ Dependências instaladas?
4. ✅ Banco de dados criado?
5. ✅ Portas 3001 e 5173 livres?

---

## 🎯 PRÓXIMOS PASSOS

Após a instalação:

1. **Acesse o sistema** com as credenciais master
2. **Gere convites** para novos usuários
3. **Adicione vídeos** de treinamento
4. **Configure equipes** e organize usuários
5. **Monitore dúvidas** e forneça respostas

**🎉 Seu WSP Platform está pronto para uso!**