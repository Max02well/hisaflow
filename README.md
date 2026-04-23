# Hisaflow – Inventory to WhatsApp Store

Hisaflow is an automated Inventory-to-WhatsApp commerce system that enables businesses to manage stock and sell products directly through WhatsApp without requiring customers to install an app.

## Features

### Current (Backend)
- WhatsApp webhook integration
- Product & inventory management (Postgres + Prisma)
- Automated responses (stock/catalog queries)
- Order creation from chat messages
- Secure API (Helmet, CORS, rate limiting)

### Upcoming
- AI image recognition for stock (OpenAI Vision)
- Batch upload via mobile app (Expo)
- WhatsApp interactive product catalog (carousel)
- M-Pesa / Stripe payment integration
- Redis queue for background jobs

## Project Structure

```
hisaflowbackend/
├── prisma/
│   └── schema.prisma
│
├── src/
│   ├── config/
│   │   └── env.js
│   │
│   ├── controllers/
│   │   ├── whatsapp.controller.jsx
│   │   ├── inventory.controller.jsx
│   │   └── order.controller.jsx
│   │
│   ├── routes/
│   │   ├── whatsapp.routes.jsx
│   │   ├── inventory.routes.jsx
│   │   └── order.routes.jsx
│   │
│   ├── services/
│   │   ├── prisma.service.jsx
│   │   ├── whatsapp.service.jsx
│   │   └── ai.service.jsx
│   │
│   ├── middleware/
│   │   └── error.middleware.jsx
│   │
│   ├── app.jsx
│   └── server.jsx
│
├── .env
├── package.json
├── .gitignore
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
└── README.md
```

## Tech Stack

- **Backend**: Node.js + Express
- **Database**: PostgreSQL + Prisma ORM
- **Messaging**: WhatsApp Business API
- **Queue (planned)**: Bull + Redis
- **AI (planned)**: OpenAI Vision
- **Mobile (planned)**: Expo + React Native

## Getting Started

### 1. Clone the repo
```bash
git clone https://github.com/Max02well/hisaflow.git
cd hisaflowbackend
```

### 2. Install dependencies
Using pnpm (recommended):
```bash
pnpm install
```

### 3. Setup environment variables
Create a `.env` file:
```env
PORT=3000
DATABASE_URL=your_postgres_url
WHATSAPP_ACCESS_TOKEN=your_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_id
WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_id
WHATSAPP_VERIFY_TOKEN=your_verify_token
OPENAI_API_KEY=your_openai_key
```

### 4. Setup database
```bash
pnpm prisma generate
pnpm prisma db push
```

### 5. Run server
```bash
pnpm dev
```

### ✅ Health check
```http
GET http://localhost:3000/health
```

## 🔗 WhatsApp Integration Setup

### 1. Create App
- Go to Meta Developers
- Create a WhatsApp Business App

### 2. Get Credentials
From WhatsApp dashboard:
- Access Token
- Phone Number ID
- Business Account ID

### 3. Set Webhook
Use ngrok for local testing:
```bash
npx ngrok http 3000
```
Set webhook URL:
```
https://your-ngrok-url/api/whatsapp/webhook
```
Verify token must match `.env`.

### 4. Subscribe to events
Enable:
- `messages`
- `message_status`

### 5. Test
Send message:
```
stock
```
Expected:
Backend responds with available products.

## 📡 API Endpoints

### WhatsApp
- `POST /api/whatsapp/webhook`
- `GET  /api/whatsapp/webhook` (verification)

### Inventory
- `GET  /api/inventory`
- `POST /api/inventory`

### Orders
- `GET  /api/orders`
- `POST /api/orders`

## How It Works

1. Customer sends message on WhatsApp.
2. Meta forwards message to webhook.
3. Backend processes message.
4. Prisma queries database.
5. Response sent back via WhatsApp API.

## Monetization Model

Hisaflow is designed as a Vertical SaaS:

- **Free Tier** → Manual inventory
- **$15/month** → AI + WhatsApp automation
- **$30/month** → Full automation + payments

## ⚠️ Known Issues

- Meta access tokens expire (use permanent token in production).
- WhatsApp sandbox has limited recipients.
- ngrok URL changes on restart (use static URL in production).

## 🔮 Roadmap

- AI image recognition (Snap & Stock)
- WhatsApp product carousel UI
- Payment integration (M-Pesa)
- Mobile app (Expo)
- Multi-store support
- Analytics dashboard

## Contributing

Pull requests are welcome. For major changes, open an issue first.

## License

MIT License

## Author

Built by Maxwell Gogo 🚀
Hisaflow Project