import { Router } from 'express';
import { AdminCustomersController } from './customers.controller';

const router = Router();

router.get('/', AdminCustomersController.getCustomers);
router.get('/:id', AdminCustomersController.getCustomerById);
router.patch('/:id/status', AdminCustomersController.updateCustomerStatus);

export const adminCustomersRouter = router;
