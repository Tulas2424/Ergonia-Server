import crypto from 'crypto'
import axios from 'axios'
import { prisma } from '../../config/database'

export const paymentsService = {
  async createSePayUrl(order: { orderCode: string; totalAmount: number }) {
    const apiKey = process.env.SEPAY_API_KEY
    const merchantId = process.env.SEPAY_MERCHANT_ID

    if (!apiKey || !merchantId || apiKey === 'your_sepay_api_key') {
      // Dev mode: trả về URL giả lập để test local
      const returnUrl = `${process.env.CLIENT_URL}/checkout/payment-result`
      return `${returnUrl}?status=success&orderCode=${order.orderCode}`
    }

    const response = await axios.post(
      'https://api.sepay.vn/payments/create',
      {
        merchantId,
        orderCode: order.orderCode,
        amount: order.totalAmount,
        description: `Thanh toan don hang ${order.orderCode}`,
        returnUrl: `${process.env.CLIENT_URL}/checkout/payment-result`,
        cancelUrl: `${process.env.CLIENT_URL}/checkout`,
      },
      { headers: { Authorization: `Bearer ${apiKey}` } }
    )

    return response.data?.paymentUrl ?? null
  }

  // sePayWebhook: bỏ qua khi chạy local, sẽ setup khi lên production
}
