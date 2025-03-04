const validateData = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, {
            abortEarly: false, // Để không dừng khi gặp lỗi đầu tiên, kiểm tra tất cả các lỗi
            allowUnknown: true, // Cho phép các thuộc tính không có trong schema
        });

        if (error) {
            // Lọc ra các lỗi chi tiết và trả về thông báo lỗi đầy đủ
            const errorMessages = error.details.map((detail) => ({
                field: detail.context.key,
                message: detail.message,
            }));

            // Log lỗi để tiện theo dõi
            console.error('Validation errors:', errorMessages);

            // Trả về lỗi cho người dùng với mã lỗi 400
            return res.status(400).json({
                error: 'Validation failed',
                details: errorMessages,  // Trả về mảng chi tiết lỗi
            });
        }

        next();
    };
};

export default validateData;
