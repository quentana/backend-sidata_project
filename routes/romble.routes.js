const express = require('express');
const router = express.Router();

const upload = require('../middlewares/upload');
const RombleContoller = require('../controllers/romble.controller');
const roleMiddleware  = require('../middlewares/role');
const authMiddleware  = require('../middlewares/auth');

router.get('/',    RombleContoller.getRomble);
router.get('/:id', authMiddleware.checkToken, RombleContoller.showRomble);
router.post('/',   authMiddleware.checkToken, upload.none(), roleMiddleware.isSuperAdmin, RombleContoller.createRomble);
router.put('/:id', authMiddleware.checkToken, upload.none(), roleMiddleware.isSuperAdmin, RombleContoller.updateRomble);
router.delete('/:id', authMiddleware.checkToken, roleMiddleware.isSuperAdmin, RombleContoller.deleteRomble);

module.exports = router;
