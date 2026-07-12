import { prisma } from '../../config/database'
import { hashPassword, comparePassword } from '../../utils/hash'
import { signToken } from '../../utils/jwt'

export interface RegisterInput {
  fullName: string;
  email: string;
  phone?: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export const authService = {
  async register(data: RegisterInput) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    })
    
    if (existingUser) {
      const error = new Error('Email đã tồn tại') as any;
      error.statusCode = 409;
      throw error;
    }

    const hashedPassword = await hashPassword(data.password)

    const user = await prisma.user.create({
      data: {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        passwordHash: hashedPassword,
        role: 'customer'
      }
    })

    const token = signToken({
      id: Number(user.id),
      email: user.email!,
      role: user.role
    })

    return {
      token,
      user: {
        id: Number(user.id),
        fullName: user.fullName,
        email: user.email,
        role: user.role
      }
    }
  },

  async login(data: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: data.email }
    })

    if (!user || !user.passwordHash) {
      const error = new Error('Email hoặc mật khẩu không chính xác') as any;
      error.statusCode = 401;
      throw error;
    }

    const isMatch = await comparePassword(data.password, user.passwordHash)
    if (!isMatch) {
      const error = new Error('Email hoặc mật khẩu không chính xác') as any;
      error.statusCode = 401;
      throw error;
    }

    const token = signToken({
      id: Number(user.id),
      email: user.email!,
      role: user.role
    })

    return {
      token,
      user: {
        id: Number(user.id),
        fullName: user.fullName,
        email: user.email,
        role: user.role
      }
    }
  },

  async getProfile(userId: number) {
    const user = await prisma.user.findUnique({
      where: { id: BigInt(userId) },
      select: { id: true, fullName: true, email: true, phone: true, avatarUrl: true, role: true }
    })

    if (!user) {
      const error = new Error('Không tìm thấy người dùng') as any;
      error.statusCode = 404;
      throw error;
    }

    return {
      ...user,
      id: Number(user.id)
    }
  }
}
