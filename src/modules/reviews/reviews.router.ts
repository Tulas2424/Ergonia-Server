import { Router } from 'express'
import { reviewsController } from './reviews.controller'
import { authenticate } from '../../middlewares/auth.middleware'

const router = Router()

router.get('/product/:productId', reviewsController.getProductReviews)
router.get('/check-eligibility', authenticate, reviewsController.checkEligibility)
router.post('/', authenticate, reviewsController.createReview)

export default router
