import { Request, Response, NextFunction } from 'express';
import { adminQrService } from './qr.service';

export const adminQrController = {
  async getAllQrCodes(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await adminQrService.getAllQrCodes(page, limit);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async createQrCode(req: Request, res: Response, next: NextFunction) {
    try {
      const { productId, batchName } = req.body;
      if (!batchName) {
        res.status(400).json({ message: 'Batch name is required' });
        return;
      }

      const result = await adminQrService.createQrCode({ productId, batchName });
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },

  async getQrScanStats(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string);
      const days = parseInt(req.query.days as string) || 7;

      const result = await adminQrService.getQrScanStats(id, days);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async deactivateQrCode(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string);
      const result = await adminQrService.deactivateQrCode(id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
};
