const { failResponse } = require('../utils/response.utils');

function errorHandler(err, req, res, next) {
  console.error('[Error]', err.message);

  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    const label = field === 'phone_number' ? 'Phone Number' : field;
    return failResponse(res, `${label} already registered`, 409);
  }

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return failResponse(res, messages.join(', '), 400);
  }

  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return failResponse(res, 'Unauthenticated', 401);
  }

  return failResponse(res, err.message || 'Internal server error', err.status || 500);
}

module.exports = { errorHandler };
