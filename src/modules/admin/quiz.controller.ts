import { Request, Response, NextFunction } from 'express';
import { adminQuizService } from './quiz.service';

export const adminQuizController = {
  async getAllOptions(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await adminQuizService.getAllOptions();
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async updateQuizOption(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string);
      const result = await adminQuizService.updateQuizOption(id, req.body);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async getAllDialogues(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await adminQuizService.getAllDialogues();
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async updateMascotDialogue(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string);
      const result = await adminQuizService.updateMascotDialogue(id, req.body);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
};
