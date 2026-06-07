const errorHandler = (err, req, res, next) => {
  console.error(err);

  if (err.name === 'MulterError') {
    return res.status(400).json({ success: false, error: err.message });
  }

  const status = err.status || 500;
  res.status(status).json({
    success: false,
    error: err.message || 'Internal server error',
  });
};

module.exports = errorHandler;
