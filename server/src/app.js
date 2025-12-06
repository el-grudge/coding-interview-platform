import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import { config } from './config/index.js'
import { errorHandler, notFound } from './middleware/errorHandler.js'

import healthRoutes from './routes/health.js'
import roomRoutes from './routes/rooms.js'
import codeRoutes from './routes/code.js'
import sessionRoutes from './routes/sessions.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export const createApp = () => {
  const app = express()

  app.use(
    cors({
      origin: config.corsOrigin,
      credentials: true,
    })
  )

  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))

  const apiRouter = express.Router()
  apiRouter.use('/health', healthRoutes)
  apiRouter.use('/rooms', roomRoutes)
  apiRouter.use('/code', codeRoutes)
  apiRouter.use('/sessions', sessionRoutes)

  app.use('/api/v1', apiRouter)

  // Serve static files from frontend build (for production/Docker)
  const publicPath = path.join(__dirname, '..', 'public')
  app.use(express.static(publicPath))

  // Serve index.html for all non-API routes (SPA support)
  app.use((req, res, next) => {
    // Skip API routes
    if (req.path.startsWith('/api/')) {
      return next()
    }
    // Only handle GET requests for SPA routing
    if (req.method !== 'GET') {
      return next()
    }
    // Serve index.html for all other routes
    res.sendFile(path.join(publicPath, 'index.html'), (err) => {
      if (err) {
        next()
      }
    })
  })

  app.use(notFound)
  app.use(errorHandler)

  return app
}
