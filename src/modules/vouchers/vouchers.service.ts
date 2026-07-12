import { prisma } from '../../config/database'

export const vouchersService = {
  async validateVoucher(code: string) {
    const voucher = await prisma.voucher.findUnique({ where: { code } })

    if (!voucher) {
      const error = new Error('Voucher không tồn tại') as any
      error.statusCode = 400
      throw error
    }

    if (voucher.status !== 'active') {
      const error = new Error('Voucher không còn hoạt động') as any
      error.statusCode = 400
      throw error
    }

    if (voucher.endDate && new Date() > voucher.endDate) {
      const error = new Error('Voucher đã hết hạn') as any
      error.statusCode = 400
      throw error
    }

    if (voucher.usageLimit !== null && voucher.usedCount >= voucher.usageLimit) {
      const error = new Error('Voucher đã hết lượt sử dụng') as any
      error.statusCode = 400
      throw error
    }

    return {
      discount: Number(voucher.discountValue),
      code: voucher.code,
      type: voucher.discountType
    }
  }
}
