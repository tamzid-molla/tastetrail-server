
class ErrorHandler extends Error {
  statusCode
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

export const errorHandlerMiddleware = (error, req, res, next) => {
  error.message = error.message || "Internal Server Error";
  error.statusCode = error.statusCode || 500;

  if (error.code === 11000) {
    const message = `Duplicate ${Object.keys(error.keyValue)} entered`;
    error = new ErrorHandler(message, 400);
  }
  if (error.name === "JsonWebTokenError") {
    const message = `Invalid JWT token`;
    error = new ErrorHandler(message, 400);
  }
  if (error.name === "TokenExpiredError") {
    const message = `JWT token expired`;
    error = new ErrorHandler(message, 400);
  }
  if (error.name === "CastError") {
    const message = `Invalid ${error.path}: ${error.value}.`;
    error = new ErrorHandler(message, 400);
  }
  const errorMessage = error.errors
    ? Object.values(error.errors)[0].message
        : error.message;
    
    return res.status(error.statusCode).json({
      success: false,
      message: errorMessage,
    });
};

export default ErrorHandler;