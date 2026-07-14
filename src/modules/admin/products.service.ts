import { prisma } from '../../config/database';
import { ProductStatus } from '@prisma/client';

export interface ProductCreateInput {
  sku: string;
  name: string;
  slug: string;
  categoryId?: number;
  shortDescription?: string;
  description?: string;
  basePrice: number;
  salePrice?: number;
  stockQuantity: number;
  status?: ProductStatus;
  images?: { imageUrl: string; isThumbnail?: boolean }[];
  attributes?: { attributeName: string; attributeValue: string }[];
  variants?: { variantName: string; sku: string; price?: number; stockQuantity?: number }[];
}

export const adminProductsService = {
  async getAllProducts(filters: { search?: string; categoryId?: number; status?: string; page?: number; limit?: number }) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.categoryId) {
      where.categoryId = BigInt(filters.categoryId);
    }
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { sku: { contains: filters.search, mode: 'insensitive' } }
      ];
    }

    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          category: true,
          images: {
            where: { isThumbnail: true },
            take: 1
          },
          variants: true
        }
      })
    ]);

    const serialized = products.map((p: any) => ({
      ...p,
      id: Number(p.id),
      categoryId: p.categoryId ? Number(p.categoryId) : null,
      basePrice: Number(p.basePrice),
      salePrice: p.salePrice ? Number(p.salePrice) : null,
      category: p.category ? { ...p.category, id: Number(p.category.id), parentId: p.category.parentId ? Number(p.category.parentId) : null } : null,
      images: p.images.map((img: any) => ({ ...img, id: Number(img.id), productId: Number(img.productId) })),
      variants: p.variants ? p.variants.map((v: any) => ({ ...v, id: Number(v.id), productId: Number(v.productId), price: v.price ? Number(v.price) : null })) : []
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

  async createProduct(data: ProductCreateInput) {
    // Validate slug unique
    const existing = await prisma.product.findUnique({ where: { slug: data.slug } });
    if (existing) {
      const error: any = new Error('Slug already exists');
      error.statusCode = 400;
      throw error;
    }

    const product = await prisma.product.create({
      data: {
        sku: data.sku,
        name: data.name,
        slug: data.slug,
        categoryId: data.categoryId ? BigInt(data.categoryId) : null,
        shortDescription: data.shortDescription,
        description: data.description,
        basePrice: data.basePrice,
        salePrice: data.salePrice,
        stockQuantity: data.stockQuantity,
        status: data.status || 'active',
        images: {
          create: data.images?.map((img, idx) => ({
            imageUrl: img.imageUrl,
            isThumbnail: img.isThumbnail || false,
            sortOrder: idx
          })) || []
        },
        attributes: {
          create: data.attributes?.map(attr => ({
            attributeName: attr.attributeName,
            attributeValue: attr.attributeValue
          })) || []
        },
        variants: {
          create: data.variants?.map(v => ({
            variantName: v.variantName,
            sku: v.sku,
            price: v.price || null,
            stockQuantity: v.stockQuantity || 0
          })) || []
        }
      },
      include: {
        images: true,
        attributes: true,
        variants: true
      }
    });

    return {
      ...product,
      id: Number(product.id),
      categoryId: product.categoryId ? Number(product.categoryId) : null,
      basePrice: Number(product.basePrice),
      salePrice: product.salePrice ? Number(product.salePrice) : null,
      images: product.images.map((img: any) => ({ ...img, id: Number(img.id), productId: Number(img.productId) })),
      attributes: product.attributes.map((attr: any) => ({ ...attr, id: Number(attr.id), productId: Number(attr.productId) }))
    };
  },

  async updateProduct(id: number, data: Partial<ProductCreateInput>) {
    // If updating slug, check uniqueness
    if (data.slug) {
      const existing = await prisma.product.findUnique({ where: { slug: data.slug } });
      if (existing && existing.id !== BigInt(id)) {
        const error: any = new Error('Slug already exists');
        error.statusCode = 400;
        throw error;
      }
    }

    const updateData: any = { ...data };
    delete updateData.images;
    delete updateData.attributes;
    delete updateData.variants;

    if (updateData.categoryId) {
      updateData.categoryId = BigInt(updateData.categoryId);
    }

    if (data.images) {
       await prisma.productImage.deleteMany({ where: { productId: BigInt(id) } });
       updateData.images = {
         create: data.images.map((img, idx) => ({
            imageUrl: img.imageUrl,
            isThumbnail: img.isThumbnail || false,
            sortOrder: idx
         }))
       };
    }

    if (data.attributes) {
       await prisma.productAttribute.deleteMany({ where: { productId: BigInt(id) } });
        updateData.attributes = {
          create: data.attributes.map(attr => ({
             attributeName: attr.attributeName,
             attributeValue: attr.attributeValue
          }))
        };
     }

     if (data.variants) {
        await prisma.productVariant.deleteMany({ where: { productId: BigInt(id) } });
        updateData.variants = {
          create: data.variants.map(v => ({
            variantName: v.variantName,
            sku: v.sku,
            price: v.price || null,
            stockQuantity: v.stockQuantity || 0
          }))
        };
     }

    const product = await prisma.product.update({
      where: { id: BigInt(id) },
      data: updateData,
      include: {
        images: true,
        attributes: true,
        variants: true
      }
    });

    return {
      ...product,
      id: Number(product.id),
      categoryId: product.categoryId ? Number(product.categoryId) : null,
      basePrice: Number(product.basePrice),
      salePrice: product.salePrice ? Number(product.salePrice) : null,
      images: product.images.map((img: any) => ({ ...img, id: Number(img.id), productId: Number(img.productId) })),
      attributes: product.attributes.map((attr: any) => ({ ...attr, id: Number(attr.id), productId: Number(attr.productId) }))
    };
  },

  async toggleProductStatus(id: number) {
    const product = await prisma.product.findUnique({ where: { id: BigInt(id) } });
    if (!product) {
      const error: any = new Error('Product not found');
      error.statusCode = 404;
      throw error;
    }

    const newStatus = product.status === 'active' ? 'inactive' : 'active';
    
    const updated = await prisma.product.update({
      where: { id: BigInt(id) },
      data: { status: newStatus }
    });

    return {
      ...updated,
      id: Number(updated.id),
      categoryId: updated.categoryId ? Number(updated.categoryId) : null,
      basePrice: Number(updated.basePrice),
      salePrice: updated.salePrice ? Number(updated.salePrice) : null
    };
  },

  async deleteProduct(id: number) {
    // Check if any order item uses this product
    const orderItemsCount = await prisma.orderItem.count({
      where: { productId: BigInt(id) }
    });

    if (orderItemsCount > 0) {
      const error: any = new Error('Cannot delete product because it is associated with existing orders');
      error.statusCode = 400;
      throw error;
    }

    await prisma.product.delete({
      where: { id: BigInt(id) }
    });

    return { success: true };
  }
};
