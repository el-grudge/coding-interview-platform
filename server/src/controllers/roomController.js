import { nanoid } from 'nanoid'
import { db } from '../services/database.js'
import { Room } from '../models/Room.js'
import { AppError } from '../middleware/errorHandler.js'
import { config } from '../config/index.js'

export const createRoom = async (req, res) => {
  const { language, initialCode, expiresIn } = req.body

  const roomId = nanoid(config.room.idLength)
  const room = new Room({
    id: roomId,
    language,
    initialCode,
    expiresIn: expiresIn || config.room.defaultExpirationHours,
  })

  db.createRoom(room)

  res.status(201).json(room.toJSON())
}

export const listRooms = async (req, res) => {
  const limit = parseInt(req.query.limit) || 50
  const offset = parseInt(req.query.offset) || 0

  const { rooms, total } = db.getAllRooms(limit, offset)

  res.json({
    rooms: rooms.map((room) => room.toJSON()),
    total,
    limit,
    offset,
  })
}

export const getRoom = async (req, res) => {
  const { roomId } = req.params

  const room = db.getRoom(roomId)
  if (!room) {
    throw new AppError('The requested room does not exist', 404, 'ROOM_NOT_FOUND')
  }

  res.json(room.toJSON())
}

export const deleteRoom = async (req, res) => {
  const { roomId } = req.params

  const room = db.getRoom(roomId)
  if (!room) {
    throw new AppError('The requested room does not exist', 404, 'ROOM_NOT_FOUND')
  }

  db.deleteRoom(roomId)
  res.status(204).send()
}
