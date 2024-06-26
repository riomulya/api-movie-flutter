const express = require('express');
const router = express.Router();
const TransactionController = require('../controllers/transaction.controllers.js');

router.post('/createTransaction', TransactionController.createTransaction);

module.exports = router;
