import { prisma } from '../../config/database'
import { PaymentMethod } from '@prisma/client'

export interface CreateOrderData {
  userId: number;
  shippingAddressId?: number;
  paymentMethod: string;
  voucherId?: number;
  items: { productId: number; variantId?: number; quantity: number; unitPrice: number }[];
}

export const ordersService = {
  async createOrder(data: CreateOrderData) {
    let subtotal = 0;
    
    const productIds = Array.from(new Set(data.items.map(i => BigInt(i.productId))));
    const variantIds = Array.from(new Set(data.items.filter(i => i.variantId).map(i => BigInt(i.variantId as number))));

    const products = await prisma.product.findMany({ where: { id: { in: productIds } } });
    const variants = variantIds.length > 0 
      ? await prisma.productVariant.findMany({ where: { id: { in: variantIds } } }) 
      : [];

    const productMap = new Map(products.map(p => [p.id.toString(), p]));
    const variantMap = new Map(variants.map(v => [v.id.toString(), v]));

    const orderItemsData = data.items.map(item => {
      const product = productMap.get(item.productId.toString());
      if (!product) {
        const error = new Error(`Product ID ${item.productId} not found`) as any;
        error.statusCode = 404;
        throw error;
      }
      
      let variantName = '';
      if (item.variantId) {
        const variant = variantMap.get(item.variantId.toString());
        if (variant) {
          variantName = ` - ${variant.variantName}`;
        }
      }

      const itemSubtotal = item.unitPrice * item.quantity;
      subtotal += itemSubtotal;

      return {
        productId: BigInt(item.productId),
        variantId: item.variantId ? BigInt(item.variantId) : null,
        productNameSnapshot: product.name + variantName,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        subtotal: itemSubtotal
      };
    });

    let discountAmount = 0;
    if (data.voucherId) {
      const voucher = await prisma.voucher.findUnique({ where: { id: BigInt(data.voucherId) } });
      if (voucher && voucher.status === 'active') {
        discountAmount = Number(voucher.discountValue);
        if (voucher.discountType === 'percent') {
           discountAmount = (subtotal * discountAmount) / 100;
           if (voucher.maxDiscountAmount && discountAmount > Number(voucher.maxDiscountAmount)) {
             discountAmount = Number(voucher.maxDiscountAmount);
           }
        }
      }
    }

    const shippingFee = 0;
    let totalAmount = subtotal - discountAmount + shippingFee;
    if (totalAmount < 0) totalAmount = 0;

    const orderCode = `ERG-${Date.now()}`;

    const validPaymentMethods = ['cod', 'vnpay', 'momo', 'zalopay', 'bank_transfer'];
    const paymentMethod = validPaymentMethods.includes(data.paymentMethod) 
      ? data.paymentMethod as PaymentMethod 
      : 'cod';

    const order = await prisma.order.create({
      data: {
        orderCode,
        userId: BigInt(data.userId),
        shippingAddressId: data.shippingAddressId ? BigInt(data.shippingAddressId) : null,
        voucherId: data.voucherId ? BigInt(data.voucherId) : null,
        subtotal,
        discountAmount,
        shippingFee,
        totalAmount,
        paymentMethod,
        paymentStatus: 'unpaid',
        orderStatus: 'pending',
        items: {
          create: orderItemsData
        }
      }
    });

    return {
      orderCode: order.orderCode,
      totalAmount: Number(order.totalAmount),
      orderStatus: order.orderStatus
    };
  },

  async getMyOrders(userId: number) {
    return prisma.order.findMany({
      where: { userId: BigInt(userId) },
      orderBy: { createdAt: 'desc' },
      include: {
        items: true
      }
    });
  },

  async getOrderByCode(code: string, userId: number) {
    const order = await prisma.order.findFirst({
      where: { 
        orderCode: code,
        userId: BigInt(userId)
      },
      include: {
        items: true
      }
    });

    if (!order) {
      const error = new Error('Không tìm thấy đơn hàng') as any;
      error.statusCode = 404;
      throw error;
    }

    return order;
  }
};
