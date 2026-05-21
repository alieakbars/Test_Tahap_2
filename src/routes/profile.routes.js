const router = require('express').Router();
const { update }              = require('../controllers/profile.controller');
const { authenticate }        = require('../middleware/auth.middleware');
const { updateProfileRules, validate } = require('../middleware/validation.middleware');

router.put('/profile', authenticate, updateProfileRules, validate, update);

module.exports = router;
