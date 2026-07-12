import { Request, Response, NextFunction } from 'express'
import { quizService } from './quiz.service'
import { sendSuccess } from '../../utils/response'

export const quizController = {
  async getQuizById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id)
      const result = await quizService.getQuizById(id)
      sendSuccess(res, result, 'Success')
    } catch (error) {
      next(error)
    }
  },

  async submitQuizSession(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await quizService.submitQuizSession(req.body)
      sendSuccess(res, result, 'Success')
    } catch (error) {
      next(error)
    }
  },

  async getQuizResult(req: Request, res: Response, next: NextFunction) {
    try {
      const { sessionToken } = req.params
      const result = await quizService.getQuizResult(sessionToken as string)
      sendSuccess(res, result, 'Success')
    } catch (error) {
      next(error)
    }
  }
}
