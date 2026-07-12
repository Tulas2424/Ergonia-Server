import { prisma } from '../../config/database'

export const categoriesService = {
  async getCategories() {
    return prisma.category.findMany({
      where: { parentId: null },
      orderBy: { sortOrder: 'asc' }
    })
  }
}
