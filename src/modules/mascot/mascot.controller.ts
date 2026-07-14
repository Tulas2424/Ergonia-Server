import { Request, Response, NextFunction } from 'express'
import { mascotService } from './mascot.service'
import { sendSuccess } from '../../utils/response'

export const mascotController = {
  async getDialogueByContextKey(req: Request, res: Response, next: NextFunction) {
    try {
      const { contextKey } = req.params
      const result = await mascotService.getDialogueByContextKey(contextKey)

      if (!result) {
        const error = new Error('Dialogue not found') as any
        error.statusCode = 404
        throw error
      }

      sendSuccess(res, result, 'Success')
    } catch (error) {
      next(error)
    }
  },

  async getCharacters(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await mascotService.getCharacters()
      sendSuccess(res, result, 'Success')
    } catch (error) {
      next(error)
    }
  }
}
