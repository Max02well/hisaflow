import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import { env } from './config/env.js'

// Routes
import whatsappRoutes from './routes/whatsapp.routes.js';
import inventoryRoutes from './routes/inventory.routes.js';
// import orderRoutes from './routes/order.routes.js';

const app = express()
app.set('trust proxy', 1);

// Security middleware
app.use(helmet())
app.use(cors({
  origin: env.FRONTEND_URL,
  credentials: true
}))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
})
app.use('/api/', limiter)

// Body parsing
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Logging (only in dev)
if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

// ── Routes ──
app.use('/api/whatsapp', whatsappRoutes)
app.use('/api/inventory', inventoryRoutes)
// app.use('/api/orders', orderRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV
  })
})

app.get('/', (req, res) => {
  res.send('Welcome to HisaFlow API.This is the root endpoint. For WhatsApp webhook, use /api/whatsapp/webhook')
})

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err)
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(env.NODE_ENV === 'development' && { stack: err.stack })
  })
})

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

// ── Local dev only — Vercel ignores this ──
if (env.NODE_ENV === 'development') {
  const PORT = env.PORT || 3000
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`)
    console.log(`📱 WhatsApp webhook: http://localhost:${PORT}/api/whatsapp/webhook`)
    console.log(`✅ Health check: http://localhost:${PORT}/api/health`)
  })
}

export default app