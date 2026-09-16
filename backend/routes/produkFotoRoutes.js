const express = require('express');
const router = express.Router();
const produkFotoController = require('../controllers/produkFotoController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/:produkId', produkFotoController.getFotoByProduk);
router.post('/:produkId', authMiddleware, upload.single('foto'), produkFotoController.uploadFoto);
router.delete('/:id', authMiddleware, produkFotoController.deleteFoto);

module.exports = router;