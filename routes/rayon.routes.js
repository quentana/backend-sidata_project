const express = require('express');
const router = express.Router();

const upload = require('../middlewares/upload');
const RayonContoller = require('../controllers/rayon.controller');
const roleMiddleware  = require('../middlewares/role');
const authMiddleware  = require('../middlewares/auth');

router.get('/',    RayonContoller.getRayon);
router.get('/:id', authMiddleware.checkToken, RayonContoller.showRayon);
router.post('/',   authMiddleware.checkToken, upload.none(), roleMiddleware.isSuperAdmin, RayonContoller.createRayon);
router.put('/:id', authMiddleware.checkToken, upload.none(), roleMiddleware.isSuperAdmin, RayonContoller.updateRayon);
router.delete('/:id', authMiddleware.checkToken, roleMiddleware.isSuperAdmin, RayonContoller.deleteRayon);

module.exports = router;
