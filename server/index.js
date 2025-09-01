const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
require('dotenv').config({ path: '../.env' });

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'wsp-platform-jwt-secret-key-change-in-production-2024';

// Configuração do banco de dados
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'wsp_platform',
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

// Configuração do email (para sistema de convites)
const emailTransporter = nodemailer.createTransporter({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

// Middleware de autenticação
const authenticateToken = async (req, res, next) => {
  const token = req.cookies.token;
  
  if (!token) {
    return res.status(401).json({ error: 'Token de acesso necessário' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const result = await pool.query('SELECT * FROM users WHERE id = $1 AND is_active = true', [decoded.userId]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Usuário não encontrado ou inativo' });
    }
    
    req.user = result.rows[0];
    next();
  } catch (error) {
    console.error('Erro de autenticação:', error);
    res.status(401).json({ error: 'Token inválido' });
  }
};

// Middleware para admin
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acesso negado - Apenas administradores' });
  }
  next();
};

// ==========================================
// ROTAS DE AUTENTICAÇÃO
// ==========================================

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }
    
    const result = await pool.query('SELECT * FROM users WHERE email = $1 AND is_active = true', [email]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }
    
    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);
    
    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }
    
    // Atualizar último login
    await pool.query('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1', [user.id]);
    
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 dias
    });
    
    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Logout
app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logout realizado com sucesso' });
});

// Verificar autenticação
app.get('/api/auth/me', authenticateToken, (req, res) => {
  const { password, ...userWithoutPassword } = req.user;
  res.json(userWithoutPassword);
});

// Gerar token de convite (apenas admin)
app.post('/api/auth/generate-invite', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email é obrigatório' });
    }

    // Verificar se o email já está cadastrado
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Este email já está cadastrado no sistema' });
    }

    // Verificar se já existe um convite pendente
    const existingInvite = await pool.query(
      'SELECT id FROM invite_tokens WHERE email = $1 AND used = false AND expires_at > CURRENT_TIMESTAMP',
      [email]
    );
    
    if (existingInvite.rows.length > 0) {
      return res.status(400).json({ error: 'Já existe um convite pendente para este email' });
    }

    // Gerar token único
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

    await pool.query(`
      INSERT INTO invite_tokens (token, email, invited_by, expires_at)
      VALUES ($1, $2, $3, $4)
    `, [token, email, req.user.id, expiresAt]);

    // Enviar email (se configurado)
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        const inviteUrl = `${process.env.FRONTEND_URL}/register?token=${token}`;
        await emailTransporter.sendMail({
          from: process.env.EMAIL_USER,
          to: email,
          subject: 'Convite para WSP Platform',
          html: `
            <h2>Você foi convidado para o WSP Platform!</h2>
            <p>Clique no link abaixo para criar sua conta:</p>
            <a href="${inviteUrl}" style="background: #1079e2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
              Criar Conta
            </a>
            <p><small>Este convite expira em 24 horas.</small></p>
          `
        });
      } catch (emailError) {
        console.error('Erro ao enviar email:', emailError);
      }
    }

    res.json({ 
      message: 'Convite gerado com sucesso',
      token,
      inviteUrl: `${process.env.FRONTEND_URL}/register?token=${token}`
    });
  } catch (error) {
    console.error('Erro ao gerar convite:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Validar token de convite
app.get('/api/auth/validate-invite/:token', async (req, res) => {
  try {
    const { token } = req.params;
    
    const result = await pool.query(`
      SELECT email, expires_at FROM invite_tokens 
      WHERE token = $1 AND used = false AND expires_at > CURRENT_TIMESTAMP
    `, [token]);
    
    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Token inválido ou expirado' });
    }
    
    res.json({ email: result.rows[0].email });
  } catch (error) {
    console.error('Erro ao validar convite:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Registro com token
app.post('/api/auth/register', async (req, res) => {
  try {
    const { token, name, password, team } = req.body;
    
    if (!token || !name || !password) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    // Validar token
    const inviteResult = await pool.query(`
      SELECT email FROM invite_tokens 
      WHERE token = $1 AND used = false AND expires_at > CURRENT_TIMESTAMP
    `, [token]);
    
    if (inviteResult.rows.length === 0) {
      return res.status(400).json({ error: 'Token inválido ou expirado' });
    }
    
    const email = inviteResult.rows[0].email;
    
    // Verificar se o usuário já existe
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Usuário já cadastrado' });
    }

    // Criar usuário
    const hashedPassword = await bcrypt.hash(password, 12);
    const userResult = await pool.query(`
      INSERT INTO users (name, email, password, team)
      VALUES ($1, $2, $3, $4)
      RETURNING id, email, name, role, avatar_url, fraternity_coins, team, created_at
    `, [name, email, hashedPassword, team || 'blue']);
    
    // Marcar token como usado
    await pool.query('UPDATE invite_tokens SET used = true WHERE token = $1', [token]);
    
    const newUser = userResult.rows[0];
    const authToken = jwt.sign({ userId: newUser.id }, JWT_SECRET, { expiresIn: '7d' });
    
    res.cookie('token', authToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
    
    res.json(newUser);
  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// ==========================================
// ROTAS DE USUÁRIOS
// ==========================================

// Listar usuários (admin)
app.get('/api/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, email, name, role, avatar_url, fraternity_coins, team, is_active, last_login, created_at 
      FROM users 
      ORDER BY created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar usuário
app.put('/api/users/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, team, avatar_url } = req.body;
    
    // Verificar se é o próprio usuário ou admin
    if (req.user.id !== id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado' });
    }
    
    const result = await pool.query(`
      UPDATE users 
      SET name = $1, email = $2, team = $3, avatar_url = $4, updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING id, email, name, role, avatar_url, fraternity_coins, team, created_at
    `, [name, email, team, avatar_url, id]);
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    if (error.code === '23505') {
      res.status(400).json({ error: 'Este email já está em uso' });
    } else {
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
});

// Desativar usuário (admin)
app.delete('/api/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Não permitir deletar o próprio usuário admin
    if (req.user.id === id) {
      return res.status(400).json({ error: 'Não é possível deletar seu próprio usuário' });
    }
    
    await pool.query('UPDATE users SET is_active = false WHERE id = $1', [id]);
    res.json({ message: 'Usuário desativado com sucesso' });
  } catch (error) {
    console.error('Erro ao desativar usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// ==========================================
// ROTAS DE VÍDEOS
// ==========================================

// Listar vídeos
app.get('/api/videos', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT v.*, q.title as question_title 
      FROM videos v 
      LEFT JOIN questions q ON v.question_id = q.id 
      WHERE v.is_active = true
      ORDER BY v.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar vídeos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Criar vídeo (admin)
app.post('/api/videos', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { title, description, url, platform, thumbnail_url, category, questionId } = req.body;
    
    if (!title || !description || !url || !platform || !category) {
      return res.status(400).json({ error: 'Todos os campos obrigatórios devem ser preenchidos' });
    }
    
    const result = await pool.query(`
      INSERT INTO videos (title, description, url, platform, thumbnail_url, category, question_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [title, description, url, platform, thumbnail_url, category, questionId || null]);
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar vídeo:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar vídeo (admin)
app.put('/api/videos/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, url, platform, thumbnail_url, category, questionId } = req.body;
    
    const result = await pool.query(`
      UPDATE videos 
      SET title = $1, description = $2, url = $3, platform = $4, 
          thumbnail_url = $5, category = $6, question_id = $7, updated_at = CURRENT_TIMESTAMP
      WHERE id = $8 AND is_active = true
      RETURNING *
    `, [title, description, url, platform, thumbnail_url, category, questionId || null, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Vídeo não encontrado' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar vídeo:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Deletar vídeo (admin)
app.delete('/api/videos/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('UPDATE videos SET is_active = false WHERE id = $1', [id]);
    res.json({ message: 'Vídeo removido com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar vídeo:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// ==========================================
// ROTAS DE PERGUNTAS
// ==========================================

// Listar perguntas
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
      ORDER BY vote_counts.votes_count DESC NULLS LAST, q.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar perguntas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Criar pergunta
app.post('/api/questions', authenticateToken, async (req, res) => {
  try {
    const { title, description, category } = req.body;
    
    if (!title || !description || !category) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }
    
    const result = await pool.query(`
      INSERT INTO questions (user_id, title, description, category)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [req.user.id, title, description, category]);
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar pergunta:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Votar em pergunta
app.post('/api/questions/:id/vote', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar se a pergunta existe
    const questionExists = await pool.query('SELECT id FROM questions WHERE id = $1', [id]);
    if (questionExists.rows.length === 0) {
      return res.status(404).json({ error: 'Pergunta não encontrada' });
    }
    
    // Verificar se o usuário já votou
    const existingVote = await pool.query(
      'SELECT id FROM question_votes WHERE question_id = $1 AND user_id = $2',
      [id, req.user.id]
    );
    
    if (existingVote.rows.length > 0) {
      // Remover voto
      await pool.query(
        'DELETE FROM question_votes WHERE question_id = $1 AND user_id = $2',
        [id, req.user.id]
      );
      res.json({ message: 'Voto removido', action: 'removed' });
    } else {
      // Adicionar voto
      await pool.query(
        'INSERT INTO question_votes (question_id, user_id) VALUES ($1, $2)',
        [id, req.user.id]
      );
      res.json({ message: 'Voto adicionado', action: 'added' });
    }
  } catch (error) {
    console.error('Erro ao votar:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar status da pergunta (admin)
app.put('/api/questions/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, video_id } = req.body;
    
    const result = await pool.query(`
      UPDATE questions 
      SET status = $1, video_id = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
    `, [status, video_id || null, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Pergunta não encontrada' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar pergunta:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// ==========================================
// ROTAS DE CONVITES (ADMIN)
// ==========================================

// Listar convites pendentes
app.get('/api/invites', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        it.*,
        u.name as invited_by_name
      FROM invite_tokens it
      JOIN users u ON it.invited_by = u.id
      ORDER BY it.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar convites:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// ==========================================
// ROTA DE ESTATÍSTICAS (ADMIN)
// ==========================================

app.get('/api/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [usersCount, videosCount, questionsCount, pendingQuestions] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM users WHERE is_active = true'),
      pool.query('SELECT COUNT(*) FROM videos WHERE is_active = true'),
      pool.query('SELECT COUNT(*) FROM questions'),
      pool.query('SELECT COUNT(*) FROM questions WHERE status = $1', ['pending'])
    ]);

    res.json({
      users: parseInt(usersCount.rows[0].count),
      videos: parseInt(videosCount.rows[0].count),
      questions: parseInt(questionsCount.rows[0].count),
      pendingQuestions: parseInt(pendingQuestions.rows[0].count)
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// ==========================================
// INICIALIZAÇÃO DO SERVIDOR
// ==========================================

const startServer = async () => {
  try {
    // Testar conexão com o banco
    console.log('📡 Testando conexão com PostgreSQL...');
    await pool.query('SELECT NOW()');
    console.log('✅ Conexão com PostgreSQL estabelecida!');
    
    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor WSP Platform rodando na porta ${PORT}`);
      console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
      console.log(`📧 Admin: ${process.env.ADMIN_EMAIL || 'admin@wsp.com'}`);
      console.log(`🔑 Senha: ${process.env.ADMIN_PASSWORD || 'WSP@Admin2024!'}`);
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    console.error('💡 Verifique se o PostgreSQL está rodando e as credenciais estão corretas no arquivo .env');
    process.exit(1);
  }
};

// Tratamento de erros não capturados
process.on('unhandledRejection', (err) => {
  console.error('❌ Erro não tratado:', err);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('❌ Exceção não capturada:', err);
  process.exit(1);
});

startServer();