const errorHandler = (err, req, res, next) => {
  console.error(err);

  if (err.name === 'MulterError') {
    return res.status(400).json({ success: false, error: err.message });
  }

  if (err.code === 'P2003' || err.code === 'P2014') {
    return res.status(400).json({
      success: false,
      error: 'Data masih terhubung ke fitur lain. Refresh halaman dan coba lagi.',
    });
  }

  const status = err.status || 500;
  const message = status === 500 && process.env.NODE_ENV === 'production'
    ? 'Internal server error'
    : (err.message || 'Internal server error');

  res.status(status).json({
    success: false,
    error: message,
  });
};

module.exports = errorHandler;
