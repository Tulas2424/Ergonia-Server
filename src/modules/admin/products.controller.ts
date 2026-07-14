import { Request, Response, NextFunction } from 'express';
import { adminProductsService } from './products.service';

export const adminProductsController = {
  async getAllProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const { search, categoryId, status, page, limit } = req.query;
      const result = await adminProductsService.getAllProducts({
        search: search as string,
        categoryId: categoryId ? parseInt(categoryId as string) : undefined,
        status: status as string,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      });
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async createProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await adminProductsService.createProduct(req.body);
      res.status(201).json(result);
    } catch (error: any) {
      if (error.statusCode) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        next(error);
      }
    }
  },

  async updateProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string);
      const result = await adminProductsService.updateProduct(id, req.body);
      res.json(result);
    } catch (error: any) {
      if (error.statusCode) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        next(error);
      }
    }
  },

  async toggleProductStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string);
      const result = await adminProductsService.toggleProductStatus(id);
      res.json(result);
    } catch (error: any) {
      if (error.statusCode) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        next(error);
      }
    }
  },

  async deleteProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string);
      const result = await adminProductsService.deleteProduct(id);
      res.json(result);
    } catch (error: any) {
      if (error.statusCode) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        next(error);
      }
    }
  },

  async uploadImages(req: Request, res: Response, next: NextFunction) {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        res.status(400).json({ message: 'No files uploaded' });
        return;
      }

      const imageUrls = files.map(f => f.path);
      res.json({ urls: imageUrls });
    } catch (error) {
      next(error);
    }
  }
};
