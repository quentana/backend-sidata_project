const express = require ('express');
const router = express.Router();

const upload = require('../middlewares/upload');
const KeluargaContoller = require('../controllers/keluarga.controller');
const authMiddleware = require('../middlewares/auth');

router.get('/:siswa_id',  authMiddleware.checkToken, KeluargaContoller.getBySiswa);
router.post('/',          authMiddleware.checkToken, upload.none(), KeluargaContoller.createKeluarga);
router.put('/:id',        authMiddleware.checkToken, upload.none(), KeluargaContoller.updateKeluarga);
router.delete('/:id',     authMiddleware.checkToken, KeluargaContoller.deleteKeluarga);

module.exports = router;
