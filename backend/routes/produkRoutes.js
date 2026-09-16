const express = require('express');
const router = express.Router();
const produkController = require('../controllers/produkController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.get('/', produkController.getAllProduk);
router.get('/:id', produkController.getProdukById);
router.post('/', authMiddleware, produkController.createProduk);
router.put('/:id', authMiddleware, produkController.updateProduk);
router.put('/:id/publish', authMiddleware, roleMiddleware(['owner']), produkController.publishProduk);
router.put('/:id/unpublish', authMiddleware, roleMiddleware(['owner']), produkController.unpublishProduk);
router.delete('/:id', authMiddleware, produkController.deleteProduk);

module.exports = router;