const express = require ('express');
const router = express.Router();

const upload          = require('../middlewares/upload');
const approvedController = require('../controllers/approve.controller')
const authMiddleware = require('../middlewares/auth')
const roleMiddleware = require('../middlewares/role')

router.get('/siswa/:siswa_id', authMiddleware.checkToken, approvedController.getStatusBySiswa);
router.get('/', authMiddleware.checkToken, roleMiddleware.isAdmin, approvedController.getAll);
router.put('/:id', authMiddleware.checkToken, upload.none(), roleMiddleware.isAdmin, approvedController.updateStatus);


module.exports = router;