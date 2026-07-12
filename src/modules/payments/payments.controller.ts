import { Request, Response, NextFunction } from 'express'
import { paymentsService } from './payments.service'
import { sendSuccess } from '../../utils/response'

export const paymentsController = {
  async vnpayReturn(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await paymentsService.vnpayReturn(req.query);
      sendSuccess(res, result, 'Xử lý VNPay Return');
    } catch (error) {
      next(error);
    }
  },

  async momoIPN(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await paymentsService.momoIPN(req.body);
      sendSuccess(res, result, 'Xử lý MoMo IPN');
    } catch (error) {
      next(error);
    }
  }
}
