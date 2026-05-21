function successResponse(res, result, statusCode = 200) {
  return res.status(statusCode).json({ status: 'SUCCESS', result });
}

function failResponse(res, message, statusCode = 400) {
  return res.status(statusCode).json({ message });
}

module.exports = { successResponse, failResponse };
