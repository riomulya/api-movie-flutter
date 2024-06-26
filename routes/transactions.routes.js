const express = require('express');
const router = express.Router();
const TransactionController = require('../controllers/transaction.controllers.js');

router.post('/createTransaction', TransactionController.createTransaction);
router.post('/finishTransaction', TransactionController.finishTransaction);
router.post('/unfinishTransaction', TransactionController.unfinishTransaction);
router.post('/errorTransaction', TransactionController.errorTransaction);

module.exports = router;
