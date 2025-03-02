class ErrorHandler extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
    }
}

<<<<<<< HEAD
export const errorMiddleware = (err, req, res, next) => {
    err.message = err.message || "Internal Server Error";
    err.statusCode = err.statusCode || 500;

    // Handle specific errors
=======
const errorMiddleware = (err, req, res, next) => {
    err.message = err.message || "Internal Server Error";
    err.statusCode = err.statusCode || 500;

    // Xử lý các lỗi cụ thể
>>>>>>> f330ac951d8a4f6868ad9765a8766b9c57206310
    if (err.code === 11000) {
        const message = `Duplicate ${Object.keys(err.keyValue)} Entered`;
        err = new ErrorHandler(message, 400);
    }
    if (err.name === "JsonWebTokenError") {
        const message = `Json Web Token is invalid, Try again!`;
        err = new ErrorHandler(message, 400);
    }
    if (err.name === "TokenExpiredError") {
        const message = `Json Web Token is expired, Try again!`;
        err = new ErrorHandler(message, 400);
    }
    if (err.name === "CastError") {
        const message = `Invalid ${err.path}`;
        err = new ErrorHandler(message, 400);
    }

    const errorMessage = err.errors
        ? Object.values(err.errors)
            .map((error) => error.message)
            .join(" ")
        : err.message;

<<<<<<< HEAD
    // Check if headers have been sent
=======
    // Kiểm tra nếu headers đã được gửi
>>>>>>> f330ac951d8a4f6868ad9765a8766b9c57206310
    if (!res.headersSent) {
        return res.status(err.statusCode).json({
            success: false,
            message: errorMessage,
        });
    }
};
<<<<<<< HEAD

export default ErrorHandler;
=======
module.exports.errorMiddleware = errorMiddleware;
>>>>>>> f330ac951d8a4f6868ad9765a8766b9c57206310
