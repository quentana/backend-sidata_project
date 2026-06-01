const express = require('express');
const router = express.Router();

const upload = require('../middlewares/upload');
const JurusanContoller = require('../controllers/jurusan.controller');
const authMiddleware   = require('../middlewares/auth');
const roleMiddleware   = require('../middlewares/role');


router.get('/', authMiddleware.checkToken, JurusanContoller.getJurusan);
router.post('/',   authMiddleware.checkToken, upload.none(), roleMiddleware.isSuperAdmin, JurusanContoller.createJurusan);
router.put('/:id', authMiddleware.checkToken, upload.none(), roleMiddleware.isSuperAdmin, JurusanContoller.updateJurusan);
router.delete('/:id', authMiddleware.checkToken, roleMiddleware.isSuperAdmin, JurusanContoller.deleteJurusan);

module.exports = router;
