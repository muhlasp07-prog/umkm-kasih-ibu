const express = require('express');
const router = express.Router();
const kegiatanController = require('../controllers/kegiatanController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.get('/', kegiatanController.getAllKegiatan);
router.get('/draft/list', authMiddleware, kegiatanController.getMyDrafts);
router.get('/:id', kegiatanController.getKegiatanById);
router.post('/', authMiddleware, kegiatanController.createKegiatan);
router.put('/:id', authMiddleware, kegiatanController.updateKegiatan);
router.put('/:id/publish', authMiddleware, roleMiddleware(['superadmin']), kegiatanController.publishKegiatan);
router.put('/:id/unpublish', authMiddleware, roleMiddleware(['superadmin']), kegiatanController.unpublishKegiatan);
router.delete('/:id', authMiddleware, kegiatanController.deleteKegiatan);

module.exports = router;