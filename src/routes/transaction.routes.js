const router = require('express').Router();
const { reportTransactions } = require('../controllers/transaction.controller');
const { authenticate }       = require('../middleware/auth.middleware');

router.get('/transactions', authenticate, reportTransactions);

module.exports = router;
