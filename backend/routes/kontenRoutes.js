const express = require('express');
const router = express.Router();
const kontenController = require('../controllers/kontenController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/semua/dokumentasi', kontenController.getAllFoto);
router.get('/:kegiatanId', kontenController.getFotoByKegiatan);
router.post('/:kegiatanId', authMiddleware, upload.single('foto'), kontenController.uploadFoto);
router.delete('/:id', authMiddleware, kontenController.deleteFoto);

module.exports = router;