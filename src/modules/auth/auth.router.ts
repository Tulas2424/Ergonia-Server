import { Router } from 'express'
import { authController } from './auth.controller'
import { authenticate } from '../../middlewares/auth.middleware'
import { validate, registerSchema, loginSchema } from '../../middlewares/validate.middleware'

const router = Router()

router.post('/register', validate(registerSchema), authController.register)
router.post('/login', validate(loginSchema), authController.login)
router.get('/me', authenticate, authController.getProfile)
router.patch('/profile', authenticate, authController.updateProfile)
router.patch('/password', authenticate, authController.changePassword)

export default router
