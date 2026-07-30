import { Router } from 'express'
import { ordersController } from './orders.controller'
import { authenticate, optionalAuthenticate } from '../../middlewares/auth.middleware'
import { validate, createOrderSchema } from '../../middlewares/validate.middleware'

const router = Router()

router.post('/', optionalAuthenticate, validate(createOrderSchema), ordersController.createOrder)
router.get('/my', authenticate, ordersController.getMyOrders)
router.get('/:code', optionalAuthenticate, ordersController.getOrderByCode)
router.patch('/:code/cancel', authenticate, ordersController.cancelOrder)

export default router

