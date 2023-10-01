function handleError(res, status, message) {
  res.status(status).json({ status: `${status}`, message });
}

module.exports = { handleError };
