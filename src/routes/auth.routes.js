const router = require('express').Router();
const { register, login } = require('../controllers/auth.controller');
const { registerRules, loginRules, validate } = require('../middleware/validation.middleware');

router.post('/register', registerRules, validate, register);
router.post('/login',    loginRules,    validate, login);

module.exports = router;
