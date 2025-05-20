import express from 'express';
import absenController from '../controllers/absenController.js';

const router = express.Router();

// ... existing code ...

router.get('/', absenController.getAllAbsen);
router.post('/', absenController.createAbsen);

export default router;