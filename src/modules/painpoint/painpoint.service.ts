import { prisma } from '../../config/database'

export const painpointService = {
  async getBodyParts() {
    return prisma.bodyPart.findMany({
      orderBy: { id: 'asc' }
    })
  },

  async getGuides(bodyPartId: number, chairTypeId?: number) {
    const where: any = { bodyPartId: BigInt(bodyPartId) }
    if (chairTypeId) {
      where.chairTypeId = BigInt(chairTypeId)
    }

    return prisma.painPointGuide.findMany({
      where,
      include: {
        bodyPart: true,
        chairType: true,
        product: {
          include: {
            images: {
              where: { isThumbnail: true },
              take: 1
            }
          }
        }
      }
    })
  },

  async getChairTypes() {
    return prisma.chairType.findMany({
      orderBy: { id: 'asc' }
    })
  }
}
