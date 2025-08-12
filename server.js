const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
try { require('dotenv').config(); } catch (e) {}

const app = express();
app.use(bodyParser.json());
app.use(express.json());
app.use(express.static(__dirname));

const { TELEGRAM_TOKEN, CHAT_ID, DRY_RUN } = process.env;
const isDryRun = String(DRY_RUN).toLowerCase() === 'true';

async function enviarTelegram(message) {
  if (isDryRun) return; // evita chamada real em testes/CI
  if (!TELEGRAM_TOKEN || !CHAT_ID) {
    throw new Error('Missing TELEGRAM_TOKEN/CHAT_ID');
  }
  const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
  await axios.post(url, { chat_id: CHAT_ID, text: message });
}

app.get('/', (_, res) => res.sendFile(__dirname + '/index.html'));

async function handleSend(req, res) {
  const { message } = req.body || {};
  if (!message) return res.status(400).json({ error: 'message é obrigatório' });
  try {
    await enviarTelegram(message);
    return res.json({ status: 'ok' });
  } catch (e) {
    return res.status(500).json({ error: 'Falha ao enviar mensagem' });
  }
}

app.post('/send-message', handleSend); // canônico
app.post('/send', handleSend);         // alias temporário
app.get('/health', (_, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => console.log(`✅ up on :${PORT} (dry=${isDryRun})`));
module.exports = server; // permite encerrar no teste
