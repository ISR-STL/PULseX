const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());

// === CONFIGURAÇÕES DO TELEGRAM ===
const TELEGRAM_TOKEN = '8086418131:AAFvVTQdO0FZnuyleI3qrTJYAAaUP4_cNlA';
const CHAT_ID = '7699118334';

// Função para enviar mensagem para o Telegram
async function enviarTelegram(mensagem) {
  const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
  await axios.post(url, {
    chat_id: CHAT_ID,
    text: mensagem,
    parse_mode: 'Markdown'
  });
}

// ✅ ROTA PRINCIPAL PARA TESTAR SE O BACKEND ESTÁ ONLINE
app.get('/', (req, res) => {
  res.send('✅ PULseX Backend está ativo e ouvindo webhooks do GitHub!');
});

// Webhook que recebe os eventos do GitHub
app.post('/webhook', async (req, res) => {
  const event = req.headers['x-github-event'];
  const payload = req.body;

  console.log(`Evento recebido: ${event}`);

  let mensagem = `🚨 *Novo evento do GitHub* 🚨\n\n`;
  mensagem += `*Repositório:* ${payload.repository.full_name}\n`;
  mensagem += `*Evento:* ${event}\n`;

  if (event === 'push') {
    const commits = payload.commits.map(c => `- ${c.message} (por ${c.author.name})`).join('\n');
    mensagem += `*Push detectado!* 🚀\nCommits:\n${commits}`;
  } else if (event === 'pull_request') {
    mensagem += `*Pull Request:* ${payload.pull_request.title}\nAutor: ${payload.pull_request.user.login}`;
  } else {
    mensagem += `Evento genérico recebido.`;
  }

  await enviarTelegram(mensagem);
  res.status(200).send('Webhook recebido e processado!');
});

// Porta usada pelo Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Servidor rodando na porta ${PORT}`));
