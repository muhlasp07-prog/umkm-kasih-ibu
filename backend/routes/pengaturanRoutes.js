const express = require('express');
const router = express.Router();
const pengaturanController = require('../controllers/pengaturanController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', pengaturanController.getPengaturan);
const roleMiddleware = require('../middleware/roleMiddleware');
router.put('/', authMiddleware, roleMiddleware(['owner']), pengaturanController.updatePengaturan);

module.exports = router;