import { Request, Response, NextFunction } from 'express'
import { paymentsService } from './payments.service'
import { sendSuccess, sendError } from '../../utils/response'

export const paymentsController = {
  async handleCallback(req: Request, res: Response, next: NextFunction) {
    try {
      const { orderCode, status } = req.query

      if (!orderCode) {
        return sendError(res, 'Missing orderCode parameter', 400)
      }

      if (status === 'success') {
        // In production, verify the payment with SePay API
        // For dev mode, trust the query params
        sendSuccess(res, { success: true, orderCode }, 'Thanh toán thành công')
      } else {
        sendSuccess(res, { success: false, orderCode }, 'Thanh toán thất bại')
      }
    } catch (error) {
      next(error)
    }
  },

  async handleWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      // SePay webhook - verify signature and update order status
      const { orderCode, transactionCode, amount, status } = req.body

      if (!orderCode) {
        return sendError(res, 'Missing orderCode', 400)
      }

      // TODO: Verify SePay webhook signature in production
      // For now, just acknowledge
      console.log(`[SePay Webhook] Order: ${orderCode}, Status: ${status}, Amount: ${amount}`)

      sendSuccess(res, { received: true }, 'Webhook received')
    } catch (error) {
      next(error)
    }
  }
}
