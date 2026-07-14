import dotenv from 'dotenv'
dotenv.config()
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { errorMiddleware } from './middlewares/error.middleware'
import { prisma } from './config/database'

// Routers
import authRouter from './modules/auth/auth.router'
import productsRouter from './modules/products/products.router'
import categoriesRouter from './modules/categories/categories.router'
import cartRouter from './modules/cart/cart.router'
import ordersRouter from './modules/orders/orders.router'
import quizRouter from './modules/quiz/quiz.router'
import qrRouter from './modules/qr/qr.router'
import vouchersRouter from './modules/vouchers/vouchers.router'
import addressesRouter from './modules/addresses/addresses.router'
import paymentsRouter from './modules/payments/payments.router'
import painpointRouter from './modules/painpoint/painpoint.router'
import mascotRouter from './modules/mascot/mascot.router'
import adminRouter from './modules/admin/admin.router'

declare global {
  interface BigInt {
    toJSON(): string;
  }
}

BigInt.prototype.toJSON = function() {
  return this.toString();
}

const app = express()
const port = process.env.PORT || 3000

// Middleware
app.use(helmet())
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3001',
  credentials: true,
}))
app.use(express.json())

// Health check
app.get('/', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`
    res.json({ status: 'ok', message: 'Ergonia API is running', database: 'connected' })
  } catch (error) {
    console.error('Database connection failed:', error)
    res.status(503).json({ status: 'error', message: 'Database connection failed' })
  }
})

// Routes
app.use('/api/auth',       authRouter)
app.use('/api/categories', categoriesRouter)
app.use('/api/products',   productsRouter)
app.use('/api/cart',       cartRouter)
app.use('/api/orders',     ordersRouter)
app.use('/api/quiz',       quizRouter)
app.use('/api/qr',         qrRouter)
app.use('/api/vouchers',   vouchersRouter)
app.use('/api/addresses',  addressesRouter)
app.use('/api/payments',   paymentsRouter)
app.use('/api/painpoint',  painpointRouter)
app.use('/api/mascot',     mascotRouter)
app.use('/api/admin',      adminRouter)

// Global error handler (PHẢI đặt sau tất cả routes)
app.use(errorMiddleware)

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`)
})
