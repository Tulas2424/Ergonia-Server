import { Request, Response } from 'express'
import { reviewsService } from './reviews.service'

export const reviewsController = {
  async getProductReviews(req: Request, res: Response) {
    try {
      const { productId } = req.params
      if (!productId) {
        return res.status(400).json({ error: 'productId is required' })
      }
      const result = await reviewsService.getProductReviews(BigInt(productId))
      res.json(result)
    } catch (error: any) {
      console.error('Error fetching product reviews:', error)
      res.status(500).json({ error: error.message || 'Internal server error' })
    }
  },

  async checkEligibility(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id
      const { productId } = req.query
      if (!userId || !productId) {
        return res.status(400).json({ error: 'userId and productId are required' })
      }
      const result = await reviewsService.checkCanReview(BigInt(userId), BigInt(productId as string))
      res.json(result)
    } catch (error: any) {
      console.error('Error checking review eligibility:', error)
      res.status(500).json({ error: error.message || 'Internal server error' })
    }
  },

  async createReview(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' })
      }

      const { productId, rating, comment } = req.body
      if (!productId || !rating) {
        return res.status(400).json({ error: 'productId and rating are required' })
      }

      const result = await reviewsService.createReview({
        userId: BigInt(userId),
        productId: BigInt(productId),
        rating: Number(rating),
        comment
      })

      res.status(201).json(result)
    } catch (error: any) {
      console.error('Error creating review:', error)
      res.status(500).json({ error: error.message || 'Internal server error' })
    }
  }
}
