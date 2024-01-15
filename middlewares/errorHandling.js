const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: 'Resource not found',
    data: null,
  });
};

const serverError = (err, req, res, next) => {
  if (err.isJoi) {
    return res.status(400).json({
      status: false,
      message: "Bad Request!",
      error: err.message,
      data: null,
    });
  }

  if (err) {
    console.log(err);
    res.status(500).json({
      status: false,
      message: "Bad Request!",
      error: err.message,
      data: null,
    });
  }
};

module.exports = {
  notFound,
  serverError,
};
