const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());

// === CONFIGURAÇÕES DO TELEGRAM ===
const TELEGRAM_TOKEN = 'SEU_TOKEN_AQUI';
const CHAT_ID = 'SEU_CHAT_ID_AQUI';

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
  res.send("✅ PULseX Backend está ativo e ouvindo webhooks do GitHub!");
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

// Porta usada pelo Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Servidor rodando na porta ${PORT}`));
