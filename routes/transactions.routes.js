const express = require('express');
const router = express.Router();
const TransactionController = require('../controllers/transaction.controllers.js');

router.post('/createTransaction', TransactionController.createTransaction);
router.post('/insertTransaction', TransactionController.insertTransaction);
router.get('/finishTransaction', TransactionController.finishTransaction);
router.get('/unfinishTransaction', TransactionController.unfinishTransaction);
router.get('/errorTransaction', TransactionController.errorTransaction);
router.post('/orderStatus', TransactionController.getTransactionStatus);

module.exports = router;
