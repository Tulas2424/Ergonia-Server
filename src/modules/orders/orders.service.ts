import { prisma } from '../../config/database'
import { PaymentMethod } from '@prisma/client'
import { sendOrderConfirmationEmail } from '../../utils/mailer'
import { paymentsService } from '../payments/payments.service'

export interface CreateOrderData {
  userId?: number;
  shippingAddressId?: number;
  shippingAddress?: { recipientName: string; phone: string; addressLine: string; ward?: string; district?: string; province?: string; email?: string };
  paymentMethod: string;
  voucherId?: number;
  items: { productId: number; variantId?: number; quantity: number; unitPrice: number }[];
}

export const ordersService = {
  async createOrder(data: CreateOrderData) {
    let subtotal = 0;
    
    let userId: bigint | null = data.userId ? BigInt(data.userId) : null;

    // If guest checkout (no logged-in userId), auto find or create a user record by phone/email
    if (!userId && data.shippingAddress) {
      const { phone, email, recipientName } = data.shippingAddress;
      const searchConditions: any[] = [];
      if (phone && phone.trim()) searchConditions.push({ phone: phone.trim() });
      if (email && email.trim()) searchConditions.push({ email: email.trim() });

      let guestUser = searchConditions.length > 0
        ? await prisma.user.findFirst({ where: { OR: searchConditions } })
        : null;

      if (!guestUser) {
        guestUser = await prisma.user.create({
          data: {
            fullName: recipientName || 'Khách vãng lai',
            phone: phone ? phone.trim() : null,
            email: email && email.trim() ? email.trim() : null,
            role: 'customer'
          }
        });
      }

      userId = guestUser.id;
    }

    let finalShippingAddressId = data.shippingAddressId ? BigInt(data.shippingAddressId) : null;
    let shippingAddressString = '';

    if (!finalShippingAddressId && data.shippingAddress) {
      const newAddress = await prisma.userAddress.create({
        data: {
          userId: userId!,
          recipientName: data.shippingAddress.recipientName,
          phone: data.shippingAddress.phone,
          addressLine: data.shippingAddress.addressLine,
          ward: data.shippingAddress.ward,
          district: data.shippingAddress.district,
          province: data.shippingAddress.province
        }
      });
      finalShippingAddressId = newAddress.id;
      shippingAddressString = `${newAddress.recipientName} - ${newAddress.phone}, ${newAddress.addressLine}, ${newAddress.ward || ''}, ${newAddress.province || ''}`;
    } else if (finalShippingAddressId) {
      const address = await prisma.userAddress.findUnique({ where: { id: finalShippingAddressId } });
      if (address) {
        shippingAddressString = `${address.recipientName} - ${address.phone}, ${address.addressLine}, ${address.ward || ''}, ${address.province || ''}`;
      }
    }

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

    const orderCode = `ERG${Date.now()}`;

    const validPaymentMethods = ['cod', 'sepay', 'bank_transfer'];
    const paymentMethod = validPaymentMethods.includes(data.paymentMethod) 
      ? data.paymentMethod as PaymentMethod 
      : 'cod';

    const order = await prisma.order.create({
      data: {
        orderCode,
        userId: userId!,
        shippingAddressId: finalShippingAddressId,
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

    let targetEmail = null;
    let targetFullName = 'Bạn';

    if (userId) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (user?.email) {
        targetEmail = user.email;
        targetFullName = user.fullName || 'Bạn';
      }
    }
    if (!targetEmail && data.shippingAddress?.email) {
      targetEmail = data.shippingAddress.email;
      targetFullName = data.shippingAddress.recipientName || 'Bạn';
    }

    if (targetEmail) {
      sendOrderConfirmationEmail(targetEmail, {
        orderCode: order.orderCode,
        fullName: targetFullName,
        items: orderItemsData.map(i => ({
          productNameSnapshot: i.productNameSnapshot,
          quantity: i.quantity,
          unitPrice: i.unitPrice
        })),
        totalAmount: Number(order.totalAmount),
        shippingAddress: shippingAddressString
      }).catch(err => console.error('Failed to send order email:', err));
    }

    let paymentUrl = null;
    if (order.paymentMethod === 'sepay') {
      paymentUrl = await paymentsService.createSePayUrl({
        orderCode: order.orderCode,
        totalAmount: Number(order.totalAmount)
      });
    }

    return {
      orderCode: order.orderCode,
      totalAmount: Number(order.totalAmount),
      orderStatus: order.orderStatus,
      paymentUrl
    };
  },

  async getMyOrders(userId: number) {
    const orders = await prisma.order.findMany({
      where: { userId: BigInt(userId) },
      orderBy: { createdAt: 'desc' },
      include: {
        shippingAddress: true,
        items: {
          include: {
            product: {
              include: {
                images: {
                  where: { isThumbnail: true },
                  take: 1
                }
              }
            }
          }
        }
      }
    });

    return JSON.parse(JSON.stringify(orders, (key, value) =>
      typeof value === 'bigint' ? Number(value) : value
    ));
  },

  async getOrderByCode(code: string, userId?: number) {
    const whereCondition: any = { orderCode: code };
    if (userId) {
      whereCondition.userId = BigInt(userId);
    }

    const order = await prisma.order.findFirst({
      where: whereCondition,
      include: {
        shippingAddress: true,
        items: {
          include: {
            product: {
              include: {
                images: {
                  where: { isThumbnail: true },
                  take: 1
                }
              }
            }
          }
        }
      }
    });

    if (!order) {
      const error = new Error('Không tìm thấy đơn hàng') as any;
      error.statusCode = 404;
      throw error;
    }

    let paymentUrl = null;
    if (order.paymentMethod === 'sepay' && order.paymentStatus === 'unpaid') {
      const bankId = process.env.SEPAY_BANK_ID || 'TPBank';
      const bankAcc = process.env.SEPAY_BANK_ACCOUNT || '1234567890';
      paymentUrl = `https://qr.sepay.vn/img?bank=${bankId}&acc=${bankAcc}&amount=${Number(order.totalAmount)}&des=${order.orderCode}`;
    }

    return {
      ...order,
      id: Number(order.id),
      paymentUrl
    }
  },

  async cancelOrder(userId: number, code: string) {
    const order = await prisma.order.findFirst({
      where: {
        orderCode: code,
        userId: BigInt(userId)
      }
    });

    if (!order) {
      const error = new Error('Không tìm thấy đơn hàng') as any;
      error.statusCode = 404;
      throw error;
    }

    if (order.orderStatus !== 'pending') {
      const error = new Error('Chỉ có thể hủy đơn hàng ở trạng thái Chờ xác nhận') as any;
      error.statusCode = 400;
      throw error;
    }

    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: { orderStatus: 'cancelled' }
    });

    return {
      ...updatedOrder,
      id: Number(updatedOrder.id)
    };
  },

  async updatePaymentStatusByCode(code: string, paymentStatus: 'paid' | 'unpaid') {
    // Also try to find with dash if it was an old order
    const oldFormatCode = code.replace(/^ERG(\d+)$/, 'ERG-$1');
    
    const order = await prisma.order.findFirst({
      where: { 
        OR: [
          { orderCode: code },
          { orderCode: oldFormatCode }
        ]
      }
    });

    if (!order) return null;

    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: { 
        paymentStatus,
        orderStatus: paymentStatus === 'paid' && order.orderStatus === 'pending' ? 'confirmed' : order.orderStatus
      }
    });

    return {
      ...updatedOrder,
      id: Number(updatedOrder.id)
    };
  }
};
