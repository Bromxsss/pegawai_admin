const express = require('express');
const router = express.Router();
const pegawaiController = require('../controllers/pegawai.controller');
const { verifyToken, isAdminPegawai } = require('../middlewares/auth');

// Routes untuk Admin (CRUD penuh)
router.post('/', verifyToken, isAdminPegawai, pegawaiController.createPegawai);
router.get('/', verifyToken, isAdminPegawai, pegawaiController.getAllPegawai);
router.get('/:id', verifyToken, isAdminPegawai, pegawaiController.getPegawaiById);
router.put('/:id', verifyToken, isAdminPegawai, pegawaiController.updatePegawai);
// Fix: Change this line to use a proper controller method
router.delete('/pegawai/:id', pegawaiController.deletePegawai);

// Routes untuk Pegawai (hanya update terbatas)
router.put('/profile/update/:id', verifyToken, pegawaiController.updateProfile);

module.exports = router;