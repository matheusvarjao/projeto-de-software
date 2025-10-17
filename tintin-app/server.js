/*
TINTIN Full-Stack Server com SQLite
Setup:
  1) npm init -y
  2) npm install express socket.io cors bcryptjs jsonwebtoken dotenv better-sqlite3
  3) node server.js
*/

require('dotenv').config();
const express = require('express');
const http = require('http');
const path = require('path');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Server } = require('socket.io');
const Database = require('better-sqlite3');

const PORT = process.env.PORT || 3000;
const SECRET = process.env.SECRET_KEY || 'dev_secret_change_me_in_production';
const NODE_ENV = process.env.NODE_ENV || 'development';

const app = express();
const server = http.createServer(app);

// CORS configurado
const corsOptions = {
  origin: process.env.FRONTEND_URL || ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

const io = new Server(server, {
  cors: corsOptions,
  transports: ['websocket', 'polling']
});

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// ===== SQLITE DATABASE =====
const db = new Database('tintin.db');
db.pragma('journal_mode = WAL');

// Criar tabelas
function initDatabase() {
  // Tabela de usuários
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      passwordHash TEXT NOT NULL,
      avatarUrl TEXT,
      bio TEXT,
      ratingSum INTEGER DEFAULT 0,
      ratingCount INTEGER DEFAULT 0,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Tabela de likes/swipes
  db.exec(`
    CREATE TABLE IF NOT EXISTS likes (
      id TEXT PRIMARY KEY,
      fromUserId TEXT NOT NULL,
      toUserId TEXT NOT NULL,
      action TEXT CHECK(action IN ('like', 'pass')),
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(fromUserId) REFERENCES users(id),
      FOREIGN KEY(toUserId) REFERENCES users(id)
    )
  `);

  // Tabela de matches
  db.exec(`
    CREATE TABLE IF NOT EXISTS matches (
      id TEXT PRIMARY KEY,
      userA TEXT NOT NULL,
      userB TEXT NOT NULL,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(userA) REFERENCES users(id),
      FOREIGN KEY(userB) REFERENCES users(id)
    )
  `);

  // Tabela de mensagens
  db.exec(`
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      matchId TEXT NOT NULL,
      senderId TEXT NOT NULL,
      content TEXT NOT NULL,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(matchId) REFERENCES matches(id),
      FOREIGN KEY(senderId) REFERENCES users(id)
    )
  `);

  // Tabela de skills
  db.exec(`
    CREATE TABLE IF NOT EXISTS skills (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      skill TEXT NOT NULL,
      mode TEXT CHECK(mode IN ('teach', 'learn')),
      FOREIGN KEY(userId) REFERENCES users(id)
    )
  `);

  console.log('✓ Banco de dados inicializado');
}

let nextId = 1;
function genId(prefix = 'id') { 
  return `${prefix}_${nextId++}_${Date.now()}` 
}

// ===== AUTENTICAÇÃO =====
function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email }, 
    SECRET, 
    { expiresIn: '7d' }
  );
}

function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'Token ausente' });
  
  const token = auth.replace('Bearer ', '');
  try {
    const data = jwt.verify(token, SECRET);
    req.userId = data.id;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Token inválido ou expirado' });
  }
}

// ===== SEED DEMO =====
function seed() {
  const checkUser = db.prepare('SELECT id FROM users WHERE email = ?').get('ana@example.com');
  if (checkUser) {
    console.log('✓ Dados demo já existem');
    return;
  }

  const demo = [
    { name: 'Ana Silva', email: 'ana@example.com', skills: [{ skill: 'Inglês', mode: 'teach' }, { skill: 'Python', mode: 'learn' }], bio: 'Gosta de ensinar conversação.' },
    { name: 'Bruno Costa', email: 'bruno@example.com', skills: [{ skill: 'JavaScript', mode: 'teach' }, { skill: 'Espanhol', mode: 'learn' }], bio: 'Dev fullstack que quer praticar espanhol.' },
    { name: 'Carla Gomes', email: 'carla@example.com', skills: [{ skill: 'Matemática', mode: 'teach' }, { skill: 'Guitarra', mode: 'learn' }], bio: 'Professora de matemática.' },
    { name: 'Diego Melo', email: 'diego@example.com', skills: [{ skill: 'Design', mode: 'teach' }, { skill: 'Inglês', mode: 'learn' }], bio: 'Designer UX.' },
    { name: 'Eva Luz', email: 'eva@example.com', skills: [{ skill: 'Português', mode: 'teach' }, { skill: 'Python', mode: 'learn' }], bio: 'Jornalista e entusiasta de dados.' }
  ];

  const insertUser = db.prepare(`
    INSERT INTO users (id, name, email, passwordHash, bio)
    VALUES (?, ?, ?, ?, ?)
  `);

  const insertSkill = db.prepare(`
    INSERT INTO skills (id, userId, skill, mode)
    VALUES (?, ?, ?, ?)
  `);

  demo.forEach((d) => {
    const id = genId('u');
    const passwordHash = bcrypt.hashSync('password', 8);
    
    insertUser.run(id, d.name, d.email, passwordHash, d.bio);
    
    d.skills.forEach((s) => {
      insertSkill.run(genId('skill'), id, s.skill, s.mode);
    });
  });

  console.log(`✓ ${demo.length} usuários demo criados`);
}

// ===== ROTAS DE AUTENTICAÇÃO =====
app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
  }
  
  try {
    const id = genId('u');
    const passwordHash = bcrypt.hashSync(password, 8);
    
    const stmt = db.prepare(`
      INSERT INTO users (id, name, email, passwordHash)
      VALUES (?, ?, ?, ?)
    `);
    stmt.run(id, name, email, passwordHash);
    
    const user = { id, name, email, avatarUrl: '', skills: [], bio: '' };
    const token = generateToken(user);
    
    res.status(201).json({
      token,
      user: { id, name, email, avatarUrl: user.avatarUrl, skills: user.skills, bio: user.bio }
    });
  } catch (e) {
    if (e.message.includes('UNIQUE')) {
      return res.status(400).json({ error: 'Email já registrado' });
    }
    res.status(500).json({ error: 'Erro ao registrar' });
  }
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email e senha obrigatórios' });
  }
  
  try {
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    const user = stmt.get(email);
    
    if (!user) return res.status(401).json({ error: 'Credenciais inválidas' });
    if (!bcrypt.compareSync(password, user.passwordHash)) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }
    
    // Obter skills
    const skillStmt = db.prepare('SELECT skill, mode FROM skills WHERE userId = ?');
    const skills = skillStmt.all(user.id);
    
    const token = generateToken(user);
    res.json({
      token,
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        avatarUrl: user.avatarUrl || '', 
        skills, 
        bio: user.bio || '' 
      }
    });
  } catch (e) {
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
});

// ===== ROTAS DE USUÁRIO =====
app.get('/api/users/me', authMiddleware, (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
    const user = stmt.get(req.userId);
    
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
    
    const skillStmt = db.prepare('SELECT skill, mode FROM skills WHERE userId = ?');
    const skills = skillStmt.all(user.id);
    
    const ratingAvg = user.ratingCount ? (user.ratingSum / user.ratingCount).toFixed(2) : null;
    
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl || '',
      skills,
      bio: user.bio || '',
      ratingAvg,
      createdAt: user.createdAt
    });
  } catch (e) {
    res.status(500).json({ error: 'Erro ao obter usuário' });
  }
});

app.put('/api/users/me', authMiddleware, (req, res) => {
  const { name, avatarUrl, skills, bio } = req.body;
  
  try {
    const updateStmt = db.prepare(`
      UPDATE users SET name = ?, avatarUrl = ?, bio = ? WHERE id = ?
    `);
    updateStmt.run(name || null, avatarUrl || null, bio || null, req.userId);
    
    if (skills && Array.isArray(skills)) {
      // Deletar skills antigas
      db.prepare('DELETE FROM skills WHERE userId = ?').run(req.userId);
      
      // Inserir novas skills
      const insertSkill = db.prepare(`
        INSERT INTO skills (id, userId, skill, mode) VALUES (?, ?, ?, ?)
      `);
      
      skills.forEach(s => {
        insertSkill.run(genId('skill'), req.userId, s.skill, s.mode || 'learn');
      });
    }
    
    res.json({ ok: true, message: 'Perfil atualizado com sucesso' });
  } catch (e) {
    res.status(500).json({ error: 'Erro ao atualizar perfil' });
  }
});

// ===== ROTAS DE SWIPE =====
app.get('/api/swipe/cards', authMiddleware, (req, res) => {
  try {
    const seenStmt = db.prepare(`
      SELECT toUserId FROM likes WHERE fromUserId = ?
    `);
    const seen = seenStmt.all(req.userId).map(l => l.toUserId);
    
    const placeholders = seen.map(() => '?').join(',') || '?';
    const query = `
      SELECT u.*, GROUP_CONCAT(s.skill || ':' || s.mode, ',') as skills_str
      FROM users u
      LEFT JOIN skills s ON u.id = s.userId
      WHERE u.id != ? AND u.id NOT IN (${placeholders})
      GROUP BY u.id
    `;
    
    const params = [req.userId, ...seen];
    const stmt = db.prepare(query);
    const users = stmt.all(...params);
    
    const cards = users.map(u => ({
      id: u.id,
      name: u.name,
      avatarUrl: u.avatarUrl || '',
      bio: u.bio || '',
      skills: u.skills_str ? u.skills_str.split(',').map(s => {
        const [skill, mode] = s.split(':');
        return { skill, mode };
      }) : [],
      ratingAvg: u.ratingCount ? (u.ratingSum / u.ratingCount).toFixed(2) : null
    }));
    
    res.json(cards);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erro ao obter cards' });
  }
});

app.post('/api/swipe/action', authMiddleware, (req, res) => {
  const { targetUserId, action } = req.body;
  
  if (!targetUserId || !action) {
    return res.status(400).json({ error: 'targetUserId e action são obrigatórios' });
  }
  
  if (!['like', 'pass'].includes(action)) {
    return res.status(400).json({ error: 'Action deve ser "like" ou "pass"' });
  }
  
  try {
    const likeId = genId('like');
    const stmt = db.prepare(`
      INSERT INTO likes (id, fromUserId, toUserId, action)
      VALUES (?, ?, ?, ?)
    `);
    stmt.run(likeId, req.userId, targetUserId, action);
    
    if (action === 'like') {
      const reciprocalStmt = db.prepare(`
        SELECT id FROM likes 
        WHERE fromUserId = ? AND toUserId = ? AND action = 'like'
      `);
      const reciprocal = reciprocalStmt.get(targetUserId, req.userId);
      
      if (reciprocal) {
        const matchId = genId('m');
        const matchStmt = db.prepare(`
          INSERT INTO matches (id, userA, userB)
          VALUES (?, ?, ?)
        `);
        matchStmt.run(matchId, req.userId, targetUserId);
        
        io.to(req.userId).emit('matched', { matchId, with: targetUserId });
        io.to(targetUserId).emit('matched', { matchId, with: req.userId });
        
        return res.json({ ok: true, match: true, matchId });
      }
    }
    
    res.json({ ok: true, match: false });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erro ao fazer swipe' });
  }
});

// ===== ROTAS DE MATCH E MENSAGENS =====
app.get('/api/matches', authMiddleware, (req, res) => {
  try {
    const stmt = db.prepare(`
      SELECT id, CASE WHEN userA = ? THEN userB ELSE userA END as other, createdAt
      FROM matches
      WHERE userA = ? OR userB = ?
    `);
    const matches = stmt.all(req.userId, req.userId, req.userId);
    res.json(matches);
  } catch (e) {
    res.status(500).json({ error: 'Erro ao obter matches' });
  }
});

app.get('/api/matches/:id/messages', authMiddleware, (req, res) => {
  try {
    const matchStmt = db.prepare(`
      SELECT * FROM matches WHERE id = ? AND (userA = ? OR userB = ?)
    `);
    const match = matchStmt.get(req.params.id, req.userId, req.userId);
    
    if (!match) return res.status(404).json({ error: 'Match não encontrado' });
    
    const msgStmt = db.prepare(`
      SELECT * FROM messages WHERE matchId = ? ORDER BY createdAt ASC
    `);
    const messages = msgStmt.all(req.params.id);
    res.json(messages);
  } catch (e) {
    res.status(500).json({ error: 'Erro ao obter mensagens' });
  }
});

// ===== ROTAS DE AVALIAÇÃO =====
app.post('/api/ratings', authMiddleware, (req, res) => {
  const { toUserId, stars } = req.body;
  
  if (!toUserId || !stars) {
    return res.status(400).json({ error: 'toUserId e stars são obrigatórios' });
  }
  
  try {
    const userStmt = db.prepare('SELECT * FROM users WHERE id = ?');
    const user = userStmt.get(toUserId);
    
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
    
    const updateStmt = db.prepare(`
      UPDATE users SET ratingSum = ratingSum + ?, ratingCount = ratingCount + 1 WHERE id = ?
    `);
    updateStmt.run(Number(stars), toUserId);
    
    const updated = userStmt.get(toUserId);
    const avg = (updated.ratingSum / updated.ratingCount).toFixed(2);
    
    res.json({ ok: true, avg });
  } catch (e) {
    res.status(500).json({ error: 'Erro ao avaliar' });
  }
});

// ===== SERVE STATIC =====
app.get('/api/health', (req, res) => {
  try {
    const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
    res.json({ status: 'OK', environment: NODE_ENV, users: userCount });
  } catch (e) {
    res.status(500).json({ status: 'ERROR', error: e.message });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ===== WEBSOCKET =====
io.use((socket, next) => {
  const token = socket.handshake.auth && socket.handshake.auth.token;
  if (!token) return next(new Error('Token ausente'));
  
  try {
    const data = jwt.verify(token, SECRET);
    socket.userId = data.id;
    return next();
  } catch (e) {
    return next(new Error('Token inválido'));
  }
});

io.on('connection', (socket) => {
  console.log(`✓ Usuário ${socket.userId} conectado`);
  socket.join(socket.userId);
  
  socket.on('send_message', (payload) => {
    const { matchId, content } = payload;
    
    try {
      const matchStmt = db.prepare(`
        SELECT * FROM matches WHERE id = ? AND (userA = ? OR userB = ?)
      `);
      const match = matchStmt.get(matchId, socket.userId, socket.userId);
      
      if (!match) {
        socket.emit('error', 'Match não encontrado');
        return;
      }
      
      const msgId = genId('msg');
      const insertMsg = db.prepare(`
        INSERT INTO messages (id, matchId, senderId, content)
        VALUES (?, ?, ?, ?)
      `);
      insertMsg.run(msgId, matchId, socket.userId, content);
      
      const msg = {
        id: msgId,
        matchId,
        senderId: socket.userId,
        content,
        createdAt: new Date().toISOString()
      };
      
      io.to(match.userA).emit('message', msg);
      io.to(match.userB).emit('message', msg);
    } catch (e) {
      console.error(e);
      socket.emit('error', 'Erro ao enviar mensagem');
    }
  });
  
  socket.on('disconnect', () => {
    console.log(`✗ Usuário ${socket.userId} desconectado`);
  });
});

// ===== INICIALIZAÇÃO =====
initDatabase();
seed();

server.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════╗
║    TINTIN Server Running ✓        ║
║  http://localhost:${PORT}          
║  Database: SQLite (tintin.db)
║  Environment: ${NODE_ENV}
║  Socket.io: Ativo
╚═══════════════════════════════════╝
  `);
});

module.exports = app;