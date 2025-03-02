const catchAsyncErrors = (fn) => {
    return (req, res, next) => {
<<<<<<< HEAD
      Promise.resolve(fn(req, res, next)).catch((error) => {
        console.error(error); // Log the error
        next(error); // Call next with the error to pass it to error-handling middleware
      });
    };
  };
  
export default catchAsyncErrors;
  
=======
        Promise.resolve(fn(req, res, next)).catch((error) => {
            console.error(error); // Ghi log lỗi
            next(error); // Gọi next với lỗi để chuyển đến middleware xử lý lỗi
        });
    };
  };
  
  module.exports = catchAsyncErrors;
>>>>>>> f330ac951d8a4f6868ad9765a8766b9c57206310
