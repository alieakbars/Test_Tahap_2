const { initiateTransfer }     = require('../services/transfer.service');
const { successResponse, failResponse } = require('../utils/response.utils');

async function transfer(req, res, next) {
  try {
    const { target_user, amount, remarks } = req.body;

    if (target_user === req.user.user_id) {
      return failResponse(res, 'Cannot transfer to yourself', 400);
    }

    const result = await initiateTransfer(
      req.user,
      target_user,
      Number(amount),
      remarks
    );
    return successResponse(res, result);
  } catch (err) {
    if (err.message === 'Balance is not enough') {
      return failResponse(res, err.message, 400);
    }
    if (err.message === 'Target user not found') {
      return failResponse(res, err.message, 404);
    }
    next(err);
  }
}

module.exports = { transfer };
