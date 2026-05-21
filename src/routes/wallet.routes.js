const router = require('express').Router();
const { topUp, payment }       = require('../controllers/wallet.controller');
const { transfer }             = require('../controllers/transfer.controller');
const { authenticate }         = require('../middleware/auth.middleware');
const {
  topUpRules, paymentRules, transferRules, validate,
} = require('../middleware/validation.middleware');

router.post('/topup',    authenticate, topUpRules,    validate, topUp);
router.post('/pay',      authenticate, paymentRules,  validate, payment);
router.post('/transfer', authenticate, transferRules, validate, transfer);

module.exports = router;
