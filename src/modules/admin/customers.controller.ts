import { Request, Response, NextFunction } from 'express';
import { AdminCustomersService } from './customers.service';

export class AdminCustomersController {
  static async getCustomers(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AdminCustomersService.getCustomers(req.query);
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  static async getCustomerById(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AdminCustomersService.getCustomerById(Number(req.params.id));
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async updateCustomerStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AdminCustomersService.updateCustomerStatus(Number(req.params.id), req.body.status);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}
