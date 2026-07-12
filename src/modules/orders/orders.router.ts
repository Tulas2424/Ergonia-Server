import { Router } from 'express'
import { ordersController } from './orders.controller'
import { authenticate } from '../../middlewares/auth.middleware'
import { validate, createOrderSchema } from '../../middlewares/validate.middleware'

const router = Router()

router.post('/', authenticate, validate(createOrderSchema), ordersController.createOrder)
router.get('/my', authenticate, ordersController.getMyOrders)
router.get('/:code', authenticate, ordersController.getOrderByCode)

export default router
