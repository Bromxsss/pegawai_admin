// pegawai.routes.js

import express from 'express';
import {
  getAllPegawai,
  createPegawai,
  getPegawaiById,
  updatePegawai,
  deletePegawai,
  updateNonSensitiveData,
  requestSensitiveDataChange,
  getAllDataChangeRequests,
  getDataChangeRequestById,
  processDataChangeRequest,
  upload
} from '../controllers/pegawai.controller.js';
import { verifyToken, isAdminPegawai } from '../middlewares/auth.js';
// import upload from '../middleware/uploadMiddleware.js';


const router = express.Router();

// Routes untuk Admin (CRUD penuh)
router.post('/', verifyToken, isAdminPegawai, upload.single('foto'), createPegawai);
router.get('/', verifyToken, isAdminPegawai, getAllPegawai);
router.get('/:id', verifyToken, isAdminPegawai, getPegawaiById);
router.put('/:id', verifyToken, isAdminPegawai, updatePegawai);
router.delete('/:id', verifyToken, isAdminPegawai, deletePegawai);

// Routes untuk Pegawai (update data sensitif dan non-sensitif)
router.put('/profile/non-sensitive/:id', verifyToken, updateNonSensitiveData);
router.post('/profile/request-sensitive/:id', verifyToken, requestSensitiveDataChange);

// Routes untuk Admin (mengelola permintaan perubahan data)
router.get('/admin/change-requests', verifyToken, isAdminPegawai, getAllDataChangeRequests);
router.get('/admin/change-requests/:id', verifyToken, isAdminPegawai, getDataChangeRequestById);
router.put('/admin/change-requests/:id', verifyToken, isAdminPegawai, processDataChangeRequest);

// ... existing code ...
// router.post('/upload', verifyToken, isAdminPegawai, upload.single('foto'), 
// async (req, res) => {
//   // Logika untuk mengunggah file
// });
export default router;