const express = require('express');
const router  = express.Router();

const dokumenController = require('../controllers/dokumen.controller');
const upload            = require('../middlewares/upload');
const authMiddleware    = require('../middlewares/auth');

router.get('/:siswa_id', authMiddleware.checkToken, dokumenController.getDokumenBySiswa);
router.post('/',         authMiddleware.checkToken, upload.single('file'), dokumenController.uploadDokumen);
router.delete('/:id',    authMiddleware.checkToken, dokumenController.deleteDokumen);

module.exports = router;
