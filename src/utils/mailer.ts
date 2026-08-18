import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: Number(process.env.SMTP_PORT) === 465, // true for port 465 (SSL), false for 587 (STARTTLS)
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
})

export const sendOrderConfirmationEmail = async (to: string, order: {
  orderCode: string
  fullName: string
  items: { productNameSnapshot: string; quantity: number; unitPrice: number }[]
  totalAmount: number
  shippingAddress: string
}) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:8000'
  const trackingUrl = `${clientUrl}/orders/${order.orderCode}`

  const itemsHtml = order.items.map(i =>
    `<tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${i.productNameSnapshot}</td>
      <td style="text-align:center; padding: 10px; border-bottom: 1px solid #eee;">${i.quantity}</td>
      <td style="text-align:right; padding: 10px; border-bottom: 1px solid #eee;">${Number(i.unitPrice).toLocaleString('vi-VN')}đ</td>
    </tr>`
  ).join('')

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: `[Ergonia] Xác nhận đơn hàng #${order.orderCode}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; background: #ffffff;">
        <div style="background: #2D5A4E; padding: 28px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 26px; font-weight: bold; letter-spacing: 1px;">Ergonia</h1>
        </div>
        <div style="padding: 32px;">
          <h2 style="color: #111827; margin-top: 0;">Xin chào ${order.fullName}!</h2>
          <p style="color: #4b5563; font-size: 15px; leading-height: 1.6;">Đơn hàng <strong style="color: #2D5A4E;">#${order.orderCode}</strong> của bạn đã được đặt thành công.</p>

          <table style="width:100%; border-collapse:collapse; margin: 20px 0; font-size: 14px;">
            <thead>
              <tr style="background:#F5F2EB; color: #374151;">
                <th style="text-align:left; padding: 10px;">Sản phẩm</th>
                <th style="text-align:center; padding: 10px;">SL</th>
                <th style="text-align:right; padding: 10px;">Giá</th>
              </tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
            <tfoot>
              <tr style="font-weight:bold; font-size: 15px; color: #111827;">
                <td colspan="2" style="padding: 12px 10px;">Tổng cộng</td>
                <td style="text-align:right; padding: 12px 10px; color: #2D5A4E;">${Number(order.totalAmount).toLocaleString('vi-VN')}đ</td>
              </tr>
            </tfoot>
          </table>

          <div style="background: #F9FAFB; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
            <p style="margin: 0; color: #374151; font-size: 14px;"><strong>Địa chỉ giao hàng:</strong> ${order.shippingAddress}</p>
          </div>

          <!-- TRACKING BUTTON -->
          <div style="text-align: center; margin: 32px 0;">
            <a href="${trackingUrl}" target="_blank" style="background-color: #2D5A4E; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 15px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
              🚚 Theo dõi tiến trình đơn hàng
            </a>
          </div>

          <p style="color: #6b7280; font-size: 13px; text-align: center;">Nếu nút trên không bấm được, bạn có thể copy link sau vào trình duyệt:<br/><a href="${trackingUrl}" style="color: #2D5A4E;">${trackingUrl}</a></p>
        </div>
        <div style="background:#F5F2EB; padding: 16px; text-align: center; font-size: 12px; color: #6B6B6B;">
          © 2026 Ergonia. Sản phẩm công thái học.
        </div>
      </div>
    `
  })
}

export const sendPasswordResetEmail = async (to: string, resetLink: string) => {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM || '"Ergonia" <noreply@ergonia.com>',
    to,
    subject: '[Ergonia] Yêu cầu đặt lại mật khẩu',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
        <div style="background: #2D5A4E; padding: 24px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Ergonia</h1>
        </div>
        <div style="padding: 32px; background: #ffffff;">
          <h2 style="color: #333;">Yêu cầu đặt lại mật khẩu</h2>
          <p>Xin chào,</p>
          <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản Ergonia của bạn. Nếu bạn là người yêu cầu, vui lòng click vào nút bên dưới để đổi mật khẩu (Link có hiệu lực trong 1 giờ):</p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${resetLink}" style="background-color: #2D5A4E; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Đổi Mật Khẩu Mới</a>
          </div>
          <p>Nếu bạn không gửi yêu cầu này, vui lòng bỏ qua email này. Tài khoản của bạn vẫn an toàn.</p>
        </div>
        <div style="background:#F5F2EB;padding:16px;text-align:center;font-size:12px;color:#6B6B6B;">
          © 2026 Ergonia. Sản phẩm công thái học.
        </div>
      </div>
    `
  })
}
