import Fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import rateLimit from '@fastify/rate-limit'
import websocket from '@fastify/websocket'
import { analysisRoutes } from './routes/analysis'
import { authRoutes } from './routes/auth'
import { cacheRoutes } from './routes/cache'
import { setupWebSocket } from './websocket'
import { errorHandler } from './middleware/errorHandler'

const app = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
  },
})

// Error handler
app.setErrorHandler(errorHandler)

// Plugins
await app.register(cors, {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
})

await app.register(jwt, {
  secret: process.env.JWT_SECRET || 'dev-secret',
})

await app.register(rateLimit, {
  max: parseInt(process.env.RATE_LIMIT_REQUESTS_PER_MINUTE || '60'),
  timeWindow: '1 minute',
})

await app.register(websocket)

// WebSocket setup
await setupWebSocket(app)

// Routes
await app.register(authRoutes, { prefix: '/api/auth' })
await app.register(analysisRoutes, { prefix: '/api/analysis' })
await app.register(cacheRoutes, { prefix: '/api/cache' })

// Health check
app.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() }
})

// Start server
const start = async () => {
  try {
    const port = parseInt(process.env.PORT || '3001')
    await app.listen({ port, host: '0.0.0.0' })
    console.log(`🚀 Gateway running on http://localhost:${port}`)
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start()
