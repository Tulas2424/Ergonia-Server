import { prisma } from '../../config/database'

export const addressesService = {
  async getMyAddresses(userId: number) {
    return prisma.userAddress.findMany({
      where: { userId: BigInt(userId) },
      orderBy: { isDefault: 'desc' }
    })
  },

  async createAddress(userId: number, data: { recipientName: string, phone: string, addressLine: string, ward?: string, district?: string, province?: string }) {
    return prisma.userAddress.create({
      data: {
        ...data,
        userId: BigInt(userId)
      }
    })
  },

  async setDefault(id: number, userId: number) {
    return prisma.$transaction(async (tx) => {
      await tx.userAddress.updateMany({
        where: { userId: BigInt(userId) },
        data: { isDefault: false }
      });
      return tx.userAddress.update({
        where: { id: BigInt(id), userId: BigInt(userId) },
        data: { isDefault: true }
      });
    });
  },

  async deleteAddress(id: number, userId: number) {
    return prisma.userAddress.delete({
      where: { id: BigInt(id), userId: BigInt(userId) }
    })
  }
}
