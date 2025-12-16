const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const goalController = require('../controllers/goalController');

router.use(auth);

router.get('/', goalController.getGoals);
router.post('/', goalController.createGoal);
router.put('/:id', goalController.updateGoal);
router.delete('/:id', goalController.deleteGoal);
router.patch('/:id/check', goalController.toggleGoalCheck);

module.exports = router;
