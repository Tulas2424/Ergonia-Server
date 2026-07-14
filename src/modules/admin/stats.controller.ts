import { Request, Response, NextFunction } from 'express';
import { statsService } from './stats.service';

export const statsController = {
  async getTodayStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await statsService.getTodayStats();
      res.json(stats);
    } catch (error) {
      next(error);
    }
  },

  async getRevenueByDays(req: Request, res: Response, next: NextFunction) {
    try {
      const days = parseInt(req.query.days as string) || 7;
      const data = await statsService.getRevenueByDays(days);
      res.json(data);
    } catch (error) {
      next(error);
    }
  },

  async getFunnelStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await statsService.getFunnelStats();
      res.json(stats);
    } catch (error) {
      next(error);
    }
  }
};
