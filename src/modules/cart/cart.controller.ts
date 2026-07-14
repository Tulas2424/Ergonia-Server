import { Request, Response, NextFunction } from 'express'
import { cartService } from './cart.service'
import { sendSuccess } from '../../utils/response'
import { verifyToken } from '../../utils/jwt'

export const cartController = {
  async getCart(req: Request, res: Response, next: NextFunction) {
    try {
      const sessionToken = req.headers['x-session-token'] as string | undefined;
      const authHeader = req.headers.authorization;
      let userId: number | undefined;

      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
          const user = verifyToken(token);
          userId = user.id;
        } catch {
          // ignore error, fallback to sessionToken
        }
      }

      const result = await cartService.getCart(userId, sessionToken);
      sendSuccess(res, result, 'Lấy giỏ hàng thành công');
    } catch (error) {
      next(error);
    }
  },

  async addCartItem(req: Request, res: Response, next: NextFunction) {
    try {
      const sessionToken = req.headers['x-session-token'] as string | undefined;
      const authHeader = req.headers.authorization;
      let userId: number | undefined;

      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
          const user = verifyToken(token);
          userId = user.id;
        } catch {
          // ignore error, fallback to sessionToken
        }
      }

      const result = await cartService.addCartItem({
        ...req.body,
        userId,
        sessionToken
      });
      sendSuccess(res, result, 'Đã thêm vào giỏ hàng');
    } catch (error) {
      next(error);
    }
  },

  async removeCartItem(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await cartService.removeCartItem(id as string);
      sendSuccess(res, null, 'Đã xóa khỏi giỏ hàng');
    } catch (error) {
      next(error);
    }
  },

  async updateCartItem(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { quantity } = req.body;
      const result = await cartService.updateCartItem(id as string, quantity);
      sendSuccess(res, result, 'Đã cập nhật giỏ hàng');
    } catch (error) {
      next(error);
    }
  }
}
