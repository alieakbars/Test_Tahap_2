const { getTransactions }      = require('../services/transaction.service');
const { successResponse }      = require('../utils/response.utils');

async function reportTransactions(req, res, next) {
  try {
    const result = await getTransactions(req.user.user_id);
    return successResponse(res, result);
  } catch (err) {
    next(err);
  }
}

module.exports = { reportTransactions };
