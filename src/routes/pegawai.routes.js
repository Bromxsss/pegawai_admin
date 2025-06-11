// pegawai.routes.js
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import {
  getAllPegawai,
  createPegawai,
  getPegawaiById,
  updatePegawai,
  deletePegawai,
  // updateNonSensitiveData,
  getProfilePegawai,
  updateDataProfil,
  requestSensitiveDataChange,
  getAllDataChangeRequests,
  getDataChangeRequestById,
  processDataChangeRequest,
  upload
} from '../controllers/pegawai.controller.js';
import { verifyToken, isAdminPegawai, isPegawai, isOwner} from '../middlewares/auth.js';
// import upload from '../middleware/uploadMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = express.Router();




// Routes untuk Admin (CRUD penuh)
router.post('/', verifyToken, isAdminPegawai, upload.single('foto'), createPegawai);
router.get('/', verifyToken, isAdminPegawai, getAllPegawai);
router.get('/:id', verifyToken, isAdminPegawai, getPegawaiById);
router.put('/:id', verifyToken, isAdminPegawai, upload.single('foto'), updatePegawai);
router.delete('/:id', verifyToken, isAdminPegawai, deletePegawai);





// Routes untuk Pegawai (update data sensitif dan non-sensitif)
router.get('/profile/me', verifyToken, isPegawai, getProfilePegawai);
router.put('/profile/:id', verifyToken, isOwner, upload.single('foto'), updateDataProfil);
router.post('/profile/request-sensitive/:id', verifyToken, requestSensitiveDataChange);


// Routes untuk Admin (mengelola permintaan perubahan data)
router.get('/admin/change-requests', verifyToken, isAdminPegawai, getAllDataChangeRequests);
router.get('/admin/change-requests/:id', verifyToken, isAdminPegawai, getDataChangeRequestById);
router.put('/admin/change-requests/:id', verifyToken, isAdminPegawai, processDataChangeRequest);





// Endpoint untuk mendapatkan foto pegawai
// ... existing code ...
router.get('/foto-pegawai/:filename', verifyToken, isAdminPegawai, (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(__dirname, '../controllers/uploads', filename);
   // Sesuaikan jalur ke lokasi yang benar
  
  // Tambahkan log untuk memeriksa jalur file
  console.log('File path:', filePath);
  
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error('Error sending file:', err);
      res.status(404).json({ message: 'Foto tidak ditemukan' });
    }
  });
});




// Tambahkan rute untuk mengedit foto
// Rute untuk mengedit foto



// Rute untuk menghapus foto
router.delete('/foto-pegawai/:filename', verifyToken, isAdminPegawai, (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(__dirname, '../controllers/uploads', filename);
  // Logika untuk menghapus foto
  console.log('Menghapus file:', filePath);
  fs.unlink(filePath, (err) => {
    if (err) {
      console.error('Error deleting file:', err);
      return res.status(404).json({ message: 'Foto tidak ditemukan' });
    }
    res.status(200).json({ message: 'Foto berhasil dihapus' });
  });
});
// ... existing code ...


// ... existing code ...
// router.post('/upload', verifyToken, isAdminPegawai, upload.single('foto'), 
// async (req, res) => {
//   // Logika untuk mengunggah file
// });
export default router;