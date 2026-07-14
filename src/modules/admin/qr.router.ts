import { Router } from 'express';
import { adminQrController } from './qr.controller';

const router = Router();

router.get('/', adminQrController.getAllQrCodes);
router.post('/', adminQrController.createQrCode);
router.get('/:id/stats', adminQrController.getQrScanStats);
router.patch('/:id/deactivate', adminQrController.deactivateQrCode);

export default router;
