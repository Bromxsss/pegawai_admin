const express = require('express');
const router = express.Router();
const pegawaiController = require('../controllers/pegawai.controller');
const { verifyToken, isAdminPegawai } = require('../middlewares/auth');

// Routes untuk Admin (CRUD penuh)
router.post('/', verifyToken, isAdminPegawai, pegawaiController.createPegawai);
router.get('/', verifyToken, isAdminPegawai, pegawaiController.getAllPegawai);
router.get('/:id', verifyToken, isAdminPegawai, pegawaiController.getPegawaiById);
router.put('/:id', verifyToken, isAdminPegawai, pegawaiController.updatePegawai);
router.delete('/:id', verifyToken, isAdminPegawai, pegawaiController.deletePegawai);


// // Routes untuk Pegawai (hanya update terbatas)
// router.put('/profile/update/:id', verifyToken, pegawaiController.updateProfile);

// Routes untuk Pegawai (update data sensitif dan non-sensitif)
router.put('/profile/non-sensitive/:id', verifyToken, pegawaiController.updateNonSensitiveData);
router.post('/profile/request-sensitive/:id', verifyToken, pegawaiController.requestSensitiveDataChange);

// Routes untuk Admin (mengelola permintaan perubahan data)
router.get('/admin/change-requests', verifyToken, isAdminPegawai, pegawaiController.getAllDataChangeRequests);
router.get('/admin/change-requests/:id', verifyToken, isAdminPegawai, pegawaiController.getDataChangeRequestById);
router.put('/admin/change-requests/:id', verifyToken, isAdminPegawai, pegawaiController.processDataChangeRequest);

module.exports = router;