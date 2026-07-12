import { Router } from 'express'
import { cartController } from './cart.controller'

const router = Router()

router.post('/items', cartController.addCartItem)
router.delete('/items/:id', cartController.removeCartItem)
router.patch('/items/:id', cartController.updateCartItem)

export default router
