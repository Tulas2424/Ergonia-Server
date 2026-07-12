import jwt from 'jsonwebtoken'

const SECRET = process.env.JWT_SECRET!
const EXPIRES = process.env.JWT_EXPIRES_IN || '7d'

export const signToken = (payload: { id: number; email: string; role: string }) =>
  jwt.sign(payload, SECRET, { expiresIn: EXPIRES as jwt.SignOptions['expiresIn'] })

export const verifyToken = (token: string) =>
  jwt.verify(token, SECRET) as { id: number; email: string; role: string }
