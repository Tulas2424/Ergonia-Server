import { prisma } from '../../config/database'

export interface CreateReviewData {
  userId: bigint
  productId: bigint
  rating: number
  comment?: string
}

export const reviewsService = {
  async getProductReviews(productId: bigint) {
    const reviews = await prisma.productReview.findMany({
      where: {
        productId,
      },
      include: {
        user: {
          select: {
            fullName: true,
            email: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const formattedReviews = reviews.map(r => ({
      id: r.id.toString(),
      rating: r.rating,
      comment: r.comment,
      status: r.status,
      createdAt: r.createdAt,
      userName: r.user?.fullName || (r.user?.email ? r.user.email.split('@')[0] : 'Khách hàng'),
    }))

    const total = formattedReviews.length
    const averageRating = total > 0 
      ? Number((formattedReviews.reduce((sum, r) => sum + r.rating, 0) / total).toFixed(1))
      : 5.0

    return {
      reviews: formattedReviews,
      total,
      averageRating
    }
  },

  async checkCanReview(userId: bigint, productId: bigint) {
    const completedOrderWithProduct = await prisma.order.findFirst({
      where: {
        userId,
        orderStatus: 'completed',
        items: {
          some: {
            productId
          }
        }
      }
    })

    const existingReview = await prisma.productReview.findFirst({
      where: {
        userId,
        productId
      }
    })

    const hasPurchased = !!completedOrderWithProduct
    const hasReviewed = !!existingReview

    return {
      canReview: hasPurchased && !hasReviewed,
      hasPurchased,
      hasReviewed
    }
  },

  async createReview(data: CreateReviewData) {
    const eligibility = await this.checkCanReview(data.userId, data.productId)
    if (!eligibility.hasPurchased) {
      throw new Error('Bạn chỉ có thể đánh giá sau khi đã mua và hoàn thành đơn hàng sản phẩm này.')
    }
    if (eligibility.hasReviewed) {
      throw new Error('Bạn đã gửi đánh giá cho sản phẩm này rồi.')
    }

    const review = await prisma.productReview.create({
      data: {
        userId: data.userId,
        productId: data.productId,
        rating: Math.min(5, Math.max(1, data.rating)),
        comment: data.comment || '',
        status: 'approved'
      },
      include: {
        user: {
          select: {
            fullName: true,
            email: true
          }
        }
      }
    })

    return {
      id: review.id.toString(),
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
      userName: review.user?.fullName || (review.user?.email ? review.user.email.split('@')[0] : 'Khách hàng')
    }
  }
}
