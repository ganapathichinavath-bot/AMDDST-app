import { Router } from 'express';
import { handlePredict } from '../controllers/dstController.js';

const router = Router();

router.post('/predict', handlePredict);

export default router;
