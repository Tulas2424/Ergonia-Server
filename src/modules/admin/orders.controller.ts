import { Request, Response, NextFunction } from 'express';
import { adminOrdersService } from './orders.service';
import { OrderStatus } from '@prisma/client';

export const adminOrdersController = {
  async getAllOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const status = req.query.status as string;
      const search = req.query.search as string;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await adminOrdersService.getAllOrders({ status, search, page, limit });
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async getOrderByCode(req: Request, res: Response, next: NextFunction) {
    try {
      const code = req.params.code as string;
      const result = await adminOrdersService.getOrderByCode(code);
      res.json(result);
    } catch (error: any) {
      if (error.statusCode === 404) {
        res.status(404).json({ message: error.message });
      } else {
        next(error);
      }
    }
  },

  async updateOrderStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { status } = req.body;
      const code = req.params.code as string;

      if (!status || !Object.values(OrderStatus).includes(status as OrderStatus)) {
        res.status(400).json({ message: 'Invalid order status' });
        return;
      }

      const result = await adminOrdersService.updateOrderStatus(code, status as OrderStatus);
      res.json(result);
    } catch (error: any) {
       if (error.statusCode === 404) {
          res.status(404).json({ message: error.message });
       } else {
          next(error);
       }
    }
  }
};
