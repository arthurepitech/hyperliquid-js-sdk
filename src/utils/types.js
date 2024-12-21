// Types pour les ordres et les transactions
const OrderTypes = {
  LIMIT: 'limit',
  TRIGGER: 'trigger'
};

const TimeInForce = {
  ALO: 'Alo',
  IOC: 'Ioc',
  GTC: 'Gtc'
};

const TriggerTypes = {
  TP: 'tp',
  SL: 'sl'
};

const Side = {
  ASK: 'A',
  BID: 'B'
};

const SubscriptionTypes = {
  ALL_MIDS: 'allMids',
  L2_BOOK: 'l2Book',
  TRADES: 'trades',
  USER_EVENTS: 'userEvents',
  USER_FILLS: 'userFills',
  CANDLE: 'candle',
  ORDER_UPDATES: 'orderUpdates',
  USER_FUNDINGS: 'userFundings',
  USER_NON_FUNDING_LEDGER_UPDATES: 'userNonFundingLedgerUpdates'
};

class Cloid {
  constructor(rawCloid) {
    this._rawCloid = rawCloid;
    this._validate();
  }

  _validate() {
    if (!this._rawCloid.startsWith('0x')) {
      throw new Error('cloid is not a hex string');
    }
    if (this._rawCloid.slice(2).length !== 32) {
      throw new Error('cloid is not 16 bytes');
    }
  }

  static fromInt(cloid) {
    return new Cloid(`0x${cloid.toString(16).padStart(32, '0')}`);
  }

  static fromStr(cloid) {
    return new Cloid(cloid);
  }

  toRaw() {
    return this._rawCloid;
  }
}

// Types pour les messages WebSocket
const WsMessageTypes = {
  PONG: 'pong',
  ALL_MIDS: 'allMids',
  L2_BOOK: 'l2Book',
  TRADES: 'trades',
  USER: 'user',
  USER_FILLS: 'userFills',
  CANDLE: 'candle',
  ORDER_UPDATES: 'orderUpdates',
  USER_FUNDINGS: 'userFundings',
  USER_NON_FUNDING_LEDGER_UPDATES: 'userNonFundingLedgerUpdates'
};

module.exports = {
  OrderTypes,
  TimeInForce,
  TriggerTypes,
  Side,
  SubscriptionTypes,
  WsMessageTypes,
  Cloid
};
