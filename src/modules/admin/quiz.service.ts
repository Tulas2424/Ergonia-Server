import { prisma } from '../../config/database';

export const adminQuizService = {
  async getAllOptions() {
    const options = await prisma.quizOption.findMany({
      include: {
        question: {
          select: { questionText: true }
        }
      },
      orderBy: [
        { questionId: 'asc' },
        { sortOrder: 'asc' }
      ]
    });
    
    return options.map((opt: any) => ({
       ...opt,
       id: Number(opt.id),
       questionId: Number(opt.questionId),
       nextQuestionId: opt.nextQuestionId ? Number(opt.nextQuestionId) : null,
    }));
  },

  async updateQuizOption(id: number, data: { optionText?: string; resultText?: string; recommendedAction?: string }) {
    const option = await prisma.quizOption.update({
      where: { id: BigInt(id) },
      data: {
        optionText: data.optionText,
        resultText: data.resultText,
        recommendedAction: data.recommendedAction
      }
    });

    return {
       ...option,
       id: Number(option.id),
       questionId: Number(option.questionId),
       nextQuestionId: option.nextQuestionId ? Number(option.nextQuestionId) : null,
    };
  },

  async getAllDialogues() {
    const dialogues = await prisma.mascotDialogue.findMany({
      include: { mascot: true },
      orderBy: { contextKey: 'asc' }
    });

    return dialogues.map((d: any) => ({
      ...d,
      id: Number(d.id),
      mascotId: Number(d.mascotId),
      mascot: d.mascot ? { ...d.mascot, id: Number(d.mascot.id) } : null
    }));
  },

  async updateMascotDialogue(id: number, data: { dialogueText?: string; emotionState?: string }) {
    const dialogue = await prisma.mascotDialogue.update({
      where: { id: BigInt(id) },
      data: {
        dialogueText: data.dialogueText,
        emotionState: data.emotionState
      }
    });

    return {
      ...dialogue,
      id: Number(dialogue.id),
      mascotId: Number(dialogue.mascotId)
    };
  }
};
