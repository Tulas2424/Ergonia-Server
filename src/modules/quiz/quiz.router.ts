import { Router } from 'express'
import { quizController } from './quiz.controller'

const router = Router()

router.post('/sessions', quizController.submitQuizSession)
router.get('/sessions/:sessionToken/result', quizController.getQuizResult)
router.get('/:id', quizController.getQuizById)

export default router
