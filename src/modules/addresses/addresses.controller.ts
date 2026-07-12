import { Response, NextFunction } from 'express'
import { addressesService } from './addresses.service'
import { sendSuccess } from '../../utils/response'
import { AuthRequest } from '../../middlewares/auth.middleware'

export const addressesController = {
  async getMyAddresses(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await addressesService.getMyAddresses(req.user!.id)
      sendSuccess(res, result, 'Lấy danh sách địa chỉ thành công')
    } catch (error) {
      next(error)
    }
  },

  async createAddress(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await addressesService.createAddress(req.user!.id, req.body)
      sendSuccess(res, result, 'Tạo địa chỉ thành công', 201)
    } catch (error) {
      next(error)
    }
  },

  async setDefault(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await addressesService.setDefault(Number(req.params.id), req.user!.id)
      sendSuccess(res, result, 'Cập nhật địa chỉ mặc định thành công')
    } catch (error) {
      next(error)
    }
  },

  async deleteAddress(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await addressesService.deleteAddress(Number(req.params.id), req.user!.id)
      sendSuccess(res, result, 'Xóa địa chỉ thành công')
    } catch (error) {
      next(error)
    }
  }
}
