import { Router } from 'express'
import { categoriesController } from './categories.controller'

const router = Router()

router.get('/', categoriesController.getCategories)

export default router
