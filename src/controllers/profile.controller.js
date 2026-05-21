const { updateProfile }        = require('../services/profile.service');
const { successResponse }      = require('../utils/response.utils');

async function update(req, res, next) {
  try {
    const { first_name, last_name, address } = req.body;
    const result = await updateProfile(req.user.user_id, { first_name, last_name, address });
    return successResponse(res, result);
  } catch (err) {
    next(err);
  }
}

module.exports = { update };
