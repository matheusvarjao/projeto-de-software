# TINTIN - Learning Matchmaking App

Uma aplicação inspirada no Tinder para conectar pessoas que querem **aprender** e **ensinar** ao mesmo tempo.

## 🚀 Características

- ✅ Cadastro e autenticação de usuários
- ✅ Sistema de swipe para descobrir pessoas
- ✅ Match automático quando ambos curtem
- ✅ Chat em tempo real via WebSocket
- ✅ Sistema de avaliação (1-5 estrelas)
- ✅ Gerenciamento de perfil

## 📋 Pré-requisitos

- Node.js >= 18.0.0
- npm ou yarn

## ⚙️ Instalação

### 1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/tintin-app.git
cd tintin-app
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure o arquivo `.env`
Crie um arquivo `.env` na raiz do projeto:
```bash
cp .env.example .env
```

Edite o `.env` e configure:
```
PORT=3000
SECRET_KEY=sua_chave_secreta_aqui
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

### 4. Inicie o servidor
```bash
npm start
```

O servidor estará rodando em `http://localhost:3000`

## 🔗 API Endpoints

### Autenticação
- `POST /api/auth/register` - Registrar novo usuário
- `POST /api/auth/login` - Fazer login

### Usuários
- `GET /api/users/me` - Obter perfil do usuário logado
- `PUT /api/users/me` - Atualizar perfil

### Swipe
- `GET /api/swipe/cards` - Obter cards para swipe
- `POST /api/swipe/action` - Fazer swipe (like/pass)

### Matches
- `GET /api/matches` - Listar meus matches
- `GET /api/matches/:id/messages` - Obter mensagens de um match

### Avaliações
- `POST /api/ratings` - Avaliar usuário

### Health Check
- `GET /api/health` - Verificar status do servidor

## 📝 Exemplo de Uso

### Registrar
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"João","email":"joao@example.com","password":"senha123"}'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"joao@example.com","password":"senha123"}'
```

## 🗂️ Estrutura do Projeto

```
tintin-app/
├── server.js              # Servidor principal
├── package.json           # Dependências
├── .env                   # Configurações (não commitar)
├── .gitignore            # Arquivos ignorados pelo git
├── public/               # Arquivos estáticos
│   └── index.html        # Client web (opcional)
└── README.md             # Este arquivo
```

## 🔐 Segurança

- Senhas são criptografadas com bcryptjs
- Tokens JWT com expiração de 7 dias
- CORS configurado para múltiplas origens
- Validação de entrada em todas as rotas

## 🚀 Deploy

### Vercel
1. Conecte seu repositório GitHub
2. Configure as variáveis de ambiente no painel
3. Deploy automático

### Heroku
```bash
heroku create tintin-app
heroku config:set SECRET_KEY=sua_chave_secreta
git push heroku main
```

### AWS / DigitalOcean / Azure
Use Docker:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 📊 Dados Demo

O servidor inicia com 5 usuários demo:
- **Ana Silva** - Ensina Inglês, quer aprender Python
- **Bruno Costa** - Ensina JavaScript, quer aprender Espanhol
- **Carla Gomes** - Ensina Matemática, quer aprender Guitarra
- **Diego Melo** - Ensina Design, quer aprender Inglês
- **Eva Luz** - Ensina Português, quer aprender Python

Login padrão: `email: {nome}@example.com` | `senha: password`

## 🐛 Troubleshooting

### Porta já em uso
```bash
# Linux/Mac
lsof -i :3000
kill -9 <PID>

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Erro de CORS
Verifique se o `FRONTEND_URL` no `.env` contém o endereço correto

### WebSocket não conecta
Certifique-se de que está usando `https://` em produção (não `http://`)

## 📱 Cliente Web (Lovable)

Para criar o frontend, use o Lovable com este prompt:

```
Crie uma aplicação web responsiva chamada TINTIN - uma plataforma 
inspirada no Tinder focada em conectar pessoas que querem aprender e ensinar.
API base: http://localhost:3000/api
```

## 📄 Licença

MIT License - veja LICENSE para detalhes

## 👥 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📧 Suporte

Para dúvidas, abra uma issue no GitHub ou envie um email.

---

**Desenvolvido com ❤️ para conectar pessoas que querem aprender**