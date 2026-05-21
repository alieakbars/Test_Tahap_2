const jwt = require('jsonwebtoken');
const JWT_SECRET         = process.env.JWT_SECRET         || 'secret_key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh_secret_key';
const JWT_EXPIRES_IN     = process.env.JWT_EXPIRES_IN     || '1h';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

function generateTokens(user) {
  const payload = { user_id: user.user_id, phone_number: user.phone_number };

  const access_token = jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });

  const refresh_token = jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN,
  });

  return { access_token, refresh_token };
}

function verifyAccessToken(token) {
  return jwt.verify(token, JWT_SECRET);
}
function verifyRefreshToken(token) {
  return jwt.verify(token, JWT_REFRESH_SECRET);
}

module.exports = { generateTokens, verifyAccessToken, verifyRefreshToken };
