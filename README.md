# PULseX
Smart Contract + Landing Page Web3 para o Token PulseX (PX)

## Configuração
1. Copie `.env.example` para `.env` e defina `TELEGRAM_TOKEN`, `CHAT_ID` e opcionalmente `DRY_RUN`.
2. Instale as dependências (`npm install`).
3. Rode os testes com `npm test`.
4. Inicie o servidor com `npm start` e acesse `http://localhost:3000`.

## Endpoints
- `POST /send-message` – envia `{ "message": "texto" }` para o Telegram.
- `POST /send` – alias temporário de `/send-message`.
- `GET /health` – verifica se o backend está de pé.

## Deploy 24/7
Plataformas como **Vercel** ou **Railway** podem hospedar o serviço de forma contínua. Configure as variáveis de ambiente (`TELEGRAM_TOKEN`, `CHAT_ID`) e o comando de start (`npm start`).
