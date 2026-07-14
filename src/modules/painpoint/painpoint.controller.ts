import { Request, Response, NextFunction } from 'express'
import { painpointService } from './painpoint.service'
import { sendSuccess } from '../../utils/response'

export const painpointController = {
  async getBodyParts(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await painpointService.getBodyParts()
      sendSuccess(res, result, 'Success')
    } catch (error) {
      next(error)
    }
  },

  async getGuides(req: Request, res: Response, next: NextFunction) {
    try {
      const bodyPartId = Number(req.query.bodyPartId)
      const chairTypeId = req.query.chairTypeId ? Number(req.query.chairTypeId) : undefined

      if (!bodyPartId) {
        const error = new Error('bodyPartId is required') as any
        error.statusCode = 400
        throw error
      }

      const result = await painpointService.getGuides(bodyPartId, chairTypeId)
      sendSuccess(res, result, 'Success')
    } catch (error) {
      next(error)
    }
  },

  async getChairTypes(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await painpointService.getChairTypes()
      sendSuccess(res, result, 'Success')
    } catch (error) {
      next(error)
    }
  }
}
