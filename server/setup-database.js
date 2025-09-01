const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '../.env' });

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'wsp_platform',
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

async function setupDatabase() {
  console.log('🚀 Iniciando configuração do banco de dados WSP Platform...\n');

  try {
    // Testar conexão
    console.log('📡 Testando conexão com PostgreSQL...');
    await pool.query('SELECT NOW()');
    console.log('✅ Conexão com PostgreSQL estabelecida com sucesso!\n');

    // Criar extensão UUID
    console.log('🔧 Configurando extensões...');
    await pool.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    console.log('✅ Extensão UUID configurada\n');

    // Criar tabelas
    console.log('📋 Criando tabelas...');
    
    // Tabela users
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('admin', 'user')),
        avatar_url TEXT,
        fraternity_coins DECIMAL(10,2) DEFAULT 0.00,
        team VARCHAR(50) DEFAULT 'blue' CHECK (team IN ('blue', 'red', 'green', 'yellow')),
        is_active BOOLEAN DEFAULT true,
        last_login TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabela users criada');

    // Tabela videos
    await pool.query(`
      CREATE TABLE IF NOT EXISTS videos (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        url TEXT NOT NULL,
        platform VARCHAR(50) NOT NULL CHECK (platform IN ('youtube', 'vimeo', 'loom')),
        thumbnail_url TEXT,
        category VARCHAR(100) NOT NULL,
        question_id UUID,
        is_active BOOLEAN DEFAULT true,
        views_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabela videos criada');

    // Tabela questions
    await pool.query(`
      CREATE TABLE IF NOT EXISTS questions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        category VARCHAR(100) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved')),
        video_id UUID REFERENCES videos(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabela questions criada');

    // Tabela question_votes
    await pool.query(`
      CREATE TABLE IF NOT EXISTS question_votes (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(question_id, user_id)
      )
    `);
    console.log('✅ Tabela question_votes criada');

    // Tabela invite_tokens
    await pool.query(`
      CREATE TABLE IF NOT EXISTS invite_tokens (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        token VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) NOT NULL,
        invited_by UUID REFERENCES users(id) ON DELETE CASCADE,
        used BOOLEAN DEFAULT false,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabela invite_tokens criada');

    // Adicionar foreign keys
    await pool.query(`
      ALTER TABLE videos 
      ADD CONSTRAINT IF NOT EXISTS fk_videos_question 
      FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE SET NULL
    `);

    // Criar índices
    console.log('🔍 Criando índices para performance...');
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)',
      'CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)',
      'CREATE INDEX IF NOT EXISTS idx_videos_category ON videos(category)',
      'CREATE INDEX IF NOT EXISTS idx_videos_platform ON videos(platform)',
      'CREATE INDEX IF NOT EXISTS idx_questions_user_id ON questions(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_questions_status ON questions(status)',
      'CREATE INDEX IF NOT EXISTS idx_questions_category ON questions(category)',
      'CREATE INDEX IF NOT EXISTS idx_question_votes_question_id ON question_votes(question_id)',
      'CREATE INDEX IF NOT EXISTS idx_invite_tokens_token ON invite_tokens(token)',
      'CREATE INDEX IF NOT EXISTS idx_invite_tokens_email ON invite_tokens(email)'
    ];

    for (const index of indexes) {
      await pool.query(index);
    }
    console.log('✅ Índices criados\n');

    // Criar função de trigger para updated_at
    await pool.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ language 'plpgsql'
    `);

    // Criar triggers
    const triggers = [
      'CREATE TRIGGER IF NOT EXISTS update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()',
      'CREATE TRIGGER IF NOT EXISTS update_videos_updated_at BEFORE UPDATE ON videos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()',
      'CREATE TRIGGER IF NOT EXISTS update_questions_updated_at BEFORE UPDATE ON questions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()'
    ];

    for (const trigger of triggers) {
      await pool.query(trigger);
    }

    // Inserir usuário admin master
    console.log('👤 Criando usuário administrador master...');
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@wsp.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'WSP@Admin2024!';
    const adminName = process.env.ADMIN_NAME || 'Administrador Master';

    const adminExists = await pool.query('SELECT id FROM users WHERE email = $1', [adminEmail]);
    
    if (adminExists.rows.length === 0) {
      const hashedPassword = await bcrypt.hash(adminPassword, 12);
      await pool.query(`
        INSERT INTO users (email, password, name, role, fraternity_coins, team)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [adminEmail, hashedPassword, adminName, 'admin', 1000.00, 'blue']);
      
      console.log('✅ Usuário administrador criado com sucesso!');
      console.log(`📧 Email: ${adminEmail}`);
      console.log(`🔑 Senha: ${adminPassword}\n`);
    } else {
      console.log('ℹ️  Usuário administrador já existe\n');
    }

    // Inserir dados de exemplo
    console.log('📚 Inserindo dados de exemplo...');
    await insertSampleData();

    console.log('🎉 Configuração do banco de dados concluída com sucesso!');
    console.log('\n📋 RESUMO DA INSTALAÇÃO:');
    console.log('================================');
    console.log(`✅ Banco de dados: ${process.env.DB_NAME}`);
    console.log(`✅ Host: ${process.env.DB_HOST}:${process.env.DB_PORT}`);
    console.log(`✅ Usuário admin: ${adminEmail}`);
    console.log(`✅ Senha admin: ${adminPassword}`);
    console.log('✅ Tabelas criadas: users, videos, questions, question_votes, invite_tokens');
    console.log('✅ Dados de exemplo inseridos');
    console.log('\n🚀 O sistema está pronto para uso!');

  } catch (error) {
    console.error('❌ Erro durante a configuração:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

async function insertSampleData() {
  // Verificar se já existem dados
  const videosCount = await pool.query('SELECT COUNT(*) FROM videos');
  
  if (parseInt(videosCount.rows[0].count) === 0) {
    // Inserir vídeos de exemplo
    const sampleVideos = [
      {
        title: 'Introdução ao WSP Platform',
        description: 'Aprenda os fundamentos do WSP Platform e como navegar pela plataforma de forma eficiente.',
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        platform: 'youtube',
        thumbnail_url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
        category: 'Fundamentos'
      },
      {
        title: 'Técnicas Avançadas de Vendas',
        description: 'Domine as técnicas mais eficazes para aumentar suas conversões e fechar mais negócios.',
        url: 'https://www.youtube.com/watch?v=example1',
        platform: 'youtube',
        thumbnail_url: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800',
        category: 'Vendas'
      },
      {
        title: 'Liderança e Gestão de Equipes',
        description: 'Como liderar equipes de alta performance e criar um ambiente motivador.',
        url: 'https://www.loom.com/share/example',
        platform: 'loom',
        thumbnail_url: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800',
        category: 'Liderança'
      },
      {
        title: 'Estratégias de Prospecção Digital',
        description: 'Aprenda as melhores práticas para prospecção em redes sociais e canais digitais.',
        url: 'https://vimeo.com/example2',
        platform: 'vimeo',
        thumbnail_url: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800',
        category: 'Vendas'
      },
      {
        title: 'Comunicação Assertiva',
        description: 'Desenvolva habilidades de comunicação clara e persuasiva com clientes.',
        url: 'https://www.youtube.com/watch?v=example3',
        platform: 'youtube',
        thumbnail_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800',
        category: 'Técnicas Avançadas'
      }
    ];

    for (const video of sampleVideos) {
      await pool.query(`
        INSERT INTO videos (title, description, url, platform, thumbnail_url, category)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [video.title, video.description, video.url, video.platform, video.thumbnail_url, video.category]);
    }
    console.log('✅ Vídeos de exemplo inseridos');
  }

  // Inserir usuários de exemplo
  const usersCount = await pool.query('SELECT COUNT(*) FROM users WHERE role = $1', ['user']);
  
  if (parseInt(usersCount.rows[0].count) === 0) {
    const sampleUsers = [
      {
        name: 'Carlos Silva',
        email: 'carlos.silva@wsp.com',
        password: await bcrypt.hash('123456', 12),
        role: 'user',
        fraternity_coins: 85.50,
        team: 'blue'
      },
      {
        name: 'Ana Santos',
        email: 'ana.santos@wsp.com',
        password: await bcrypt.hash('123456', 12),
        role: 'user',
        fraternity_coins: 92.30,
        team: 'red'
      },
      {
        name: 'Pedro Oliveira',
        email: 'pedro.oliveira@wsp.com',
        password: await bcrypt.hash('123456', 12),
        role: 'user',
        fraternity_coins: 78.90,
        team: 'green'
      }
    ];

    for (const user of sampleUsers) {
      await pool.query(`
        INSERT INTO users (name, email, password, role, fraternity_coins, team)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [user.name, user.email, user.password, user.role, user.fraternity_coins, user.team]);
    }
    console.log('✅ Usuários de exemplo inseridos');
  }
}

// Executar setup
setupDatabase();