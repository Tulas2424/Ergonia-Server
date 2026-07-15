import { Request, Response, NextFunction } from 'express'
import { paymentsService } from './payments.service'
import { ordersService } from '../orders/orders.service'
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
      const { orderCode, transactionCode, amount, status, content, transferAmount, transferType } = req.body

      let parsedOrderCode = orderCode;
      
      // If orderCode is not provided directly, try to extract it from the bank transfer content (SePay format)
      if (!parsedOrderCode && content) {
        const match = content.match(/ERG\d+/i);
        if (match) {
          parsedOrderCode = match[0].toUpperCase();
        }
      }

      if (!parsedOrderCode) {
        return sendError(res, 'Missing orderCode', 400)
      }

      // TODO: Verify SePay webhook signature in production
      console.log(`[SePay Webhook] Order: ${parsedOrderCode}, Amount: ${amount || transferAmount}, Content: ${content}`)
      
      // Only process "in" transfers (money received)
      if (transferType && transferType !== 'in') {
        return sendSuccess(res, { received: true, ignored: true }, 'Webhook received but ignored (not an incoming transfer)')
      }

      await ordersService.updatePaymentStatusByCode(parsedOrderCode, 'paid')

      sendSuccess(res, { received: true }, 'Webhook received')
    } catch (error) {
      next(error)
    }
  }
}
