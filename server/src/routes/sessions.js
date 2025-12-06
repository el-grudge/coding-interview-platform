import express from 'express'
import { getSession, joinSession, leaveSession } from '../controllers/sessionController.js'
import { sessionValidators, roomValidators } from '../middleware/validators.js'

const router = express.Router()

router.get('/:roomId', roomValidators.get, getSession)
router.post('/:roomId/join', sessionValidators.join, joinSession)
router.post('/:roomId/leave', sessionValidators.leave, leaveSession)

export default router
