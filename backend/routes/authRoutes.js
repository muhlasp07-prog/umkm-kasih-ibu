const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/login', authController.login);
const authMiddleware = require('../middleware/authMiddleware');
router.put('/change-password', authMiddleware, authController.changePassword);

module.exports = router;