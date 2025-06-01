// routes/pegawai.routes.js
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  updatePegawai
} from '../controllers/pegawaiBiasaController.js';
import { verifyToken, isPegawai } from '../middlewares/auth.js';
import upload from '../middlewares/uploadMiddleware.js'; // ✅ Import benar

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = express.Router();

// ✅ Rute update pegawai dengan upload foto
router.put('/me', verifyToken, isPegawai, upload.single('foto'), updatePegawai);

export default router;