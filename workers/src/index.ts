import { Worker } from 'bull'
import { redisConfig } from './config/redis'
import { phase1Processor } from './processors/phase1'
import { phase2Processor } from './processors/phase2'
import { phase3Processor } from './processors/phase3'

// Workers pour chaque phase du pipeline
const phase1Worker = new Worker('phase1-analysis', phase1Processor, {
  connection: redisConfig,
  concurrency: 5,
  limiter: {
    max: 10,
    duration: 1000,
  },
})

const phase2Worker = new Worker('phase2-research', phase2Processor, {
  connection: redisConfig,
  concurrency: 20, // DeepSeek est gratuit, on peut en faire plus
  limiter: {
    max: 50,
    duration: 1000,
  },
})

const phase3Worker = new Worker('phase3-validation', phase3Processor, {
  connection: redisConfig,
  concurrency: 5,
  limiter: {
    max: 10,
    duration: 1000,
  },
})

// Event listeners
phase1Worker.on('completed', (job) => {
  console.log(`✅ Phase 1 completed: ${job.id}`)
})

phase1Worker.on('failed', (job, err) => {
  console.error(`❌ Phase 1 failed: ${job.id}`, err)
})

phase2Worker.on('completed', (job) => {
  console.log(`✅ Phase 2 completed: ${job.id}`)
})

phase2Worker.on('failed', (job, err) => {
  console.error(`❌ Phase 2 failed: ${job.id}`, err)
})

phase3Worker.on('completed', (job) => {
  console.log(`✅ Phase 3 completed: ${job.id}`)
})

phase3Worker.on('failed', (job, err) => {
  console.error(`❌ Phase 3 failed: ${job.id}`, err)
})

console.log('🚀 Workers started:')
console.log('  - Phase 1 (Analyst): 5 concurrent')
console.log('  - Phase 2 (Researcher): 20 concurrent')
console.log('  - Phase 3 (Validator): 5 concurrent')

process.on('SIGTERM', async () => {
  console.log('Shutting down workers...')
  await phase1Worker.close()
  await phase2Worker.close()
  await phase3Worker.close()
  process.exit(0)
})
