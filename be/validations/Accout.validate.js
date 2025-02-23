const Joi = require("joi");

const accountValidate = {
  validateRegister: Joi.object({
    username: Joi.string().not(null).only().required(),
    name: Joi.string().not(null).only().required(),
    email: Joi.string().email().not(null).only().required(),
    password: Joi.string()
      .min(8)
      .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$"))
      .required(),
  }),
  validateNewPassword: Joi.object({
    id: Joi.string().not(null).only().required(),
    password: Joi.string()
      .min(8)
      .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$"))
      .required(),
  }),
  validateProfile: Joi.object({
    name: Joi.string().allow("", null),
    phone: Joi.string().allow("", null).pattern(new RegExp("^[0-9]{10}$")),
    avatar: Joi.string().allow("", null).uri(),
    payosClientId: Joi.string().allow("", null),
    payosAPIKey: Joi.string().allow("", null),
    payosCheckSum: Joi.string().allow("", null),
  }),
  validateChangePassword: Joi.object({
    oldPassword: Joi.string()
      .min(8)
      .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$"))
      .required(),
    newPassword: Joi.string()
      .min(8)
      .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$"))
      .required(),
  }),
  validateUploadImage: Joi.object({
    url: Joi.string().uri().required(),
    description: Joi.string().allow("", null),
  }),
};

module.exports = accountValidate;
