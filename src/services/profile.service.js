const User = require('../models/user.model');

async function updateProfile(userId, { first_name, last_name, address }) {
  const updates = {};
  if (first_name !== undefined) updates.first_name = first_name;
  if (last_name  !== undefined) updates.last_name  = last_name;
  if (address    !== undefined) updates.address    = address;

  if (Object.keys(updates).length === 0) {
    throw Object.assign(new Error('No valid fields to update'), { status: 400 });
  }

  const user = await User.findOneAndUpdate(
    { user_id: userId },
    { $set: updates },
    { new: true, runValidators: true }
  );

  if (!user) throw Object.assign(new Error('User not found'), { status: 404 });

  return {
    user_id: user.user_id,
    first_name: user.first_name,
    last_name: user.last_name,
    address: user.address,
    updated_date: user.updated_date,
  };
}

module.exports = { updateProfile };
