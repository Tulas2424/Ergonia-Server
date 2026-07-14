import { Router } from 'express';
import { authenticate, requireAdmin } from '../../middlewares/auth.middleware';

import statsRouter from './stats.router';
import adminOrdersRouter from './orders.router';
import adminProductsRouter from './products.router';
import adminQuizRouter from './quiz.router';
import adminQrRouter from './qr.router';

const router = Router();

// Apply auth middleware to all admin routes
router.use(authenticate, requireAdmin);

router.use('/stats', statsRouter);
router.use('/orders', adminOrdersRouter);
router.use('/products', adminProductsRouter);
router.use('/quiz', adminQuizRouter);
router.use('/qr', adminQrRouter);

export default router;
