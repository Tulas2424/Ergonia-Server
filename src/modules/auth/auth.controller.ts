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
  },

  async updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id
      const result = await authService.updateProfile(userId, req.body)
      sendSuccess(res, result, 'Cập nhật thông tin thành công')
    } catch (error) {
      next(error)
    }
  },

  async changePassword(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id
      const result = await authService.changePassword(userId, req.body)
      sendSuccess(res, result, 'Đổi mật khẩu thành công')
    } catch (error) {
      next(error)
    }
  },

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body
      const result = await authService.requestPasswordReset(email)
      sendSuccess(res, result, 'Yêu cầu đặt lại mật khẩu đã được gửi')
    } catch (error) {
      next(error)
    }
  },

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { token, newPassword } = req.body
      const result = await authService.resetPassword(token, newPassword)
      sendSuccess(res, result, 'Đổi mật khẩu thành công')
    } catch (error) {
      next(error)
    }
  }
}
