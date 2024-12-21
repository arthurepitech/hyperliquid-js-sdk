const { HyperliquidError } = require('../utils/errors');

module.exports = (req, res, next) => {
  const wallet = req.headers.authorization;
  
  if (!wallet) {
    throw new HyperliquidError('Wallet non fourni');
  }

  req.wallet = wallet;
  next();
}; 