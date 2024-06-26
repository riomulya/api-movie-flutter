const express = require('express');
const router = express.Router();
const TansactionController = require('../controllers/transaction.controllers.js');

router.post('/createTransaction', TansactionController.createTransaction);

module.exports = router;
