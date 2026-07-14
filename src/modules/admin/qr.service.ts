import { prisma } from '../../config/database';

export const adminQrService = {
  async getAllQrCodes(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [total, qrCodes] = await Promise.all([
      prisma.qrCode.count(),
      prisma.qrCode.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          product: {
             select: { id: true, name: true, sku: true }
          },
          _count: {
            select: { scanLogs: true }
          }
        }
      })
    ]);

    const serialized = qrCodes.map((qr: any) => ({
      ...qr,
      id: Number(qr.id),
      productId: qr.productId ? Number(qr.productId) : null,
      product: qr.product ? { ...qr.product, id: Number(qr.product.id) } : null,
      scanCount: qr._count?.scanLogs || 0
    }));

    return {
      data: serialized,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  },

  async createQrCode(data: { productId?: number; batchName: string }) {
    const codeValue = `ERG-QR-${Date.now()}`;
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    const landingUrl = `${clientUrl}/scan/${codeValue}`;

    const qrCode = await prisma.qrCode.create({
      data: {
        codeValue,
        batchName: data.batchName,
        productId: data.productId ? BigInt(data.productId) : null,
        landingUrl,
        status: 'active'
      }
    });

    return {
      ...qrCode,
      id: Number(qrCode.id),
      productId: qrCode.productId ? Number(qrCode.productId) : null
    };
  },

  async getQrScanStats(qrCodeId: number, days: number) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const result = await prisma.$queryRaw<any[]>`
      SELECT DATE(scanned_at) as date, COUNT(id) as count
      FROM qr_scan_logs
      WHERE qr_code_id = ${BigInt(qrCodeId)} AND scanned_at >= ${startDate}
      GROUP BY DATE(scanned_at)
      ORDER BY DATE(scanned_at) ASC
    `;

    return result.map(row => ({
      date: row.date instanceof Date ? row.date.toISOString().split('T')[0] : String(row.date),
      count: Number(row.count || 0)
    }));
  },

  async deactivateQrCode(id: number) {
    const qrCode = await prisma.qrCode.update({
      where: { id: BigInt(id) },
      data: { status: 'inactive' }
    });

    return {
      ...qrCode,
      id: Number(qrCode.id),
      productId: qrCode.productId ? Number(qrCode.productId) : null
    };
  }
};
