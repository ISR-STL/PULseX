const express = require('express');
const helmet = require('helmet');
const crypto = require('crypto');
const axios = require('axios');
try { require('dotenv').config(); } catch (_) {}

const app = express();

// Segurança básica
app.use(helmet());

// Parsing
app.use(express.json({ limit: '256kb' }));

// Request ID para rastreabilidade
app.use((req, res, next) => {
  req.id = req.headers['x-request-id'] || crypto.randomUUID();
  res.set('x-request-id', req.id);
  next();
});

// Rate limit simples em memória (pragmático)
const RATE_WINDOW = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10);
const RATE_MAX = parseInt(process.env.RATE_LIMIT_MAX || '30', 10);
const bucket = new Map();
app.use((req, res, next) => {
  const key = req.ip;
  const now = Date.now();
  const arr = (bucket.get(key) || []).filter(t => now - t < RATE_WINDOW);
  arr.push(now);
  bucket.set(key, arr);
  if (arr.length > RATE_MAX) return res.status(429).json({ error: 'Too Many Requests' });
  next();
});

const { TELEGRAM_TOKEN, CHAT_ID, DRY_RUN } = process.env;
const isDry = String(DRY_RUN).toLowerCase() === 'true';

// HTTP client com timeout + retry exponencial
const http = axios.create({ timeout: 8000 });
async function postWithRetry(url, data, tries = 3) {
  let attempt = 0, last;
  while (attempt < tries) {
    try { return await http.post(url, data); }
    catch (e) { last = e; await new Promise(r => setTimeout(r, 2 ** attempt * 200)); attempt++; }
  }
  throw last;
}

async function enviarTelegram(message) {
  if (isDry) return;
  if (!TELEGRAM_TOKEN || !CHAT_ID) throw new Error('Missing TELEGRAM_TOKEN/CHAT_ID');
  const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
  await postWithRetry(url, { chat_id: CHAT_ID, text: message });
}

app.get('/health', (_, res) => res.json({ ok: true }));

// Rota canônica
app.post(['/send-message','/send','/api/send-message'], async (req, res) => {
  const msg = typeof req.body?.message === 'string' ? req.body.message.trim() : '';
  if (!msg) return res.status(400).json({ error: 'message é obrigatório' });
  try { await enviarTelegram(msg); return res.json({ status: 'ok' }); }
  catch (e) { return res.status(502).json({ error: 'Falha ao enviar', ref: req.id }); }
});

const PORT = process.env.PORT || 8080;
const server = app.listen(PORT, () => console.log(`✅ API on :${PORT} dry=${isDry}`));

// Shutdown gracioso p/ Railway
['SIGTERM','SIGINT'].forEach(s => process.on(s, () => server.close(() => process.exit(0))));
module.exports = server;

