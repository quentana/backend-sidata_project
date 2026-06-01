const express = require ('express');
const router = express.Router();

const upload = require('../middlewares/upload')
const authController = require ('../controllers/auth.controller')
const authMiddleware = require('../middlewares/auth')
const roleMiddleware = require('../middlewares/role')


router.post('/login', upload.none(), authController.login);
router.get('/profile', authMiddleware.checkToken,  authController.profile);
router.post('/create-user', authMiddleware.checkToken, roleMiddleware.isSuperAdmin, upload.none(), authController.createUser);
router.get('/users',        authMiddleware.checkToken, roleMiddleware.isSuperAdmin, authController.getAllUsers);
router.put('/users/:id',    authMiddleware.checkToken, roleMiddleware.isSuperAdmin, upload.none(), authController.updateUser);
router.delete('/users/:id', authMiddleware.checkToken, roleMiddleware.isSuperAdmin, authController.deleteUser);

module.exports = router;
