import express from 'express'
import { createRoom, listRooms, getRoom, deleteRoom } from '../controllers/roomController.js'
import { getRoomCode, updateRoomCode } from '../controllers/codeController.js'
import { roomValidators, codeValidators } from '../middleware/validators.js'

const router = express.Router()

router.post('/', roomValidators.create, createRoom)
router.get('/', roomValidators.list, listRooms)
router.get('/:roomId', roomValidators.get, getRoom)
router.delete('/:roomId', roomValidators.get, deleteRoom)

router.get('/:roomId/code', roomValidators.get, getRoomCode)
router.put('/:roomId/code', codeValidators.updateCode, updateRoomCode)

export default router
