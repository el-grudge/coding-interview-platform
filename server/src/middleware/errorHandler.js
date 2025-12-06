export class AppError extends Error {
  constructor(message, statusCode = 500, errorCode = 'INTERNAL_ERROR') {
    super(message)
    this.statusCode = statusCode
    this.errorCode = errorCode
    this.timestamp = new Date().toISOString()
  }
}

export const errorHandler = (err, req, res, next) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.errorCode,
      message: err.message,
      timestamp: err.timestamp,
    })
  }

  console.error('Unexpected error:', err)

  res.status(500).json({
    error: 'INTERNAL_ERROR',
    message: 'An unexpected error occurred',
    timestamp: new Date().toISOString(),
  })
}

export const notFound = (req, res) => {
  res.status(404).json({
    error: 'NOT_FOUND',
    message: `Route ${req.method} ${req.path} not found`,
    timestamp: new Date().toISOString(),
  })
}
