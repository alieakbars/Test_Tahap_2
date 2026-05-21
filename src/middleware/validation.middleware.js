const { validationResult, body } = require('express-validator');
const { failResponse } = require('../utils/response.utils');

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map((e) => e.msg);
    return failResponse(res, messages.join(', '), 400);
  }
  next();
}

const registerRules = [
  body('first_name').notEmpty().withMessage('first_name is required'),
  body('last_name').notEmpty().withMessage('last_name is required'),
  body('phone_number')
    .notEmpty().withMessage('phone_number is required')
    .isMobilePhone().withMessage('phone_number is invalid'),
  body('address').notEmpty().withMessage('address is required'),
  body('pin')
    .notEmpty().withMessage('pin is required')
    .isLength({ min: 6, max: 6 }).withMessage('pin must be exactly 6 digits')
    .isNumeric().withMessage('pin must be numeric'),
];

const loginRules = [
  body('phone_number').notEmpty().withMessage('phone_number is required'),
  body('pin').notEmpty().withMessage('pin is required'),
];

const topUpRules = [
  body('amount')
    .notEmpty().withMessage('amount is required')
    .isInt({ min: 1 }).withMessage('amount must be a positive integer'),
];

const paymentRules = [
  body('amount')
    .notEmpty().withMessage('amount is required')
    .isInt({ min: 1 }).withMessage('amount must be a positive integer'),
  body('remarks').optional().isString(),
];

const transferRules = [
  body('target_user').notEmpty().withMessage('target_user is required'),
  body('amount')
    .notEmpty().withMessage('amount is required')
    .isInt({ min: 1 }).withMessage('amount must be a positive integer'),
  body('remarks').optional().isString(),
];

const updateProfileRules = [
  body('first_name').optional().notEmpty().withMessage('first_name cannot be empty'),
  body('last_name').optional().notEmpty().withMessage('last_name cannot be empty'),
  body('address').optional().notEmpty().withMessage('address cannot be empty'),
];

module.exports = {
  validate,
  registerRules,
  loginRules,
  topUpRules,
  paymentRules,
  transferRules,
  updateProfileRules,
};
