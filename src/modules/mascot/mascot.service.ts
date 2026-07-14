import { prisma } from '../../config/database'

export const mascotService = {
  async getDialogueByContextKey(contextKey: string) {
    const dialogue = await prisma.mascotDialogue.findFirst({
      where: { contextKey, status: 'active' },
      include: {
        mascot: true
      }
    })

    if (!dialogue) {
      return null
    }

    return {
      contextKey: dialogue.contextKey,
      emotionState: dialogue.emotionState,
      dialogueText: dialogue.dialogueText,
      mascot: dialogue.mascot ? {
        name: dialogue.mascot.name,
        avatarUrl: dialogue.mascot.avatarUrl
      } : null
    }
  },

  async getCharacters() {
    return prisma.mascotCharacter.findMany({
      include: {
        dialogues: {
          where: { status: 'active' },
          orderBy: { sortOrder: 'asc' }
        }
      }
    })
  }
}
