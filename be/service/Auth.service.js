const Account = require("../model/Account.js");
const PasswordResetCodeModel = require("../model/PasswordResetCode.model.js");
const bcrypt = require("bcryptjs");
const sendEmail = require("../utils/mailer.js");

class AuthService {
  async forgotPasswordHandler(req, res) {
    console.log("Email request: ", req.body.email);
    const account = await Account.findOne({ email: req.body.email });
    if (!account) {
      return res.status(400).json({ message: "User not found" });
    }

    const { customAlphabet } = await import("nanoid");
    const nanoid = customAlphabet("1234567890", 6);
    const passwordResetCode = nanoid();

    const newPasswordResetCode = await PasswordResetCodeModel.create({
      code: passwordResetCode,
    });
    account.passwordResetCode = newPasswordResetCode._id;
    await account.save();

    await sendEmail({
      from: "trantrungnguyenad@gmail.com",
      to: account.email,
      subject: "Reset your password",
      text: `Password reset code: ${passwordResetCode}`,
    });
    return res.status(200).json({
      message: "Check Email",
      data: { accountId: account._doc._id },
    });
  }

  async verifyPasswordResetCode(req, res) {
    const { id, passwordResetCode } = req.body;
    const account = await Account.findById(id).populate("passwordResetCode");
    if (!account) {
      return res.send("Account not found");
    } else if (account.passwordResetCode === null) {
      return res.send("Code reset password is expires time !!");
    } else if (account.passwordResetCode.code !== passwordResetCode) {
      return res.send(
        "Code verify is not correct, please check in email again !!"
      );
    } else if (account.passwordResetCode.code === passwordResetCode) {
      return res.status(200).json({ message: "Verify Successfully" });
    }
  }

  async resetPasswordHandler(req, res) {
    const { password, id, passwordResetCode } = req.body;
    const account = await Account.findById(id);

    if (!account) {
      return res.status(400).json({
        message: "Could not reset user password, because account not found !!",
      });
    } else {
      account.passwordResetCode = null;
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      account.password = hashedPassword;
      await account.save();
      return res.status(201).json({ message: "Successfully updated password" });
    }
  }
}

module.exports = new AuthService();
