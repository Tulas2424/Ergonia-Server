import { Router } from 'express'
import { painpointController } from './painpoint.controller'

const router = Router()

router.get('/body-parts', painpointController.getBodyParts)
router.get('/chair-types', painpointController.getChairTypes)
router.get('/guides', painpointController.getGuides)

export default router
