import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import { errorMiddleware } from './middlewares/error.middleware'

// Routers
import authRouter from './modules/auth/auth.router'
import productsRouter from './modules/products/products.router'
import categoriesRouter from './modules/categories/categories.router'
import cartRouter from './modules/cart/cart.router'
import ordersRouter from './modules/orders/orders.router'
import quizRouter from './modules/quiz/quiz.router'
import qrRouter from './modules/qr/qr.router'
import vouchersRouter from './modules/vouchers/vouchers.router'

declare global {
  interface BigInt {
    toJSON(): number;
  }
}

BigInt.prototype.toJSON = function() {
  return Number(this);
}

dotenv.config()
const app = express()
const port = process.env.PORT || 3000

app.use(helmet())
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3001',
  credentials: true,
}))
app.use(express.json())

// Health check
app.get('/', (req, res) => res.json({ status: 'ok', message: 'Ergonia API is running' }))

// Routes
app.use('/api/auth',       authRouter)
app.use('/api/products',   productsRouter)
app.use('/api/categories', categoriesRouter)
app.use('/api/cart',       cartRouter)
app.use('/api/orders',     ordersRouter)
app.use('/api/quiz',       quizRouter)
app.use('/api/qr',         qrRouter)
app.use('/api/vouchers',   vouchersRouter)

// Global error handler (PHẢI đặt sau tất cả routes)
app.use(errorMiddleware)

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`)
})
