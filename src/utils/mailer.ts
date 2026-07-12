import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
})

export const sendOrderConfirmationEmail = async (to: string, order: {
  orderCode: string
  fullName: string
  items: { productNameSnapshot: string; quantity: number; unitPrice: number }[]
  totalAmount: number
  shippingAddress: string
}) => {
  const itemsHtml = order.items.map(i =>
    `<tr>
      <td>${i.productNameSnapshot}</td>
      <td style="text-align:center">${i.quantity}</td>
      <td style="text-align:right">${i.unitPrice.toLocaleString('vi-VN')}đ</td>
    </tr>`
  ).join('')

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: `[Ergonia] Xác nhận đơn hàng #${order.orderCode}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #2D5A4E; padding: 24px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Ergonia</h1>
        </div>
        <div style="padding: 32px; background: #ffffff;">
          <h2>Xin chào ${order.fullName}!</h2>
          <p>Đơn hàng <strong>#${order.orderCode}</strong> của bạn đã được đặt thành công.</p>
          <table style="width:100%;border-collapse:collapse;margin:16px 0;">
            <thead>
              <tr style="background:#F5F2EB;">
                <th style="text-align:left;padding:8px;">Sản phẩm</th>
                <th style="text-align:center;padding:8px;">SL</th>
                <th style="text-align:right;padding:8px;">Giá</th>
              </tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
            <tfoot>
              <tr style="font-weight:bold;">
                <td colspan="2" style="padding:8px;">Tổng cộng</td>
                <td style="text-align:right;padding:8px;">${order.totalAmount.toLocaleString('vi-VN')}đ</td>
              </tr>
            </tfoot>
          </table>
          <p><strong>Địa chỉ giao hàng:</strong> ${order.shippingAddress}</p>
          <p>Chúng tôi sẽ thông báo khi đơn hàng được giao cho đơn vị vận chuyển.</p>
        </div>
        <div style="background:#F5F2EB;padding:16px;text-align:center;font-size:12px;color:#6B6B6B;">
          © 2026 Ergonia. Sản phẩm công thái học.
        </div>
      </div>
    `
  })
}
