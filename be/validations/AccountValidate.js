import Joi from 'joi';

const accountValidate = {
  validateRegister: Joi.object({
    username: Joi.string().not(null).min(3).max(30).required(),  // Thêm giới hạn cho username
    name: Joi.string().not(null).min(2).max(50).required(),  // Thêm giới hạn cho tên
    email: Joi.string().email().not(null).required(),
    password: Joi.string()
      .min(8)
      .max(20)  // Giới hạn độ dài mật khẩu
      .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&]).+$"))  // Thêm yêu cầu ký tự đặc biệt
      .required(),
  }),

  validateAccount: Joi.object({
    username: Joi.string().not(null).min(3).max(30).required(),  // Thêm giới hạn cho username
    name: Joi.string().not(null).min(2).max(50).required(),  // Thêm giới hạn cho tên
    email: Joi.string().email().not(null).required(),
  }),

  validateNewPassword: Joi.object({
    id: Joi.string().not(null).required(),
    password: Joi.string()
      .min(8)
      .max(20)
      .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&]).+$"))
      .required(),
  }),

  validateProfile: Joi.object({
    name: Joi.string().allow("", null).min(2).max(50),
    phone: Joi.string().allow("", null).pattern(new RegExp("^(\\+84|0)[3-9][0-9]{8}$")),  // Kiểm tra điện thoại
    avatar: Joi.string().allow("", null).uri().max(2000),  // Giới hạn URL avatar
    payosClientId: Joi.string().allow("", null),
    payosAPIKey: Joi.string().allow("", null),
    payosCheckSum: Joi.string().allow("", null),
  }),

  validateChangePassword: Joi.object({
    oldPassword: Joi.string()
      .min(8)
      .max(20)
      .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&]).+$"))
      .required(),
    newPassword: Joi.string()
      .min(8)
      .max(20)
      .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&]).+$"))
      .required(),
  }),

  validateUploadImage: Joi.object({
    url: Joi.string().uri().required().max(2000),  // Giới hạn chiều dài URL
    description: Joi.string().allow("", null).max(500),  // Giới hạn chiều dài mô tả
  }),
};

export default accountValidate;
