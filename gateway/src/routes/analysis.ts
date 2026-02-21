import { FastifyInstance } from 'fastify'
import { analyzeDocument } from '../services/analysis'
import { cacheService } from '../services/cache'
import { queueService } from '../services/queue'

export async function analysisRoutes(app: FastifyInstance) {
  // POST /api/analysis - Lancer une analyse
  app.post('/', async (request, reply) => {
    const { document, type, options } = request.body as any
    const userId = request.user?.id

    if (!userId) {
      return reply.status(401).send({ error: 'Unauthorized' })
    }

    try {
      // 1. Check cache sémantique
      const cachedResult = await cacheService.findSimilar(document, type)
      if (cachedResult) {
        return {
          status: 'completed',
          source: 'cache',
          result: cachedResult,
        }
      }

      // 2. Détecter complexité et router
      const complexity = analyzeDocument(document)
      
      // 3. Queue le job
      const job = await queueService.add('analysis', {
        userId,
        document,
        type,
        complexity,
        options,
      })

      return {
        status: 'queued',
        jobId: job.id,
        estimatedTime: complexity === 'quick' ? 5 : complexity === 'standard' ? 20 : 35,
      }
    } catch (error) {
      request.log.error(error)
      return reply.status(500).send({ error: 'Analysis failed' })
    }
  })

  // GET /api/analysis/:id - Status d'une analyse
  app.get('/:id', async (request, reply) => {
    const { id } = request.params as any
    
    try {
      const job = await queueService.getJob(id)
      if (!job) {
        return reply.status(404).send({ error: 'Job not found' })
      }

      return {
        id: job.id,
        status: await job.getState(),
        progress: job.progress,
        result: job.returnvalue,
      }
    } catch (error) {
      return reply.status(500).send({ error: 'Failed to get status' })
    }
  })

  // WebSocket pour streaming temps réel
  app.get('/ws/stream', { websocket: true }, (connection, req) => {
    connection.socket.on('message', async (message) => {
      const data = JSON.parse(message.toString())
      // Gérer les messages WebSocket
    })
  })
}

function analyzeDocument(document: any): 'quick' | 'standard' | 'complex' {
  // Logique de détection de complexité
  if (document.type === 'ratio-simple' || document.query?.length < 50) {
    return 'quick'
  }
  if (document.type === 'full-diagnostic' || document.data?.length > 1000) {
    return 'complex'
  }
  return 'standard'
}
