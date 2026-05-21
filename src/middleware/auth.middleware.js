const { verifyAccessToken } = require('../utils/jwt.utils');
const { failResponse }      = require('../utils/response.utils');
const User                  = require('../models/user.model');

async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return failResponse(res, 'Unauthenticated', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);

    const user = await User.findOne({ user_id: decoded.user_id });
    if (!user) return failResponse(res, 'Unauthenticated', 401);

    req.user = user;
    next();
  } catch (err) {
    return failResponse(res, 'Unauthenticated', 401);
  }
}

module.exports = { authenticate };
