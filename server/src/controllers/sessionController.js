import { nanoid } from 'nanoid'
import { db } from '../services/database.js'
import { Session } from '../models/Session.js'
import { AppError } from '../middleware/errorHandler.js'

export const getSession = async (req, res) => {
  const { roomId } = req.params

  const room = db.getRoom(roomId)
  if (!room) {
    throw new AppError('The requested room does not exist', 404, 'ROOM_NOT_FOUND')
  }

  const sessions = db.getSessionsByRoom(roomId)

  res.json({
    roomId,
    activeUsers: sessions.map((session) => session.toJSON()),
    createdAt: room.createdAt.toISOString(),
    lastActivity: room.lastUpdated?.toISOString() || room.createdAt.toISOString(),
  })
}

export const joinSession = async (req, res) => {
  const { roomId } = req.params
  const { userName } = req.body

  const room = db.getRoom(roomId)
  if (!room) {
    throw new AppError('The requested room does not exist', 404, 'ROOM_NOT_FOUND')
  }

  const userId = nanoid(10)
  const session = new Session(roomId, userId, userName)
  db.createSession(session)

  res.json({
    sessionId: session.id,
    room: room.toJSON(),
  })
}

export const leaveSession = async (req, res) => {
  const { roomId } = req.params
  const { sessionId } = req.body

  const room = db.getRoom(roomId)
  if (!room) {
    throw new AppError('The requested room does not exist', 404, 'ROOM_NOT_FOUND')
  }

  const deleted = db.deleteSession(sessionId)
  if (!deleted) {
    throw new AppError('Session not found', 404, 'SESSION_NOT_FOUND')
  }

  res.status(204).send()
}
