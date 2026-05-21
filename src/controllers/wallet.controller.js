const walletService            = require('../services/wallet.service');
const { successResponse, failResponse } = require('../utils/response.utils');

async function topUp(req, res, next) {
  try {
    const { amount } = req.body;
    const result = await walletService.topUp(req.user, Number(amount));
    return successResponse(res, result);
  } catch (err) {
    next(err);
  }
}

async function payment(req, res, next) {
  try {
    const { amount, remarks } = req.body;
    const result = await walletService.payment(req.user, Number(amount), remarks);
    return successResponse(res, result);
  } catch (err) {
    if (err.message === 'Balance is not enough') {
      return failResponse(res, err.message, 400);
    }
    next(err);
  }
}

module.exports = { topUp, payment };
