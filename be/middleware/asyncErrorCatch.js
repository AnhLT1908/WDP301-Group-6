const catchAsyncErrors = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch((error) => {
            console.error(error); // Ghi log lỗi
            next(error); // Gọi next với lỗi để chuyển đến middleware xử lý lỗi
        });
    };
  };
  
  module.exports = catchAsyncErrors;