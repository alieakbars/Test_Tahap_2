const authService              = require('../services/auth.service');
const { successResponse, failResponse } = require('../utils/response.utils');

async function register(req, res, next) {
  try {
    const result = await authService.register(req.body);
    return successResponse(res, result, 201);
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { phone_number, pin } = req.body;
    const result = await authService.login({ phone_number, pin });
    return successResponse(res, result);
  } catch (err) {
    if (err.message.includes("doesn't match")) {
      return failResponse(res, err.message, 401);
    }
    next(err);
  }
}

module.exports = { register, login };
