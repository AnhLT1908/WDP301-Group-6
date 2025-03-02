import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();
const { REFRESH_KEY, ACCESS_KEY } = process.env;

class Token {
  async genAccessToken(account) {
    if (!ACCESS_KEY) throw new Error("ACCESS_KEY is missing in .env file");
    return jwt.sign(
      {
        id: account._id,
        accountType: account.accountType,
      },
      ACCESS_KEY,
      { expiresIn: '1m' }
    );
  }

  async genRefreshToken(account) {
    if (!REFRESH_KEY) throw new Error("REFRESH_KEY is missing in .env file");
    return jwt.sign(
      {
        id: account._id,
        accountType: account.accountType,
      },
      REFRESH_KEY,
      { expiresIn: '365d' }
    );
  }
}

export default new Token();
