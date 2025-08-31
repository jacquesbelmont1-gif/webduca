const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const dotenv = require('dotenv');

// Carregar variáveis de ambiente
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Função para perguntar ao usuário
function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise(resolve => rl.question(query, ans => {
    rl.close();
    resolve(ans);
  }));
}

// Função principal
async function main() {
  console.log('Configuração do Banco de Dados PostgreSQL');
  console.log('=======================================');
  
  // Perguntar ao usuário por informações do banco de dados, se não estiverem definidas no .env
  const dbHost = process.env.DB_HOST || await askQuestion('Host do PostgreSQL (padrão: localhost): ') || 'localhost';
  const dbPort = process.env.DB_PORT || await askQuestion('Porta do PostgreSQL (padrão: 5432): ') || '5432';
  const dbUser = process.env.DB_USER || await askQuestion('Usuário do PostgreSQL (padrão: postgres): ') || 'postgres';
  const dbPassword = process.env.DB_PASSWORD || await askQuestion('Senha do PostgreSQL: ');
  const dbName = process.env.DB_NAME || await askQuestion('Nome do banco de dados a ser criado (padrão: empresa_jb_db): ') || 'empresa_jb_db';
  
  // Criar conexão com o PostgreSQL (banco postgres)
  const client = new Client({
    host: dbHost,
    port: dbPort,
    user: dbUser,
    password: dbPassword,
    database: 'postgres', // Conectar ao banco padrão postgres
  });
  
  try {
    console.log('Conectando ao PostgreSQL...');
    await client.connect();
    console.log('Conexão estabelecida com sucesso!');
    
    // Verificar se o banco de dados já existe
    const existsResult = await client.query(`
      SELECT 1 FROM pg_database WHERE datname = $1
    `, [dbName]);
    
    if (existsResult.rows.length > 0) {
      console.log(`Banco de dados "${dbName}" já existe.`);
      const dropDb = await askQuestion(`Deseja recriar o banco de dados "${dbName}"? (s/N): `);
      
      if (dropDb.toLowerCase() === 's') {
        console.log(`Excluindo banco de dados "${dbName}"...`);
        await client.query(`DROP DATABASE IF EXISTS "${dbName}"`);
        console.log(`Banco de dados "${dbName}" excluído.`);
      } else {
        console.log('Mantendo banco de dados existente.');
        await client.end();
        updateEnvFile(dbHost, dbPort, dbUser, dbPassword, dbName);
        console.log('Configuração concluída!');
        return;
      }
    }
    
    // Criar o banco de dados
    console.log(`Criando banco de dados "${dbName}"...`);
    await client.query(`CREATE DATABASE "${dbName}"`);
    console.log(`Banco de dados "${dbName}" criado com sucesso!`);
    
    // Fechar conexão com postgres
    await client.end();
    
    // Atualizar arquivo .env
    updateEnvFile(dbHost, dbPort, dbUser, dbPassword, dbName);
    
    console.log('Configuração do banco de dados concluída com sucesso!');
    console.log(`Para iniciar a aplicação, execute: npm run dev`);
  } catch (error) {
    console.error('Erro durante a configuração do banco de dados:', error);
  }
}

// Função para atualizar o arquivo .env
function updateEnvFile(host, port, user, password, dbName) {
  const envPath = path.resolve(process.cwd(), '.env');
  let envContent = '';
  
  if (fs.existsSync(envPath)) {
    // Ler conteúdo atual do .env
    envContent = fs.readFileSync(envPath, 'utf8');
    
    // Atualizar as configurações do banco de dados
    envContent = envContent.replace(/DB_HOST=.*/, `DB_HOST=${host}`);
    envContent = envContent.replace(/DB_PORT=.*/, `DB_PORT=${port}`);
    envContent = envContent.replace(/DB_USER=.*/, `DB_USER=${user}`);
    envContent = envContent.replace(/DB_PASSWORD=.*/, `DB_PASSWORD=${password}`);
    envContent = envContent.replace(/DB_NAME=.*/, `DB_NAME=${dbName}`);
  } else {
    // Criar novo arquivo .env
    envContent = `# Configurações do Supabase (mantidas para compatibilidade)
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Configurações do PostgreSQL
DB_HOST=${host}
DB_PORT=${port}
DB_USER=${user}
DB_PASSWORD=${password}
DB_NAME=${dbName}

# Outras configurações da aplicação
NODE_ENV=development
`;
  }
  
  // Salvar o arquivo .env
  fs.writeFileSync(envPath, envContent);
  console.log('Arquivo .env atualizado com as configurações do banco de dados.');
}

// Executar o script
main().catch(console.error); 