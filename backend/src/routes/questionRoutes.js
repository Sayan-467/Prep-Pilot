const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const qc = require('../controllers/questionController');
const validate = require('../middlewares/validate');
const { createQuestionValidator, queryQuestionValidator } = require('../validators/questionValidator');

router.use(auth);

router.post('/', createQuestionValidator, validate, qc.createQuestion);
router.get('/', queryQuestionValidator, validate, qc.getQuestions);
router.get('/:id', qc.getQuestion);
router.put('/:id', qc.updateQuestion);
router.delete('/:id', qc.deleteQuestion);

module.exports = router;
