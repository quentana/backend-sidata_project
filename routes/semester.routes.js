const express = require('express');
const router  = express.Router();

const upload = require('../middlewares/upload');
const SemesterController = require('../controllers/semester.controller');
const authMiddleware     = require('../middlewares/auth');
const roleMiddleware     = require('../middlewares/role');

router.get('/',       authMiddleware.checkToken, SemesterController.getAll);
router.get('/:id',    authMiddleware.checkToken, SemesterController.getOne);
router.post('/',      authMiddleware.checkToken, upload.none(), roleMiddleware.isSuperAdmin, SemesterController.create);
router.put('/:id',    authMiddleware.checkToken, upload.none(),roleMiddleware.isSuperAdmin, SemesterController.update);
router.delete('/:id', authMiddleware.checkToken, roleMiddleware.isSuperAdmin, SemesterController.destroy);

module.exports = router;
