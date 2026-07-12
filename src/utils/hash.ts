import bcrypt from 'bcrypt'

const ROUNDS = 10

export const hashPassword = (password: string) => bcrypt.hash(password, ROUNDS)
export const comparePassword = (password: string, hash: string) => bcrypt.compare(password, hash)
