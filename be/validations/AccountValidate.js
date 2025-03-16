import Joi from "joi";

const accountValidate = {
  validateRegister: Joi.object({
    username: Joi.string().not(null).min(3).max(30).required(),
    name: Joi.string().not(null).min(2).max(50).required(),
    username: Joi.string().not(null).min(3).max(30).required(),
    name: Joi.string().not(null).min(2).max(50).required(),
    email: Joi.string().email().not(null).required(),
    password: Joi.string()
      .min(8)
      .max(20)
      .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^\\w\\s]).+$"))
      .max(20)
      .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^\\w\\s]).+$"))
      .required(),
  }),

  validateAccount: Joi.object({
    firstName: Joi.string().not(null).min(2).max(50).required(),
    lastName: Joi.string().not(null).min(2).max(50).required(),
    firstName: Joi.string().not(null).min(2).max(50).required(),
    lastName: Joi.string().not(null).min(2).max(50).required(),
    email: Joi.string().email().not(null).required(),
    password: Joi.string().min(8).required(),
    dateOfBirth: Joi.string().allow(null, ""),
    identityCard: Joi.string().allow(null, ""),
    phone: Joi.string().allow(null, "").pattern(new RegExp("^(\\+84|0)[3-9][0-9]{8}$")),
    room: Joi.string(),
    rentalDate: Joi.string().allow(null, ""),
    leaseTerminationDate: Joi.string().allow(null, ""),
    gender: Joi.string().valid("Male", "Female").required(),
    status: Joi.boolean().default(true),
    accountType: Joi.string().valid("Lodger", "Manager", "Admin").default("Lodger")
  }),

  validateNewPassword: Joi.object({
    id: Joi.string().not(null).required(),
    password: Joi.string()
      .min(8)
      .max(20)
      .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^\\w\\s]).+$"))
      .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^\\w\\s]).+$"))
      .required(),
  }),

  validateProfile: Joi.object({
    name: Joi.string().allow("", null).min(2).max(50),
    phone: Joi.string()
      .allow("", null)
      .pattern(new RegExp("^(\\+84|0)[3-9][0-9]{8}$")),
    avatar: Joi.string().allow("", null).uri().max(2000),
      //.pattern(new RegExp("^(\\+84|0)[3-9][0-9]{8}$")),
    avatar: Joi.string().allow("", null).uri().max(2000),
    payosClientId: Joi.string().allow("", null),
    payosAPIKey: Joi.string().allow("", null),
    payosCheckSum: Joi.string().allow("", null),
  }),

  validateChangePassword: Joi.object({
    oldPassword: Joi.string()
      .min(8)
      .max(20)
      .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^\\w\\s]).+$"))
      .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^\\w\\s]).+$"))
      .required(),
    newPassword: Joi.string()
      .min(8)
      .max(20)
      .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^\\w\\s]).+$"))
      .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^\\w\\s]).+$"))
      .required(),
  }),

  validateUploadImage: Joi.object({
    url: Joi.string().uri().required().max(2000),
    description: Joi.string().allow("", null).max(500),
    url: Joi.string().uri().required().max(2000),
    description: Joi.string().allow("", null).max(500),
  }),
};

export default accountValidate;