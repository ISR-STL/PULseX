const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());

// Servir os arquivos estáticos do diretório atual (frontend)
app.use(express.static(__dirname));

// === CONFIGURAÇÕES DO TELEGRAM ===
// Os dados sensíveis agora vêm de variáveis de ambiente para não
// expor o token no código-fonte do frontend
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

// Função para enviar mensagem para o Telegram
async function enviarTelegram(mensagem) {
  const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
  try {
    await axios.post(url, {
      chat_id: CHAT_ID,
      text: mensagem,
      parse_mode: 'Markdown'
    });
  } catch (error) {
    console.error("Erro ao enviar para o Telegram:", error.message);
  }
}

// Rota básica para GET (teste manual)
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Webhook que recebe os eventos do GitHub
app.post('/webhook', async (req, res) => {
  const event = req.headers['x-github-event'] || 'unknown';
  const payload = req.body;

  console.log("📩 Evento recebido:", event);
  console.log("Payload:", JSON.stringify(payload, null, 2));

  let mensagem = `🚨 *Novo evento do GitHub* 🚨\n`;
  mensagem += `*Evento:* ${event}\n`;

  if (event === 'ping') {
    mensagem += "✅ *Webhook conectado com sucesso!* 🎉";
  } else if (event === 'push') {
    mensagem += `*Repositório:* ${payload.repository.full_name}\n`;
    const commits = payload.commits.map(c => `- ${c.message} (por ${c.author.name})`).join('\n');
    mensagem += `*Push detectado!* 🚀\nCommits:\n${commits}`;
  } else if (event === 'pull_request') {
    mensagem += `*Pull Request:* ${payload.pull_request.title}\nAutor: ${payload.pull_request.user.login}`;
  } else {
    mensagem += `Evento genérico recebido.`;
  }

  // Enviar mensagem para o Telegram
  await enviarTelegram(mensagem);

  // SEMPRE responde 200 OK para evitar erro 502
  res.status(200).json({ status: "ok", received_event: event });
});

// Endpoint para o frontend enviar mensagens ao Telegram
app.post('/send-message', async (req, res) => {
  const { message } = req.body;
  await enviarTelegram(message || 'Mensagem vazia');
  res.json({ status: 'ok' });
});

// Porta usada pelo Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Servidor rodando na porta ${PORT}`));
