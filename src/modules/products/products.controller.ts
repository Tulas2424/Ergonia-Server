import { Request, Response, NextFunction } from 'express'
import { productsService } from './products.service'
import { sendSuccess, sendPaginated } from '../../utils/response'

export const productsController = {
  async getProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const { sort, category, limit, page } = req.query
      const result = await productsService.getProducts({
        sort: sort as string,
        category: category as string,
        limit: limit ? Number(limit) : undefined,
        page: page ? Number(page) : undefined
      })
      
      sendPaginated(res, result.data, result.total, result.page, result.limit)
    } catch (error) {
      next(error)
    }
  },

  async getProductBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const { slug } = req.params
      const product = await productsService.getProductBySlug(slug as string)
      sendSuccess(res, product, 'Success')
    } catch (error) {
      next(error)
    }
  }
}
