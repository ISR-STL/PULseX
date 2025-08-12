# PULseX infra

Infraestrutura mínima para conectar o frontend da Vercel ao backend Express (Railway) que envia mensagens ao Telegram.

## Desenvolvimento

```bash
npm install
npm test         # executa smoke test com DRY_RUN
TELEGRAM_TOKEN=seu_token CHAT_ID=123 node server.js
```

## Deploy

### Railway (backend)
1. Crie serviço a partir deste repositório.
2. Defina variáveis:
   - `TELEGRAM_TOKEN`
   - `CHAT_ID`
   - `DRY_RUN` (opcional em prod: `false`)
   - `RATE_LIMIT_WINDOW_MS` e `RATE_LIMIT_MAX` (opcionais)
3. Deploy e anote a URL pública (`https://xxxx.up.railway.app`).

### Vercel (frontend + proxy)
1. Importe o repositório na Vercel.
2. Em **Environment Variables**, configure `BACKEND_URL` apontando para a URL da Railway.
3. Opcional: configure domínio customizado e aponte DNS (CNAME) para a Vercel.

## Endpoints

- Frontend chama `POST /api/send-message` → Função Serverless → Railway `POST /send-message`.
- Health check em `GET /api/health` (proxy para `/health`).

