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
  }
}
