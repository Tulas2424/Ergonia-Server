import { Router } from 'express'
import { addressesController } from './addresses.controller'
import { authenticate } from '../../middlewares/auth.middleware'

const router = Router()

router.get('/', authenticate, addressesController.getMyAddresses)
router.post('/', authenticate, addressesController.createAddress)
router.patch('/:id/default', authenticate, addressesController.setDefault)
router.delete('/:id', authenticate, addressesController.deleteAddress)

export default router
