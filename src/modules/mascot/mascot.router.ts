import { Router } from 'express'
import { mascotController } from './mascot.controller'

const router = Router()

router.get('/characters', mascotController.getCharacters)
router.get('/dialogues/:contextKey', mascotController.getDialogueByContextKey)

export default router
