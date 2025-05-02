const express = require('express');
const router = express.Router();
const aktivitasController = require('../controllers/aktivitasController');

router.get('/', aktivitasController.getAllAktivitas);
router.post('/', aktivitasController.createAktivitas);

module.exports = router;
