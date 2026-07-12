import { Router } from 'express'
import { vouchersController } from './vouchers.controller'

const router = Router()

router.post('/validate', vouchersController.validateVoucher)

export default router
