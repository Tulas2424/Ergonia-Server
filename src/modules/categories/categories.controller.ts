import { Request, Response, NextFunction } from 'express'
import { categoriesService } from './categories.service'
import { sendSuccess } from '../../utils/response'

export const categoriesController = {
  async getCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await categoriesService.getCategories()
      sendSuccess(res, categories, 'Success')
    } catch (error) {
      next(error)
    }
  }
}
