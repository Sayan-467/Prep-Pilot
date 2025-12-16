const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const sheetController = require('../controllers/sheetController');

router.use(auth);

router.get('/', sheetController.getSheets);
router.post('/', sheetController.createSheet);
router.get('/:id', sheetController.getSheet);
router.put('/:id', sheetController.updateSheet);
router.delete('/:id', sheetController.deleteSheet);
router.get('/:id/export', sheetController.exportSheetCsv);

module.exports = router;
