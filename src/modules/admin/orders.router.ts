import { Router } from 'express';
import { adminOrdersController } from './orders.controller';

const router = Router();

router.get('/', adminOrdersController.getAllOrders);
router.get('/:code', adminOrdersController.getOrderByCode);
router.patch('/:code/status', adminOrdersController.updateOrderStatus);

export default router;
