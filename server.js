const express = require('express');
const axios = require('axios');

// tenta carregar variáveis de ambiente de um arquivo .env, se existir
try {
  require('dotenv').config();
} catch (e) {
  console.warn('dotenv não instalado; certifique-se de definir as variáveis de ambiente manualmente');
}

const app = express();
app.use(express.json());
app.use(express.static(__dirname));

// === CONFIGURAÇÕES DO TELEGRAM ===
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

// Função para enviar mensagem para o Telegram
async function enviarTelegram(mensagem) {
  if (!TELEGRAM_TOKEN || !CHAT_ID) {
    throw new Error('Variáveis TELEGRAM_TOKEN ou CHAT_ID não configuradas');
  }
  const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
  try {
    await axios.post(url, {
      chat_id: CHAT_ID,
      text: mensagem,
      parse_mode: 'Markdown'
    });
  } catch (error) {
    console.error("Erro ao enviar para o Telegram:", error.message);
    throw error;
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

// Rota simples para receber mensagens do frontend e enviar ao Telegram
app.post('/send', async (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'message é obrigatório' });
  }
  try {
    await enviarTelegram(message);
    res.json({ status: 'ok' });
  } catch (error) {
    res.status(500).json({ error: 'Falha ao enviar mensagem' });
  }
});

// Porta usada pelo Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Servidor rodando na porta ${PORT}`));
