import { prisma } from '../../config/database'
import crypto from 'crypto'

export const qrService = {
  async validateQrCode(code: string, ipAddress?: string, userAgent?: string) {
    const qrCode = await prisma.qrCode.findUnique({
      where: { codeValue: code },
      include: { product: { include: { images: true } } }
    })

    if (!qrCode || qrCode.status !== 'active' || qrCode.product?.status !== 'active') {
      const error = new Error('QR Code not found or product inactive') as any
      error.statusCode = 404
      throw error
    }

    const sessionToken = crypto.randomUUID()
    
    await prisma.qrScanLog.create({
      data: {
        qrCodeId: qrCode.id,
        sessionToken: sessionToken,
        ipAddress: ipAddress || null,
        deviceInfo: userAgent || null
      }
    })

    return qrCode
  }
}
