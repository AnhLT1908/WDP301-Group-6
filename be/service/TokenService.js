const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const { REFRESH_KEY, ACCESS_KEY } = process.env;

class Token {
  async genAccessToken(account) {
    return jwt.sign(
      {
        id: account._id,
        accountType: account.accountType,
      },
      ACCESS_KEY,
      { expiresIn: "1m" }
    );
  }

  async genRefreshToken(account) {
    return jwt.sign(
      {
        id: account._id,
        accountType: account.accountType,
      },
      REFRESH_KEY,
      { expiresIn: "365d" }
    );
  }
}

module.exports = new Token();
