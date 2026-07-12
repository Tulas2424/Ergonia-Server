import { Router } from 'express'
import { paymentsController } from './payments.controller'

const router = Router()

router.get('/vnpay-return', paymentsController.vnpayReturn)
router.post('/momo-ipn', paymentsController.momoIPN)

export default router
