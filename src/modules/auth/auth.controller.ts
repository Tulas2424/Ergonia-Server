import { Request, Response, NextFunction } from 'express'
import { authService } from './auth.service'
import { sendSuccess } from '../../utils/response'
import { AuthRequest } from '../../middlewares/auth.middleware'

export const authController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.register(req.body)
      sendSuccess(res, result, 'Đăng ký thành công', 201)
    } catch (error) {
      next(error)
    }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.login(req.body)
      sendSuccess(res, result, 'Đăng nhập thành công')
    } catch (error) {
      next(error)
    }
  },

  async getProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id
      const result = await authService.getProfile(userId)
      sendSuccess(res, result, 'Lấy thông tin thành công')
    } catch (error) {
      next(error)
    }
  }
}
