const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Database connection
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'wsp_platform',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
});

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Auth middleware
const authenticateToken = async (req, res, next) => {
  const token = req.cookies.token;
  
  if (!token) {
    return res.status(401).json({ error: 'Access denied' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [decoded.userId]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    req.user = result.rows[0];
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Initialize database tables
const initDatabase = async () => {
  try {
    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        avatar_url TEXT,
        fraternity_coins DECIMAL(10,2) DEFAULT 0,
        team VARCHAR(50) DEFAULT 'blue',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create videos table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS videos (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        url TEXT NOT NULL,
        platform VARCHAR(50) NOT NULL,
        thumbnail_url TEXT,
        category VARCHAR(100) NOT NULL,
        question_id UUID,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create questions table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS questions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id),
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        category VARCHAR(100) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        video_id UUID REFERENCES videos(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create question_votes table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS question_votes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(question_id, user_id)
      )
    `);

    // Insert admin user if not exists
    const adminExists = await pool.query('SELECT id FROM users WHERE email = $1', ['admin@wsp.com']);
    if (adminExists.rows.length === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await pool.query(`
        INSERT INTO users (email, password, name, role, fraternity_coins)
        VALUES ($1, $2, $3, $4, $5)
      `, ['admin@wsp.com', hashedPassword, 'Administrator', 'admin', 100]);
    }

    // Insert sample videos if not exists
    const videosExist = await pool.query('SELECT id FROM videos LIMIT 1');
    if (videosExist.rows.length === 0) {
      const sampleVideos = [
        {
          title: 'Introdução ao WSP Platform',
          description: 'Aprenda os fundamentos do WSP Platform e como navegar pela plataforma.',
          url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          platform: 'youtube',
          thumbnail_url: 'https://storage.googleapis.com/wisersp/storage/wsp-banners/flavio-live.png',
          category: 'Fundamentos'
        },
        {
          title: 'Técnicas Avançadas de Vendas',
          description: 'Aprenda técnicas avançadas para melhorar suas vendas e conversões.',
          url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          platform: 'youtube',
          thumbnail_url: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800',
          category: 'Vendas'
        },
        {
          title: 'Liderança e Gestão de Equipes',
          description: 'Como liderar equipes de alta performance e motivar sua equipe.',
          url: 'https://www.loom.com/share/example',
          platform: 'loom',
          thumbnail_url: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800',
          category: 'Liderança'
        },
        {
          title: 'Estratégias de Prospecção Digital',
          description: 'Domine as melhores práticas para prospecção em redes sociais e canais digitais.',
          url: 'https://www.youtube.com/watch?v=example1',
          platform: 'youtube',
          thumbnail_url: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800',
          category: 'Vendas'
        },
        {
          title: 'Comunicação Assertiva em Vendas',
          description: 'Aprenda a se comunicar de forma clara e persuasiva com seus clientes.',
          url: 'https://vimeo.com/example2',
          platform: 'vimeo',
          thumbnail_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800',
          category: 'Técnicas Avançadas'
        },
        {
          title: 'Gestão de Objeções',
          description: 'Como lidar com objeções de clientes e transformá-las em oportunidades.',
          url: 'https://www.loom.com/share/example3',
          platform: 'loom',
          thumbnail_url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800',
          category: 'Vendas'
        },
        {
          title: 'Construindo Relacionamentos Duradouros',
          description: 'Estratégias para criar vínculos sólidos com clientes e parceiros.',
          url: 'https://www.youtube.com/watch?v=example4',
          platform: 'youtube',
          thumbnail_url: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800',
          category: 'Liderança'
        },
        {
          title: 'Análise de Performance de Vendas',
          description: 'Como analisar métricas e KPIs para otimizar seus resultados.',
          url: 'https://vimeo.com/example5',
          platform: 'vimeo',
          thumbnail_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
          category: 'Técnicas Avançadas'
        },
        {
          title: 'Motivação e Engajamento de Equipes',
          description: 'Técnicas para manter sua equipe motivada e engajada.',
          url: 'https://www.loom.com/share/example6',
          platform: 'loom',
          thumbnail_url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800',
          category: 'Liderança'
        },
        {
          title: 'Fundamentos do CRM',
          description: 'Como utilizar sistemas CRM para maximizar suas vendas.',
          url: 'https://www.youtube.com/watch?v=example7',
          platform: 'youtube',
          thumbnail_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
          category: 'Fundamentos'
        }
      ];

      for (const video of sampleVideos) {
        await pool.query(`
          INSERT INTO videos (title, description, url, platform, thumbnail_url, category)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [video.title, video.description, video.url, video.platform, video.thumbnail_url, video.category]);
      }
    }

    // Insert sample users if not exists
    const usersCount = await pool.query('SELECT COUNT(*) FROM users');
    if (parseInt(usersCount.rows[0].count) <= 1) { // Only admin exists
      const sampleUsers = [
        {
          name: 'Carlos Silva',
          email: 'carlos.silva@wsp.com',
          password: await bcrypt.hash('123456', 10),
          role: 'user',
          fraternity_coins: 85.50,
          team: 'blue'
        },
        {
          name: 'Ana Santos',
          email: 'ana.santos@wsp.com',
          password: await bcrypt.hash('123456', 10),
          role: 'user',
          fraternity_coins: 92.30,
          team: 'red'
        },
        {
          name: 'Pedro Oliveira',
          email: 'pedro.oliveira@wsp.com',
          password: await bcrypt.hash('123456', 10),
          role: 'user',
          fraternity_coins: 78.90,
          team: 'green'
        },
        {
          name: 'Maria Costa',
          email: 'maria.costa@wsp.com',
          password: await bcrypt.hash('123456', 10),
          role: 'user',
          fraternity_coins: 105.75,
          team: 'yellow'
        },
        {
          name: 'João Ferreira',
          email: 'joao.ferreira@wsp.com',
          password: await bcrypt.hash('123456', 10),
          role: 'user',
          fraternity_coins: 67.20,
          team: 'blue'
        },
        {
          name: 'Lucia Rodrigues',
          email: 'lucia.rodrigues@wsp.com',
          password: await bcrypt.hash('123456', 10),
          role: 'user',
          fraternity_coins: 89.40,
          team: 'red'
        }
      ];

      for (const user of sampleUsers) {
        await pool.query(`
          INSERT INTO users (name, email, password, role, fraternity_coins, team)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [user.name, user.email, user.password, user.role, user.fraternity_coins, user.team]);
      }
    }

    // Insert sample questions if not exists
    const questionsExist = await pool.query('SELECT id FROM questions LIMIT 1');
    if (questionsExist.rows.length === 0) {
      // Get user IDs for sample questions
      const users = await pool.query('SELECT id, name, team FROM users WHERE role = $1', ['user']);
      
      if (users.rows.length > 0) {
        const sampleQuestions = [
          {
            user_id: users.rows[0].id,
            title: 'Como melhorar a taxa de conversão?',
            description: 'Estou com dificuldades para converter leads em vendas. Quais são as melhores práticas?',
            category: 'Vendas'
          },
          {
            user_id: users.rows[1]?.id || users.rows[0].id,
            title: 'Estratégias para motivar a equipe',
            description: 'Como posso manter minha equipe motivada durante períodos de baixa performance?',
            category: 'Liderança'
          },
          {
            user_id: users.rows[2]?.id || users.rows[0].id,
            title: 'Uso eficiente do CRM',
            description: 'Quais são as funcionalidades mais importantes do CRM que devo focar?',
            category: 'Fundamentos'
          },
          {
            user_id: users.rows[3]?.id || users.rows[0].id,
            title: 'Técnicas de follow-up',
            description: 'Qual é a frequência ideal para fazer follow-up com prospects?',
            category: 'Técnicas Avançadas'
          },
          {
            user_id: users.rows[4]?.id || users.rows[0].id,
            title: 'Prospecção no LinkedIn',
            description: 'Como criar uma estratégia eficaz de prospecção no LinkedIn?',
            category: 'Vendas'
          }
        ];

        for (const question of sampleQuestions) {
          const result = await pool.query(`
            INSERT INTO questions (user_id, title, description, category)
            VALUES ($1, $2, $3, $4)
            RETURNING id
          `, [question.user_id, question.title, question.description, question.category]);
          
          // Add some sample votes
          const questionId = result.rows[0].id;
          const votersCount = Math.floor(Math.random() * 4) + 1; // 1-4 votes
          
          for (let i = 0; i < votersCount && i < users.rows.length; i++) {
            try {
              await pool.query(`
                INSERT INTO question_votes (question_id, user_id)
                VALUES ($1, $2)
              `, [questionId, users.rows[i].id]);
            } catch (err) {
              // Ignore duplicate vote errors
            }
          }
        }
      }
    }

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
  }
};

// Routes

// Auth routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);
    
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    
    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
  const { password, ...userWithoutPassword } = req.user;
  res.json(userWithoutPassword);
});

// Videos routes
app.get('/api/videos', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT v.*, q.title as question_title 
      FROM videos v 
      LEFT JOIN questions q ON v.question_id = q.id 
      ORDER BY v.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/videos', authenticateToken, async (req, res) => {
  try {
    const { title, description, url, platform, thumbnail_url, category, questionId } = req.body;
    
    const result = await pool.query(`
      INSERT INTO videos (title, description, url, platform, thumbnail_url, category, question_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [title, description, url, platform, thumbnail_url, category, questionId || null]);
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/videos/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, url, platform, thumbnail_url, category, questionId } = req.body;
    
    const result = await pool.query(`
      UPDATE videos 
      SET title = $1, description = $2, url = $3, platform = $4, 
          thumbnail_url = $5, category = $6, question_id = $7, updated_at = CURRENT_TIMESTAMP
      WHERE id = $8
      RETURNING *
    `, [title, description, url, platform, thumbnail_url, category, questionId || null, id]);
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/videos/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM videos WHERE id = $1', [id]);
    res.json({ message: 'Video deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Questions routes
app.get('/api/questions', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        q.*,
        u.name as user_name,
        u.team as user_team,
        COALESCE(vote_counts.votes_count, 0) as votes_count,
        COALESCE(voters.voters, '[]'::json) as voters
      FROM questions q
      JOIN users u ON q.user_id = u.id
      LEFT JOIN (
        SELECT question_id, COUNT(*) as votes_count
        FROM question_votes
        GROUP BY question_id
      ) vote_counts ON q.id = vote_counts.question_id
      LEFT JOIN (
        SELECT 
          qv.question_id,
          json_agg(json_build_object('id', u.id, 'name', u.name, 'team', u.team)) as voters
        FROM question_votes qv
        JOIN users u ON qv.user_id = u.id
        GROUP BY qv.question_id
      ) voters ON q.id = voters.question_id
      ORDER BY q.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/questions', authenticateToken, async (req, res) => {
  try {
    const { title, description, category } = req.body;
    
    const result = await pool.query(`
      INSERT INTO questions (user_id, title, description, category)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [req.user.id, title, description, category]);
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/questions/:id/vote', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user already voted
    const existingVote = await pool.query(
      'SELECT id FROM question_votes WHERE question_id = $1 AND user_id = $2',
      [id, req.user.id]
    );
    
    if (existingVote.rows.length > 0) {
      // Remove vote
      await pool.query(
        'DELETE FROM question_votes WHERE question_id = $1 AND user_id = $2',
        [id, req.user.id]
      );
    } else {
      // Add vote
      await pool.query(
        'INSERT INTO question_votes (question_id, user_id) VALUES ($1, $2)',
        [id, req.user.id]
      );
    }
    
    res.json({ message: 'Vote updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Users routes (admin only)
app.get('/api/users', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const result = await pool.query('SELECT id, email, name, role, avatar_url, fraternity_coins, team, created_at FROM users ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/users', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const { name, email, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const result = await pool.query(`
      INSERT INTO users (name, email, password, role)
      VALUES ($1, $2, $3, $4)
      RETURNING id, email, name, role, avatar_url, fraternity_coins, team, created_at
    `, [name, email, hashedPassword, role]);
    
    res.json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      res.status(400).json({ error: 'Email already exists' });
    } else {
      res.status(500).json({ error: 'Server error' });
    }
  }
});

// Start server
const startServer = async () => {
  try {
    await initDatabase();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
  }
};

startServer();