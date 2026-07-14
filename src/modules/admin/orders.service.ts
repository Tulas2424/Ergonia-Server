import { prisma } from '../../config/database';
import { OrderStatus } from '@prisma/client';
import { createShipment } from '../../utils/shipping';

export const adminOrdersService = {
  async getAllOrders(filters: { status?: string; search?: string; page?: number; limit?: number }) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (filters.status) {
      where.orderStatus = filters.status;
    }
    
    if (filters.search) {
      where.OR = [
        { orderCode: { contains: filters.search, mode: 'insensitive' } },
        { user: { fullName: { contains: filters.search, mode: 'insensitive' } } },
        { user: { email: { contains: filters.search, mode: 'insensitive' } } },
        { user: { phone: { contains: filters.search, mode: 'insensitive' } } },
        { shippingAddress: { phone: { contains: filters.search, mode: 'insensitive' } } },
        { shippingAddress: { recipientName: { contains: filters.search, mode: 'insensitive' } } }
      ];
    }

    const [total, orders] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, fullName: true, email: true, phone: true }
          },
          shippingAddress: true,
          items: {
            include: {
              product: { select: { id: true, name: true, images: { where: { isThumbnail: true }, take: 1 } } },
              variant: { select: { id: true, variantName: true } }
            }
          }
        }
      })
    ]);

    const serializedOrders = orders.map((o: any) => ({
      ...o,
      id: Number(o.id),
      userId: o.userId ? Number(o.userId) : null,
      shippingAddressId: o.shippingAddressId ? Number(o.shippingAddressId) : null,
      quizSessionId: o.quizSessionId ? Number(o.quizSessionId) : null,
      voucherId: o.voucherId ? Number(o.voucherId) : null,
      user: o.user ? { ...o.user, id: Number(o.user.id) } : null,
      shippingAddress: o.shippingAddress ? {
         ...o.shippingAddress,
         id: Number(o.shippingAddress.id),
         userId: Number(o.shippingAddress.userId)
      } : null,
      items: o.items.map((i: any) => ({
         ...i,
         id: Number(i.id),
         orderId: Number(i.orderId),
         productId: Number(i.productId),
         variantId: i.variantId ? Number(i.variantId) : null,
         product: i.product ? {
            ...i.product,
            id: Number(i.product.id),
            images: i.product.images.map((img: any) => ({
              ...img,
              id: Number(img.id),
              productId: Number(img.productId)
            }))
         } : null,
         variant: i.variant ? { ...i.variant, id: Number(i.variant.id) } : null
      }))
    }));

    return {
      data: serializedOrders,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  },

  async getOrderByCode(code: string) {
    const order = await prisma.order.findUnique({
      where: { orderCode: code },
      include: {
        user: { select: { id: true, fullName: true, email: true, phone: true } },
        shippingAddress: true,
        items: {
          include: {
            product: { include: { images: { where: { isThumbnail: true }, take: 1 } } },
            variant: true
          }
        },
        statusHistory: { orderBy: { createdAt: 'desc' } },
        shipments: true,
        transactions: true
      }
    });

    if (!order) {
      const error: any = new Error('Order not found');
      error.statusCode = 404;
      throw error;
    }

    return JSON.parse(JSON.stringify(order, (key, value) =>
      typeof value === 'bigint' ? Number(value) : value
    ));
  },

  async updateOrderStatus(code: string, status: OrderStatus) {
    const order = await prisma.order.findUnique({
      where: { orderCode: code }
    });

    if (!order) {
      const error: any = new Error('Order not found');
      error.statusCode = 404;
      throw error;
    }

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { orderCode: code },
      data: { orderStatus: status }
    });

    // Create log
    await prisma.orderStatusHistory.create({
      data: {
        orderId: order.id,
        status: status,
        note: `Status updated to ${status} by Admin`
      }
    });

    // If confirmed, trigger shipment creation
    if (status === 'confirmed') {
      createShipment(order.orderCode).then(async (shipmentResult) => {
         if (shipmentResult.success) {
           await prisma.shipment.create({
             data: {
               orderId: order.id,
               trackingCode: shipmentResult.trackingCode,
               status: 'pending'
             }
           });
         }
      }).catch(err => {
         console.error('Failed to create shipment:', err);
      });
    }

    return {
      ...updatedOrder,
      id: Number(updatedOrder.id),
      userId: updatedOrder.userId ? Number(updatedOrder.userId) : null,
      shippingAddressId: updatedOrder.shippingAddressId ? Number(updatedOrder.shippingAddressId) : null,
      quizSessionId: updatedOrder.quizSessionId ? Number(updatedOrder.quizSessionId) : null,
      voucherId: updatedOrder.voucherId ? Number(updatedOrder.voucherId) : null,
    };
  }
};
