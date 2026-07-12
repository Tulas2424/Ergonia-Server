import { Router } from 'express'
import { productsController } from './products.controller'

const router = Router()

router.get('/', productsController.getProducts)
router.get('/slug/:slug', productsController.getProductBySlug)

export default router
