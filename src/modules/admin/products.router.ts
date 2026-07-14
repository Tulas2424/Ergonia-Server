import { Router } from 'express';
import { adminProductsController } from './products.controller';
import { upload } from '../../utils/cloudinary';

const router = Router();

router.get('/', adminProductsController.getAllProducts);
router.post('/', adminProductsController.createProduct);
router.patch('/:id', adminProductsController.updateProduct);
router.patch('/:id/toggle-status', adminProductsController.toggleProductStatus);
router.delete('/:id', adminProductsController.deleteProduct);

// Upload endpoint
router.post('/upload', upload.array('images', 10), adminProductsController.uploadImages);

export default router;
