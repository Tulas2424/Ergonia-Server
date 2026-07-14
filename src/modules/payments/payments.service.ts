import axios from 'axios'

export const paymentsService = {
  async createSePayUrl(order: { orderCode: string; totalAmount: number }) {
    const apiKey = process.env.SEPAY_SECRET_KEY || process.env.SEPAY_API_KEY
    const merchantId = process.env.SEPAY_MERCHANT_ID

    if (!apiKey || !merchantId || apiKey === 'your_sepay_api_key') {
      // Dev mode: trả về URL giả lập để test local
      const returnUrl = `${process.env.CLIENT_URL}/checkout/payment-result`
      return `${returnUrl}?status=success&orderCode=${order.orderCode}`
    }

    // Trả về null để FE không redirect đi đâu cả mà đi thẳng tới trang success
    // Tại trang success, mã QR VietQR sẽ được hiển thị trực tiếp.
    return null
  }

  // sePayWebhook: bỏ qua khi chạy local, sẽ setup khi lên production
}
