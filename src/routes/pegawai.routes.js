const express = require('express');
const router = express.Router();
const pegawaiController = require('../controllers/pegawai.controller');
const auth = require('../middlewares/auth');

// Routes untuk Admin (CRUD penuh)
router.post('/', auth('admin'), pegawaiController.create);
router.get('/', auth('admin'), pegawaiController.getAll);
router.get('/:id', auth('admin'), pegawaiController.getById);
router.put('/:id', auth('admin'), pegawaiController.update);
router.delete('/:id', auth('admin'), pegawaiController.delete);

// Routes untuk Pegawai (hanya update terbatas)
router.put('/profile/update', auth('pegawai'), pegawaiController.updateProfile);


module.exports = router;