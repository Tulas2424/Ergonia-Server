import { Request, Response, NextFunction } from 'express'
import { qrService } from './qr.service'
import { sendSuccess } from '../../utils/response'

export const qrController = {
  async validateQrCode(req: Request, res: Response, next: NextFunction) {
    try {
      const code = req.params.code as string
      const ipAddress = req.ip
      const userAgent = req.headers['user-agent']
      const result = await qrService.validateQrCode(code, ipAddress, userAgent)
      sendSuccess(res, result, 'Success')
    } catch (error) {
      next(error)
    }
  }
}
