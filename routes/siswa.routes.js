const express = require('express');
const router  = express.Router();

const upload          = require('../middlewares/upload');
const siswaController = require('../controllers/siswa.controller');
const authMiddleware  = require('../middlewares/auth');
const roleMiddleware  = require('../middlewares/role');

//exportt semua — harus sebelum /:id agar tidak bentrok
router.get('/export/excel', authMiddleware.checkToken, roleMiddleware.isAdminOrSuperAdmin, siswaController.exportExcel);
router.get('/export/pdf',   authMiddleware.checkToken, roleMiddleware.isAdminOrSuperAdmin, siswaController.exportPDF);
//exportper siswa — semua role yang login
router.get('/:id/export/excel', authMiddleware.checkToken, siswaController.exportExcelSingle);
router.get('/:id/export/pdf',   authMiddleware.checkToken, siswaController.exportPDFSingle);
router.get('/',     authMiddleware.checkToken, siswaController.getAll);
router.get('/:id',  authMiddleware.checkToken, siswaController.getOne);
router.post('/',    authMiddleware.checkToken, upload.single('foto'), siswaController.create);
router.put('/:id',  authMiddleware.checkToken, upload.single('foto'), siswaController.update);
router.delete('/:id', authMiddleware.checkToken, roleMiddleware.isAdminOrSuperAdmin, siswaController.destroy);

module.exports = router;
