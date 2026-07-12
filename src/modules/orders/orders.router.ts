import { Router } from 'express'
import { ordersController } from './orders.controller'
import { authenticate } from '../../middlewares/auth.middleware'

const router = Router()

router.post('/', authenticate, ordersController.createOrder)

export default router
