const catchAsyncErrors = (fn) => {
    return (req, res, next) => {
      Promise.resolve(fn(req, res, next)).catch((error) => {
        console.error(error); // Log the error
        next(error); // Call next with the error to pass it to error-handling middleware
      });
    };
  };
  
export default catchAsyncErrors;
  