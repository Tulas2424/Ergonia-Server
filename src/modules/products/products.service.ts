import { prisma } from '../../config/database'
import { Prisma } from '@prisma/client'

export interface GetProductsFilters {
  sort?: string;
  category?: string;
  limit?: number;
  page?: number;
}

export const productsService = {
  async getProducts(filters: GetProductsFilters) {
    const page = filters.page ? Number(filters.page) : 1
    const limit = filters.limit ? Number(filters.limit) : 8
    const skip = (page - 1) * limit

    const where: Prisma.ProductWhereInput = { status: 'active' }
    if (filters.category) {
      where.category = { slug: filters.category }
    }

    let orderBy: Prisma.ProductOrderByWithRelationInput = {}
    if (filters.sort === 'newest') {
      orderBy = { createdAt: 'desc' }
    } else if (filters.sort === 'bestseller') {
      orderBy = { stockQuantity: 'asc' } // Simple fallback as requested
    }

    const [data, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          images: true,
          variants: true,
          attributes: true,
          category: true
        }
      }),
      prisma.product.count({ where })
    ])

    return {
      data,
      total,
      page,
      limit
    }
  },

  async getProductBySlug(slug: string) {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        images: true,
        variants: true,
        attributes: true,
        category: true
      }
    })

    if (!product) {
      const error = new Error('Product not found') as any
      error.statusCode = 404
      throw error
    }

    return product
  }
}
