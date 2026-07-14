import { prisma } from '../../config/database';

export const statsService = {
  async getTodayStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Revenue hôm nay (order completed hoặc payment paid)
    const revenueResult = await prisma.order.aggregate({
      _sum: {
        totalAmount: true
      },
      where: {
        createdAt: {
          gte: today
        },
        OR: [
          { orderStatus: 'completed' },
          { paymentStatus: 'paid' }
        ]
      }
    });

    // New Orders hôm nay (pending)
    const newOrders = await prisma.order.count({
      where: {
        createdAt: {
          gte: today
        },
        orderStatus: 'pending'
      }
    });

    // New Customers 7 ngày
    const newCustomers = await prisma.user.count({
      where: {
        createdAt: {
          gte: sevenDaysAgo
        },
        role: 'customer'
      }
    });

    // QR Scans 7 ngày
    const qrScans = await prisma.qrScanLog.count({
      where: {
        scannedAt: {
          gte: sevenDaysAgo
        }
      }
    });

    return {
      revenue: Number(revenueResult._sum.totalAmount || 0),
      newOrders,
      newCustomers,
      qrScans
    };
  },

  async getRevenueByDays(days: number) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    // Dùng queryRaw để group by date (cast createdAt to DATE)
    // Postgres cast: DATE(created_at)
    const result = await prisma.$queryRaw<any[]>`
      SELECT DATE(created_at) as date, SUM(total_amount) as revenue
      FROM orders
      WHERE created_at >= ${startDate}
        AND (order_status = 'completed' OR payment_status = 'paid')
      GROUP BY DATE(created_at)
      ORDER BY DATE(created_at) ASC
    `;

    return result.map((row: any) => ({
      // row.date in PG queryRaw might be Date object or string depending on driver
      date: row.date instanceof Date ? row.date.toISOString().split('T')[0] : String(row.date),
      revenue: Number(row.revenue || 0)
    }));
  },

  async getFunnelStats() {
    const qrScans = await prisma.qrScanLog.count();
    const quizStarted = await prisma.quizSession.count();
    const quizCompleted = await prisma.quizSession.count({
      where: {
        completedAt: {
          not: null
        }
      }
    });
    const purchases = await prisma.order.count({
      where: {
        orderStatus: {
          not: 'cancelled'
        }
      }
    });

    // Calculate conversions
    const scanToQuiz = qrScans > 0 ? (quizStarted / qrScans) * 100 : 0;
    const quizToComplete = quizStarted > 0 ? (quizCompleted / quizStarted) * 100 : 0;
    const completeToPurchase = quizCompleted > 0 ? (purchases / quizCompleted) * 100 : 0;

    return {
      qrScans,
      quizStarted,
      quizCompleted,
      purchases,
      conversions: {
        scanToQuiz: Number(scanToQuiz.toFixed(2)),
        quizToComplete: Number(quizToComplete.toFixed(2)),
        completeToPurchase: Number(completeToPurchase.toFixed(2))
      }
    };
  }
};
