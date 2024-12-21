const URLS = {
  MAINNET: {
    API: 'https://api.hyperliquid.xyz',
    STATS: 'https://stats-data.hyperliquid.xyz/Mainnet',
    CHAIN_ID: 1
  },
  TESTNET: {
    API: 'https://api.hyperliquid-testnet.xyz',
    STATS: 'https://stats-data.hyperliquid.xyz/Testnet',
    CHAIN_ID: 5
  },
  LOCAL: {
    API: 'http://localhost:3000',
    CHAIN_ID: 1337
  }
};

const SIGNATURE_TYPES = {
  EXCHANGE: {
    name: 'Exchange',
    version: '1'
  },
  USD_TRANSFER: {
    name: 'UsdTransfer',
    version: '1'
  },
  APPROVE_AGENT: {
    name: 'ApproveAgent',
    version: '1'
  }
};

module.exports = {
  URLS,
  SIGNATURE_TYPES
};
