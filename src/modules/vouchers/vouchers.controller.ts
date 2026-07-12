import { Request, Response, NextFunction } from 'express'
import { vouchersService } from './vouchers.service'
import { sendSuccess } from '../../utils/response'

export const vouchersController = {
  async validateVoucher(req: Request, res: Response, next: NextFunction) {
    try {
      const { code } = req.body
      if (!code) {
        throw Object.assign(new Error('Vui lòng cung cấp mã voucher'), { statusCode: 400 })
      }
      const result = await vouchersService.validateVoucher(code)
      sendSuccess(res, result, 'Áp dụng voucher thành công')
    } catch (error) {
      next(error)
    }
  }
}
