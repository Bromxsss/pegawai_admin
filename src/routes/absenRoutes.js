const express = require('express');
const router = express.Router();
const absenController = require('../controllers/absenController');


router.get('/', absenController.getAllAbsen);
router.post('/', absenController.createAbsen);

module.exports = router;
