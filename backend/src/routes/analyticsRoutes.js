const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const analyticsController = require('../controllers/analyticsController');

router.use(auth);

router.get('/summary', analyticsController.summary);
router.get('/recommendation', analyticsController.recommendation);

module.exports = router;
