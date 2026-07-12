import { prisma } from '../../config/database'
import crypto from 'crypto'

export const quizService = {
  async getQuizById(id: number) {
    const quiz = await prisma.quiz.findUnique({
      where: { id: BigInt(id) },
      include: {
        questions: {
          where: { status: 'active' },
          orderBy: { sortOrder: 'asc' },
          include: {
            options: { orderBy: { sortOrder: 'asc' } },
            mascotDialogue: true
          }
        }
      }
    })

    if (!quiz) {
      const error = new Error('Quiz not found') as any
      error.statusCode = 404
      throw error
    }

    return quiz
  },

  async submitQuizSession(data: { quizId: number; answers: { questionId: number; optionId: number }[]; userId?: number }) {
    const sessionToken = crypto.randomUUID()
    
    const session = await prisma.quizSession.create({
      data: {
        quizId: BigInt(data.quizId),
        userId: data.userId ? BigInt(data.userId) : null,
        sessionToken,
        startedAt: new Date(),
        completedAt: new Date(),
        responses: {
          create: data.answers.map(a => ({
            questionId: BigInt(a.questionId),
            optionId: BigInt(a.optionId)
          }))
        }
      }
    })

    return {
      sessionToken,
      quizSessionId: Number(session.id)
    }
  },

  async getQuizResult(sessionToken: string) {
    const session = await prisma.quizSession.findFirst({
      where: { sessionToken },
      include: {
        responses: {
          include: {
            option: true
          },
          take: 1
        }
      }
    })

    if (!session || !session.responses.length) {
      const error = new Error('Session not found or incomplete') as any
      error.statusCode = 404
      throw error
    }

    const firstResponse = session.responses[0]
    const option = firstResponse.option
    
    let severity = 'green'
    let contextKey = 'result_green'
    
    if (option.optionLabel === '🔴') {
      severity = 'red'
      contextKey = 'result_red'
    } else if (option.optionLabel === '🟡') {
      severity = 'yellow'
      contextKey = 'result_yellow'
    } else if (option.optionLabel === '🟢') {
      severity = 'green'
      contextKey = 'result_green'
    }

    const mascotDialogue = await prisma.mascotDialogue.findFirst({
      where: { contextKey }
    })

    return {
      severity,
      resultText: option.resultText,
      recommendedAction: option.recommendedAction,
      mascotDialogue: mascotDialogue ? {
        emotionState: mascotDialogue.emotionState,
        dialogueText: mascotDialogue.dialogueText
      } : null
    }
  }
}
