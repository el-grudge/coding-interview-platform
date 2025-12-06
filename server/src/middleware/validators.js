import { body, param, query, validationResult } from 'express-validator'
import { config } from '../config/index.js'
import { AppError } from './errorHandler.js'

export const validate = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    throw new AppError(
      'Validation failed',
      400,
      'INVALID_REQUEST',
      errors.array()
    )
  }
  next()
}

export const roomValidators = {
  create: [
    body('language')
      .optional()
      .isIn(['javascript', 'python', 'java', 'cpp', 'go'])
      .withMessage('Invalid language'),
    body('initialCode')
      .optional()
      .isString()
      .withMessage('Initial code must be a string'),
    body('expiresIn')
      .optional()
      .isInt({ min: 1, max: config.room.maxExpirationHours })
      .withMessage(`Expiration must be between 1 and ${config.room.maxExpirationHours} hours`),
    validate,
  ],

  get: [
    param('roomId')
      .matches(/^[a-zA-Z0-9_-]{10}$/)
      .withMessage('Invalid room ID format'),
    validate,
  ],

  list: [
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    query('offset')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Offset must be non-negative'),
    validate,
  ],
}

export const codeValidators = {
  updateCode: [
    param('roomId')
      .matches(/^[a-zA-Z0-9_-]{10}$/)
      .withMessage('Invalid room ID format'),
    body('code')
      .isString()
      .withMessage('Code must be a string')
      .isLength({ max: config.code.maxSize })
      .withMessage(`Code must not exceed ${config.code.maxSize} characters`),
    body('language')
      .optional()
      .isIn(['javascript', 'python', 'java', 'cpp', 'go'])
      .withMessage('Invalid language'),
    validate,
  ],

  execute: [
    body('code')
      .isString()
      .withMessage('Code must be a string')
      .isLength({ max: config.code.maxSize })
      .withMessage(`Code must not exceed ${config.code.maxSize} characters`),
    body('language')
      .isIn(['javascript', 'python', 'java', 'cpp', 'go'])
      .withMessage('Invalid language'),
    body('timeout')
      .optional()
      .isInt({ min: config.code.minTimeout, max: config.code.maxTimeout })
      .withMessage(
        `Timeout must be between ${config.code.minTimeout} and ${config.code.maxTimeout} ms`
      ),
    body('stdin')
      .optional()
      .isString()
      .withMessage('stdin must be a string')
      .isLength({ max: config.code.maxStdinSize })
      .withMessage(`stdin must not exceed ${config.code.maxStdinSize} characters`),
    validate,
  ],
}

export const sessionValidators = {
  join: [
    param('roomId')
      .matches(/^[a-zA-Z0-9_-]{10}$/)
      .withMessage('Invalid room ID format'),
    body('userName')
      .optional()
      .isString()
      .withMessage('userName must be a string')
      .isLength({ max: 50 })
      .withMessage('userName must not exceed 50 characters'),
    validate,
  ],

  leave: [
    param('roomId')
      .matches(/^[a-zA-Z0-9_-]{10}$/)
      .withMessage('Invalid room ID format'),
    body('sessionId')
      .isString()
      .withMessage('sessionId is required'),
    validate,
  ],
}
