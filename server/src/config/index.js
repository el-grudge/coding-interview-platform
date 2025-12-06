import dotenv from 'dotenv'

dotenv.config()

export const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',

  room: {
    defaultExpirationHours: 24,
    maxExpirationHours: 168,
    idLength: 10,
  },

  code: {
    maxSize: 50000,
    maxStdinSize: 10000,
    defaultTimeout: 5000,
    maxTimeout: 30000,
    minTimeout: 100,
  },

  rateLimit: {
    codeExecution: 10,
    roomCreation: 5,
    general: 100,
  },
}
