import Account from '../model/Account.js';
import PasswordResetCode from '../model/PasswordResetCode.js';
import bcrypt from 'bcrypt';
import TokenService from './TokenService.js';
import sendEmail from '../utils/mailer.js';
import { customAlphabet } from 'nanoid';

export const Login = async (req, res) => {
  try {
    const findAccount = await Account.findOne({
      $or: [{ email: req.body.email }, { username: req.body.username }],
    });
    if (!findAccount) {
      return res.status(401).json({ error: 'Wrong email or Username' });
    }
    const comparePassword = await bcrypt.compare(
      req.body.password,
      findAccount.password
    );
    if (!comparePassword) {
      return res.status(401).json({ error: 'Wrong password' });
    }
    const { password, refreshToken, ...others } = findAccount._doc;
    if (findAccount && comparePassword) {
      const genAccessToken = await TokenService.genAccessToken(findAccount._doc);
      const genRefreshToken = await TokenService.genRefreshToken(findAccount._doc);

      res.cookie('accessToken', genAccessToken, {
        httpOnly: false,
        secure: false,
        path: '/',
        sameSite: 'None',
      });

      await Account.findByIdAndUpdate(
        { _id: findAccount.id },
        { refreshToken: genRefreshToken }
      );
      return res.status(200).json({
        message: 'Login Successfully',
        data: { ...others },
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: 'Internal Server Error',
    });
  }
};

export const Register = async (req, res) => {
  const { email, username, password, name } = req.body;

  try {
    const checkEmailExists = await Account.findOne({ email: email });
    if (checkEmailExists !== null)
      return res.status(400).json({ message: 'Email has exists' });
    const checkUsername = await Account.findOne({ username });
    if (checkUsername !== null) {
      return res.status(400).json({ message: 'Username has exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    await Account.create({
      username,
      name,
      email,
      password: hashedPassword,
    }).then((data) => {
      return res.status(201).json({
        message: 'Register Successfully',
        data: {
          username: data.username,
          name: data.name,
          email: data.email,
        },
      });
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Internal Server Error',
    });
  }
};

export const Logout = async (req, res) => {
  res.clearCookie('accessToken');
  return res.status(200).json('Logout successful');
};

export const ForgotPasswordHandler = async (req, res) => {
  const account = await Account.findOne({ email: req.body.email });
  if (!account) {
    return res.status(400).json({ message: 'User not found' });
  }

  const nanoid = customAlphabet('1234567890', 6);
  const PasswordResetCode = nanoid();

  const newPasswordResetCode = await PasswordResetCode.create({
    code: PasswordResetCode,
  });
  account.passwordResetCode = newPasswordResetCode._id;
  await account.save();

  await sendEmail({
    from: 'longhvhe170156@fpt.edu.vn',
    to: account.email,
    subject: 'Reset your password',
    text: `Password reset code: ${PasswordResetCode}`,
  });
  return res.status(200).json({
    message: 'Check Email',
    data: { accountId: account._doc._id },
  });
};

export const VerifyPasswordResetCode = async (req, res) => {
  const { id, passwordResetCode } = req.body;
  const account = await Account.findById(id).populate('passwordResetCode');
  if (!account) {
    return res.send('Account not found');
  } else if (account.passwordResetCode === null) {
    return res.send('Code reset password is expired time !!');
  } else if (account.passwordResetCode.code !== passwordResetCode) {
    return res.send(
      'Code verify is not correct, please check in email again !!'
    );
  } else if (account.passwordResetCode.code === passwordResetCode) {
    return res.status(200).json({ message: 'Verify Successfully' });
  }
};

export const ResetPasswordHandler = async (req, res) => {
  const { password, id, passwordResetCode } = req.body;
  const account = await Account.findById(id);

  if (!account) {
    return res.status(400).json({
      message: 'Could not reset user password, because account not found !!',
    });
  } else {
    account.passwordResetCode = null;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    account.password = hashedPassword;
    await account.save();
    return res.status(201).json({ message: 'Successfully updated password' });
  }
};

export const RefreshTokenHandler = async (req, res) => {
  try {
    const { refreshToken, id } = req.body;
    const account = await Account.findById(id);

    if (!account) {
      return res.status(400).json({
        message:
          'Could not reset user password, because account not found !!',
      });
    } else {
      if (account.refreshToken !== refreshToken) {
        return res.status(401).json({ message: 'Invalid refresh token' });
      }

      const genAccessToken = await TokenService.genAccessToken(account._doc);
      const genRefreshToken = await TokenService.genRefreshToken(
        account._doc
      );

      res.cookie('accessToken', genAccessToken, {
        httpOnly: false,
        secure: false,
        path: '/',
        sameSite: 'lax',
      });

      res.cookie('refreshToken', genRefreshToken, {
        httpOnly: false,
        secure: false,
        path: '/',
        sameSite: 'lax',
      });
      await Account.findByIdAndUpdate(
        { _id: account.id },
        { refreshToken: genRefreshToken }
      );
      return res.status(200).json({
        message: 'Refresh token Successfully',
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};
