const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const activityController = require('../controllers/activityController');

router.use(auth);
router.get('/', activityController.getActivities);
router.post('/', activityController.createActivity);

module.exports = router;