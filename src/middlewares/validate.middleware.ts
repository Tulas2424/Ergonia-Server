import { Request, Response, NextFunction } from 'express'
import { ZodSchema, ZodError, z } from 'zod'

export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body)
      next()
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          message: 'Dữ liệu đầu vào không hợp lệ',
          errors: error.issues
        })
      } else {
        next(error)
      }
    }
  }
}

export const registerSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  fullName: z.string().min(2, 'Tên phải có ít nhất 2 ký tự')
})

export const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu')
})

export const createOrderSchema = z.object({
  shippingAddressId: z.number().optional(),
  shippingAddress: z.object({
    recipientName: z.string().min(1),
    phone: z.string().min(9),
    addressLine: z.string().min(1),
    ward: z.string().optional(),
    district: z.string().optional(),
    province: z.string().optional(),
  }).optional(),
  paymentMethod: z.enum(['cod', 'sepay', 'bank_transfer']),
  voucherId: z.number().optional(),
  items: z.array(z.object({
    productId: z.number(),
    variantId: z.number().optional(),
    quantity: z.number().min(1),
    unitPrice: z.number()
  })).min(1, 'Đơn hàng phải có ít nhất 1 sản phẩm')
})
