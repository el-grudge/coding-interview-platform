import { createApp } from './app.js'
import { config } from './config/index.js'

const app = createApp()

const server = app.listen(config.port, () => {
  console.log(`
╔═══════════════════════════════════════════════════╗
║  Coding Interview Platform API Server            ║
╠═══════════════════════════════════════════════════╣
║  Environment: ${config.nodeEnv.padEnd(36)}║
║  Port:        ${config.port.toString().padEnd(36)}║
║  CORS Origin: ${config.corsOrigin.padEnd(36)}║
╠═══════════════════════════════════════════════════╣
║  Health:      http://localhost:${config.port}/api/v1/health   ║
║  API Docs:    See openapi.yaml                    ║
╚═══════════════════════════════════════════════════╝
  `)
})

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server')
  server.close(() => {
    console.log('HTTP server closed')
  })
})

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server')
  server.close(() => {
    console.log('HTTP server closed')
    process.exit(0)
  })
})
