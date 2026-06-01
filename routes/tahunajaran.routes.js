const express = require('express');
const router  = express.Router();

const upload = require('../middlewares/upload');
const TahunAjaranController = require('../controllers/tahunajaran.controller');
const authMiddleware        = require('../middlewares/auth');
const roleMiddleware        = require('../middlewares/role');

router.get('/',       authMiddleware.checkToken, TahunAjaranController.getAll);
router.get('/:id',    authMiddleware.checkToken, TahunAjaranController.getOne);
router.post('/',      authMiddleware.checkToken, upload.none(),roleMiddleware.isSuperAdmin, TahunAjaranController.create);
router.put('/:id',    authMiddleware.checkToken, upload.none(),roleMiddleware.isSuperAdmin, TahunAjaranController.update);
router.delete('/:id', authMiddleware.checkToken, roleMiddleware.isSuperAdmin, TahunAjaranController.destroy);

module.exports = router;
