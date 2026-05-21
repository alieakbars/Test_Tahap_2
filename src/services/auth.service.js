const User              = require('../models/user.model');
const { generateTokens } = require('../utils/jwt.utils');

async function register({ first_name, last_name, phone_number, address, pin }) {
  const user = new User({ first_name, last_name, phone_number, address, pin });
  await user.save();

  return {
    user_id: user.user_id,
    first_name: user.first_name,
    last_name: user.last_name,
    phone_number: user.phone_number,
    address: user.address,
    created_date: user.created_date,
  };
}

async function login({ phone_number, pin }) {
  const user = await User.findOne({ phone_number }).select('+pin');
  if (!user) throw new Error('Phone number and pin doesn\'t match.');

  const match = await user.comparePin(pin);
  if (!match) throw new Error('Phone number and pin doesn\'t match.');

  return generateTokens(user);
}

module.exports = { register, login };
