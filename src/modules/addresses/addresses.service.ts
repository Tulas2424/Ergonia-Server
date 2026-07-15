import { prisma } from '../../config/database'

export const addressesService = {
  async getMyAddresses(userId: number) {
    const addresses = await prisma.userAddress.findMany({
      where: { userId: BigInt(userId) },
      orderBy: { isDefault: 'desc' }
    });
    return JSON.parse(JSON.stringify(addresses, (key, value) => typeof value === 'bigint' ? Number(value) : value));
  },

  async createAddress(userId: number, data: { recipientName: string, phone: string, addressLine: string, ward?: string, district?: string, province?: string }) {
    const address = await prisma.userAddress.create({
      data: {
        ...data,
        userId: BigInt(userId)
      }
    });
    return JSON.parse(JSON.stringify(address, (key, value) => typeof value === 'bigint' ? Number(value) : value));
  },

  async setDefault(id: number, userId: number) {
    const address = await prisma.userAddress.findFirst({ where: { id: BigInt(id), userId: BigInt(userId) } });
    if (!address) {
      const error = new Error('Địa chỉ không tồn tại hoặc không thuộc quyền sở hữu') as any;
      error.statusCode = 404;
      throw error;
    }

    const result = await prisma.$transaction(async (tx) => {
      await tx.userAddress.updateMany({
        where: { userId: BigInt(userId) },
        data: { isDefault: false }
      });
      return tx.userAddress.update({
        where: { id: BigInt(id) },
        data: { isDefault: true }
      });
    });
    return JSON.parse(JSON.stringify(result, (key, value) => typeof value === 'bigint' ? Number(value) : value));
  },

  async deleteAddress(id: number, userId: number) {
    const address = await prisma.userAddress.findFirst({ where: { id: BigInt(id), userId: BigInt(userId) } });
    if (!address) {
      const error = new Error('Địa chỉ không tồn tại hoặc không thuộc quyền sở hữu') as any;
      error.statusCode = 404;
      throw error;
    }

    const result = await prisma.userAddress.delete({
      where: { id: BigInt(id) }
    });
    return JSON.parse(JSON.stringify(result, (key, value) => typeof value === 'bigint' ? Number(value) : value));
  }
}
