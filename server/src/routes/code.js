import express from 'express'
import { executeCode } from '../controllers/codeController.js'
import { codeValidators } from '../middleware/validators.js'

const router = express.Router()

router.post('/execute', codeValidators.execute, executeCode)

export default router
