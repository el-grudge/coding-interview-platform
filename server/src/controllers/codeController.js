import { db } from '../services/database.js'
import { codeExecutor } from '../services/codeExecutor.js'
import { AppError } from '../middleware/errorHandler.js'
import { config } from '../config/index.js'

export const getRoomCode = async (req, res) => {
  const { roomId } = req.params

  const room = db.getRoom(roomId)
  if (!room) {
    throw new AppError('The requested room does not exist', 404, 'ROOM_NOT_FOUND')
  }

  res.json({
    code: room.codeSnippet,
    language: room.language,
    timestamp: room.lastUpdated?.toISOString() || room.createdAt.toISOString(),
    version: room.version,
  })
}

export const updateRoomCode = async (req, res) => {
  const { roomId } = req.params
  const { code, language } = req.body

  const room = db.updateRoomCode(roomId, code, language)
  if (!room) {
    throw new AppError('The requested room does not exist', 404, 'ROOM_NOT_FOUND')
  }

  res.json({
    code: room.codeSnippet,
    language: room.language,
    timestamp: room.lastUpdated.toISOString(),
    version: room.version,
  })
}

export const executeCode = async (req, res) => {
  const { code, language, timeout, stdin } = req.body

  const executionTimeout = timeout || config.code.defaultTimeout
  const result = await codeExecutor.execute(code, language, executionTimeout, stdin || '')

  res.json(result)
}
