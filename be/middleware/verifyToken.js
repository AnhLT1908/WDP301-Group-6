import jwt from 'jsonwebtoken';
import catchAsyncErrors from './asyncErrorCatch.js';
import ErrorHandler from './ErrorHandler.js';
import Account from '../model/Account.js';

// Lấy thông tin account từ token
const getAccountFromToken = async (token, next) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        if (!token) {
            return res.status(401).json({ message: "Bạn chưa đăng nhập!" });
        }
        const account = await Account.findById(decoded.id);
        
        return account;
    } catch (error) {
        return next(new ErrorHandler('Token không hợp lệ hoặc đã hết hạn!', 401));
    }
};

// Middleware bảo vệ route
export const protect = catchAsyncErrors(async (req, res, next) => {
    let token = req.cookies.userToken || 
                (req.headers.authorization && req.headers.authorization.startsWith('Bearer') 
                 ? req.headers.authorization.split(' ')[1] : null);

    if (!token) {
        return next(new ErrorHandler('Bạn chưa đăng nhập!', 401));
    }

    // Giải mã token
    
    req.user = await getAccountFromToken(token, next);
    if (!req.user) {
        return next(new ErrorHandler('Không tìm thấy người dùng với token này!', 404));
    }

    next();
});

// Middleware kiểm tra quyền
export const isAuthorized = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.accountType)) {
            return next(new ErrorHandler(`${req.user.accountType} không có quyền truy cập vào hệ thống này!`, 403));
        }
        next();
    };
};

export default protect;
