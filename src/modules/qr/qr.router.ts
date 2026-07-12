import { Router } from 'express'
import { qrController } from './qr.controller'

const router = Router()

router.get('/:code', qrController.validateQrCode)

export default router
