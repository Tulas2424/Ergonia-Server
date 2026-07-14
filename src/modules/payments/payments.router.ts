import { Router } from 'express'
import { paymentsController } from './payments.controller'

const router = Router()

// SePay callback - called when user is redirected back from payment page
router.get('/callback', paymentsController.handleCallback)

// SePay webhook - server-to-server notification
router.post('/webhook', paymentsController.handleWebhook)

export default router
