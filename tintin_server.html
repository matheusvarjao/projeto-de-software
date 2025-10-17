/*
TINTIN Full-Stack Server - Corrigido para Deploy
Setup:
  1) npm init -y
  2) npm install express socket.io cors bcryptjs jsonwebtoken dotenv
  3) Criar arquivo .env com: PORT=3000, SECRET_KEY=sua_chave_secreta
  4) node server.js

Para deploy (GitHub Pages + Vercel/Heroku):
  - Use variáveis de ambiente
  - Configure CORS corretamente
  - Use porta dinâmica do servidor
*/

require('dotenv').config();
const express = require('express');
const http = require('http');
const path = require('path');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Server } = require('socket.io');

const PORT = process.env.PORT || 3000;
const SECRET = process.env.SECRET_KEY || 'dev_secret_change_me_in_production';
const NODE_ENV = process.env.NODE_ENV || 'development';

const app = express();
const server = http.createServer(app);

// CORS configurado para produção
const corsOptions = {
  origin: process.env.FRONTEND_URL || ['http://localhost:3000', 'http://localhost:3001'],
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

// In-memory stores (em produção, use banco de dados)
const users = [];
const likes = [];
const matches = [];
const messages = {};

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
  const demo = [
    { name: 'Ana Silva', email: 'ana@example.com', skills: [{ skill: 'Inglês', mode: 'teach' }, { skill: 'Python', mode: 'learn' }], bio: 'Gosta de ensinar conversação.' },
    { name: 'Bruno Costa', email: 'bruno@example.com', skills: [{ skill: 'JavaScript', mode: 'teach' }, { skill: 'Espanhol', mode: 'learn' }], bio: 'Dev fullstack que quer praticar espanhol.' },
    { name: 'Carla Gomes', email: 'carla@example.com', skills: [{ skill: 'Matemática', mode: 'teach' }, { skill: 'Guitarra', mode: 'learn' }], bio: 'Professora de matemática.' },
    { name: 'Diego Melo', email: 'diego@example.com', skills: [{ skill: 'Design', mode: 'teach' }, { skill: 'Inglês', mode: 'learn' }], bio: 'Designer UX.' },
    { name: 'Eva Luz', email: 'eva@example.com', skills: [{ skill: 'Português', mode: 'teach' }, { skill: 'Python', mode: 'learn' }], bio: 'Jornalista e entusiasta de dados.' }
  ];
  
  demo.forEach((d) => {
    const id = genId('u');
    users.push({
      id,
      name: d.name,
      email: d.email,
      passwordHash: bcrypt.hashSync('password', 8),
      avatarUrl: '',
      skills: d.skills,
      bio: d.bio,
      ratingSum: 0,
      ratingCount: 0,
      createdAt: new Date().toISOString()
    });
  });
  console.log(`✓ ${users.length} usuários demo criados`);
}

// ===== ROTAS DE AUTENTICAÇÃO =====
app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
  }
  
  if (users.find(u => u.email === email)) {
    return res.status(400).json({ error: 'Email já registrado' });
  }
  
  const id = genId('u');
  const passwordHash = bcrypt.hashSync(password, 8);
  const user = {
    id, name, email, passwordHash,
    avatarUrl: '',
    skills: [],
    bio: '',
    ratingSum: 0,
    ratingCount: 0,
    createdAt: new Date().toISOString()
  };
  
  users.push(user);
  const token = generateToken(user);
  
  res.status(201).json({
    token,
    user: { id, name, email, avatarUrl: user.avatarUrl, skills: user.skills, bio: user.bio }
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email e senha obrigatórios' });
  }
  
  const user = users.find(u => u.email === email);
  if (!user) return res.status(401).json({ error: 'Credenciais inválidas' });
  
  if (!bcrypt.compareSync(password, user.passwordHash)) {
    return res.status(401).json({ error: 'Credenciais inválidas' });
  }
  
  const token = generateToken(user);
  res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, avatarUrl: user.avatarUrl, skills: user.skills, bio: user.bio }
  });
});

// ===== ROTAS DE USUÁRIO =====
app.get('/api/users/me', authMiddleware, (req, res) => {
  const user = users.find(u => u.id === req.userId);
  if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
  
  const ratingAvg = user.ratingCount ? (user.ratingSum / user.ratingCount).toFixed(2) : null;
  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl,
    skills: user.skills,
    bio: user.bio,
    ratingAvg,
    createdAt: user.createdAt
  });
});

app.put('/api/users/me', authMiddleware, (req, res) => {
  const user = users.find(u => u.id === req.userId);
  if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
  
  const { name, avatarUrl, skills, bio } = req.body;
  if (name) user.name = name;
  if (avatarUrl) user.avatarUrl = avatarUrl;
  if (skills) user.skills = skills;
  if (bio) user.bio = bio;
  
  res.json({ ok: true, message: 'Perfil atualizado com sucesso' });
});

// ===== ROTAS DE SWIPE =====
app.get('/api/swipe/cards', authMiddleware, (req, res) => {
  const seen = new Set(likes.filter(l => l.from === req.userId).map(l => l.to));
  const cards = users
    .filter(u => u.id !== req.userId && !seen.has(u.id))
    .map(u => ({
      id: u.id,
      name: u.name,
      avatarUrl: u.avatarUrl,
      skills: u.skills,
      bio: u.bio,
      ratingAvg: u.ratingCount ? (u.ratingSum / u.ratingCount).toFixed(2) : null
    }));
  
  res.json(cards);
});

app.post('/api/swipe/action', authMiddleware, (req, res) => {
  const { targetUserId, action } = req.body;
  
  if (!targetUserId || !action) {
    return res.status(400).json({ error: 'targetUserId e action são obrigatórios' });
  }
  
  if (!['like', 'pass'].includes(action)) {
    return res.status(400).json({ error: 'Action deve ser "like" ou "pass"' });
  }
  
  likes.push({
    from: req.userId,
    to: targetUserId,
    action,
    createdAt: new Date().toISOString()
  });
  
  // Verifica match recíproco
  if (action === 'like') {
    const reciprocal = likes.find(l =>
      l.from === targetUserId &&
      l.to === req.userId &&
      l.action === 'like'
    );
    
    if (reciprocal) {
      const matchId = genId('m');
      matches.push({
        id: matchId,
        userA: req.userId,
        userB: targetUserId,
        createdAt: new Date().toISOString()
      });
      messages[matchId] = [];
      
      // Notifica via WebSocket
      io.to(req.userId).emit('matched', { matchId, with: targetUserId });
      io.to(targetUserId).emit('matched', { matchId, with: req.userId });
      
      return res.json({ ok: true, match: true, matchId });
    }
  }
  
  res.json({ ok: true, match: false });
});

// ===== ROTAS DE MATCH E MENSAGENS =====
app.get('/api/matches', authMiddleware, (req, res) => {
  const myMatches = matches
    .filter(m => m.userA === req.userId || m.userB === req.userId)
    .map(m => ({
      id: m.id,
      other: m.userA === req.userId ? m.userB : m.userA,
      createdAt: m.createdAt
    }));
  
  res.json(myMatches);
});

app.get('/api/matches/:id/messages', authMiddleware, (req, res) => {
  const m = matches.find(x =>
    x.id === req.params.id &&
    (x.userA === req.userId || x.userB === req.userId)
  );
  
  if (!m) return res.status(404).json({ error: 'Match não encontrado' });
  res.json(messages[req.params.id] || []);
});

// ===== ROTAS DE AVALIAÇÃO =====
app.post('/api/ratings', authMiddleware, (req, res) => {
  const { toUserId, stars, comment } = req.body;
  
  if (!toUserId || !stars) {
    return res.status(400).json({ error: 'toUserId e stars são obrigatórios' });
  }
  
  const target = users.find(u => u.id === toUserId);
  if (!target) return res.status(404).json({ error: 'Usuário não encontrado' });
  
  target.ratingSum += Number(stars);
  target.ratingCount += 1;
  
  const avg = (target.ratingSum / target.ratingCount).toFixed(2);
  res.json({ ok: true, avg });
});

// ===== SERVE STATIC E FALLBACK =====
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', environment: NODE_ENV });
});

app.get('/', (req, res) => {
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
    const m = matches.find(x => x.id === matchId);
    
    if (!m) {
      socket.emit('error', 'Match não encontrado');
      return;
    }
    
    if (m.userA !== socket.userId && m.userB !== socket.userId) {
      socket.emit('error', 'Sem permissão');
      return;
    }
    
    const msg = {
      id: genId('msg'),
      matchId,
      senderId: socket.userId,
      content,
      createdAt: new Date().toISOString()
    };
    
    messages[matchId].push(msg);
    io.to(m.userA).emit('message', msg);
    io.to(m.userB).emit('message', msg);
  });
  
  socket.on('disconnect', () => {
    console.log(`✗ Usuário ${socket.userId} desconectado`);
  });
});

// ===== INICIALIZAÇÃO =====
seed();

server.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════╗
║    TINTIN Server Running ✓        ║
║  http://localhost:${PORT}          
║  Environment: ${NODE_ENV}
║  Socket.io: Ativo
╚═══════════════════════════════════╝
  `);
});

module.exports = app;