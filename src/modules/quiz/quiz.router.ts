import { Router } from 'express'
import { quizController } from './quiz.controller'

const router = Router()

router.get('/:id', quizController.getQuizById)
router.post('/sessions', quizController.submitQuizSession)
router.get('/sessions/:sessionToken/result', quizController.getQuizResult)

export default router
