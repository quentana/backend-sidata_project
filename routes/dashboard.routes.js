const express = require('express')
const router = express.Router();

const dashboardContoller = require('../controllers/dashboard.controller')
const authMiddleware = require('../middlewares/auth')

router.get('/stats', authMiddleware.checkToken, dashboardContoller.getStats)

module.exports = router;