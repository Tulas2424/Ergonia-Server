import { Response, NextFunction } from 'express'
import { ordersService } from './orders.service'
import { sendSuccess } from '../../utils/response'
import { AuthRequest } from '../../middlewares/auth.middleware'

export const ordersController = {
  async createOrder(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id
      const result = await ordersService.createOrder({
        ...req.body,
        userId
      })
      sendSuccess(res, result, 'Tạo đơn hàng thành công', 201)
    } catch (error) {
      next(error)
    }
  },

  async getMyOrders(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const result = await ordersService.getMyOrders(userId);
      sendSuccess(res, result, 'Thành công');
    } catch (error) {
      next(error);
    }
  },

  async getOrderByCode(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { code } = req.params;
      const result = await ordersService.getOrderByCode(code as string, userId);
      sendSuccess(res, result, 'Thành công');
    } catch (error) {
      next(error);
    }
  }
}
