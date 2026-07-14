import { Router } from 'express';
import { adminQuizController } from './quiz.controller';

const router = Router();

router.get('/options', adminQuizController.getAllOptions);
router.patch('/options/:id', adminQuizController.updateQuizOption);

router.get('/dialogues', adminQuizController.getAllDialogues);
router.patch('/dialogues/:id', adminQuizController.updateMascotDialogue);

export default router;
