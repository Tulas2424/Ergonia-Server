import { Router } from 'express';
import { statsController } from './stats.controller';

const router = Router();

// NOTE: authenticate and requireAdmin middlewares are expected to be attached in admin.router.ts
router.get('/today', statsController.getTodayStats);
router.get('/revenue', statsController.getRevenueByDays);
router.get('/funnel', statsController.getFunnelStats);

export default router;
