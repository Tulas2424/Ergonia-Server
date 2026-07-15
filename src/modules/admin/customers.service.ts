import { prisma } from '../../config/database';

export class AdminCustomersService {
  static async getCustomers(query: any) {
    const page = parseInt(query.page || '1');
    const limit = parseInt(query.limit || '20');
    const skip = (page - 1) * limit;

    const where: any = { role: 'customer' };
    if (query.search) {
      where.OR = [
        { fullName: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
        { phone: { contains: query.search, mode: 'insensitive' } }
      ];
    }
    
    if (query.status) {
       where.status = query.status;
    }

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          status: true,
          createdAt: true,
          _count: {
             select: { orders: true }
          }
        }
      })
    ]);

    return {
      data: JSON.parse(JSON.stringify(users, (key, value) => typeof value === 'bigint' ? Number(value) : value)),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
    };
  }

  static async getCustomerById(id: number) {
    const user = await prisma.user.findFirst({
      where: { id, role: 'customer' },
      include: {
        addresses: true,
        orders: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    });

    if (!user) {
      const error: any = new Error('Không tìm thấy khách hàng');
      error.statusCode = 404;
      throw error;
    }
    
    return JSON.parse(JSON.stringify(user, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    ));
  }

  static async updateCustomerStatus(id: number, status: string) {
    const user = await prisma.user.updateMany({
      where: { id, role: 'customer' },
      data: { status: status as any }
    });

    if (user.count === 0) {
      const error: any = new Error('Không tìm thấy khách hàng');
      error.statusCode = 404;
      throw error;
    }
    return { message: 'Cập nhật trạng thái thành công' };
  }
}
