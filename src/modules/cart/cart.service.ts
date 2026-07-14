import { prisma } from '../../config/database'

export interface AddCartItemData {
  productId: number;
  variantId?: number;
  quantity: number;
  userId?: number;
  sessionToken?: string;
}

export const cartService = {
  async getCart(userId?: number, sessionToken?: string) {
    if (!userId && !sessionToken) {
      return { items: [] }
    }

    const cartWhere = userId
      ? { userId: BigInt(userId) }
      : { sessionToken: sessionToken }

    const cart = await prisma.cart.findFirst({
      where: cartWhere,
      include: {
        items: {
          include: {
            product: {
              include: {
                images: {
                  where: { isThumbnail: true },
                  take: 1
                }
              }
            },
            variant: true
          }
        }
      }
    })

    if (!cart) {
      return { items: [] }
    }

    return cart
  },

  async addCartItem(data: AddCartItemData) {
    if (!data.userId && !data.sessionToken) {
      const error = new Error('Yêu cầu userId hoặc sessionToken để thao tác giỏ hàng') as any;
      error.statusCode = 400;
      throw error;
    }

    const cartWhere = data.userId
      ? { userId: BigInt(data.userId) }
      : { sessionToken: data.sessionToken };

    let cart = await prisma.cart.findFirst({ where: cartWhere });
    
    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          userId: data.userId ? BigInt(data.userId) : null,
          sessionToken: data.sessionToken || null
        }
      });
    }

    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId: BigInt(data.productId),
        variantId: data.variantId ? BigInt(data.variantId) : null
      }
    });

    if (existingItem) {
      return prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + data.quantity }
      });
    }

    let priceAtAdd = 0;
    if (data.variantId) {
      const variant = await prisma.productVariant.findUnique({ where: { id: BigInt(data.variantId) } });
      if (variant && variant.price) priceAtAdd = Number(variant.price);
    } 
    
    if (priceAtAdd === 0) {
      const product = await prisma.product.findUnique({ where: { id: BigInt(data.productId) } });
      if (product) priceAtAdd = Number(product.salePrice || product.basePrice);
    }

    return prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId: BigInt(data.productId),
        variantId: data.variantId ? BigInt(data.variantId) : null,
        quantity: data.quantity,
        priceAtAdd: priceAtAdd
      }
    });
  },

  async removeCartItem(id: string, userId?: number) {
    await prisma.cartItem.delete({
      where: { id: BigInt(id) }
    });
    return true;
  },

  async updateCartItem(id: string, quantity: number) {
    return prisma.cartItem.update({
      where: { id: BigInt(id) },
      data: { quantity }
    });
  }
}
