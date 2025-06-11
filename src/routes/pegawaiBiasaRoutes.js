// // routes/pegawai.routes.js
// import express from 'express';
// import path from 'path';
// import { fileURLToPath } from 'url';
// import {
//   getProfilePegawai,
//   updateDataProfil,
//   requestSensitiveDataChange
// } from '../controllers/pegawaiBiasaController.js';
// import { verifyToken, isPegawai, isOwner } from '../middlewares/auth.js';
// import upload from '../middlewares/uploadMiddleware.js'; // ✅ Import benar

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
// const router = express.Router();

// // ✅ Rute update pegawai dengan upload foto
// // Routes untuk Pegawai (update data sensitif dan non-sensitif)
// router.get('/profile/me', verifyToken, isPegawai, getProfilePegawai);
// router.put('/profile/:id', verifyToken, isOwner, upload.single('foto'), updateDataProfil);

// // Rute untuk request perubahan data sensitif
// router.post('/profile/request-sensitive/:id', verifyToken, isOwner, requestSensitiveDataChange);


// // untuk menampilkan foto
// router.get('/foto/:filename', verifyToken, isPegawai, (req, res) => {
//   const { filename } = req.params;
//   const filePath = path.join(__dirname, '../controllers/uploads', filename);
//    // Sesuaikan jalur ke lokasi yang benar
  
//   // Tambahkan log untuk memeriksa jalur file
//   console.log('File path:', filePath);
  
//   res.sendFile(filePath, (err) => {
//     if (err) {
//       console.error('Error sending file:', err);
//       res.status(404).json({ message: 'Foto tidak ditemukan' });
//     }
//   });
// });



// router.post('/profile/request-sensitive/:id', verifyToken, requestSensitiveDataChange);


// export default router;