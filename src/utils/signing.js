const ethers = require('ethers');
const { Decimal } = require('decimal.js');
const { URLS } = require('./constants');

function signInner(wallet, data) {
  const structuredData = ethers.utils._TypedDataEncoder.getPayload(data);
  const signature = wallet._signingKey().signDigest(structuredData);
  
  return {
    r: signature.r,
    s: signature.s,
    v: signature.v
  };
}

function signL1Action(wallet, action, isMainnet) {
  return signInner(wallet, {
    name: 'Exchange',
    version: '1',
    chainId: isMainnet ? URLS.MAINNET.CHAIN_ID : URLS.TESTNET.CHAIN_ID,
    action,
    nonce: getTimestampMs()
  });
}

function signAgent(wallet, action, isMainnet) {
  return signInner(wallet, {
    name: 'ApproveAgent',
    version: '1',
    chainId: isMainnet ? URLS.MAINNET.CHAIN_ID : URLS.TESTNET.CHAIN_ID,
    action,
    nonce: action.nonce
  });
}

function signApproveBuilderFee(wallet, action, isMainnet) {
  return signInner(wallet, {
    name: 'HyperliquidTransaction:ApproveBuilderFee',
    version: '1',
    chainId: isMainnet ? URLS.MAINNET.CHAIN_ID : URLS.TESTNET.CHAIN_ID,
    action,
    nonce: action.nonce
  });
}

function signUsdTransferAction(wallet, action, isMainnet) {
  return signInner(wallet, {
    name: 'UsdTransfer',
    version: '1',
    chainId: isMainnet ? URLS.MAINNET.CHAIN_ID : URLS.TESTNET.CHAIN_ID,
    action,
    nonce: action.nonce
  });
}

function signSpotTransferAction(wallet, action, isMainnet) {
  return signInner(wallet, {
    name: 'SpotTransfer',
    version: '1',
    chainId: isMainnet ? URLS.MAINNET.CHAIN_ID : URLS.TESTNET.CHAIN_ID,
    action,
    nonce: action.nonce
  });
}

function signUsdClassTransferAction(wallet, action, isMainnet) {
  return signInner(wallet, {
    name: 'UsdClassTransfer',
    version: '1',
    chainId: isMainnet ? URLS.MAINNET.CHAIN_ID : URLS.TESTNET.CHAIN_ID,
    action,
    nonce: action.nonce
  });
}

function signWithdrawFromBridgeAction(wallet, action, isMainnet) {
  return signInner(wallet, {
    name: 'WithdrawFromBridge',
    version: '1',
    chainId: isMainnet ? URLS.MAINNET.CHAIN_ID : URLS.TESTNET.CHAIN_ID,
    action,
    nonce: action.nonce
  });
}

function signConvertToMultiSigUserAction(wallet, action, isMainnet) {
  return signInner(wallet, {
    name: 'ConvertToMultiSigUser',
    version: '1',
    chainId: isMainnet ? URLS.MAINNET.CHAIN_ID : URLS.TESTNET.CHAIN_ID,
    action,
    nonce: action.nonce
  });
}

function signMultiSigAction(wallet, action, isMainnet, vaultAddress, nonce) {
  return signInner(wallet, {
    name: 'MultiSig',
    version: '1',
    chainId: isMainnet ? URLS.MAINNET.CHAIN_ID : URLS.TESTNET.CHAIN_ID,
    action,
    vaultAddress,
    nonce
  });
}

function floatToWire(x) {
  const rounded = x.toFixed(8);
  if (Math.abs(parseFloat(rounded) - x) >= 1e-12) {
    throw new Error(`floatToWire causes rounding: ${x}`);
  }
  
  if (rounded === '-0') {
    return '0';
  }
  
  return new Decimal(rounded).toFixed();
}

function floatToIntForHashing(x) {
  return floatToInt(x, 8);
}

function floatToUsdInt(x) {
  return floatToInt(x, 6);
}

function floatToInt(x, power) {
  const withDecimals = x * Math.pow(10, power);
  if (Math.abs(Math.round(withDecimals) - withDecimals) >= 1e-3) {
    throw new Error(`floatToInt causes rounding: ${x}`);
  }
  return Math.round(withDecimals);
}

function getTimestampMs() {
  return Date.now();
}

function orderRequestToOrderWire(order, asset) {
  const orderWire = {
    a: asset,
    b: order.is_buy,
    p: floatToWire(order.limit_px),
    s: floatToWire(order.sz),
    r: order.reduce_only,
    t: orderTypeToWire(order.order_type)
  };

  if (order.cloid) {
    orderWire.c = order.cloid.toRaw();
  }

  return orderWire;
}

function orderWiresToOrderAction(orderWires, builder = null) {
  const action = {
    type: 'order',
    orders: orderWires,
    grouping: 'na'
  };

  if (builder) {
    action.builder = builder;
  }

  return action;
}

function orderTypeToWire(orderType) {
  if (orderType.limit) {
    return { limit: orderType.limit };
  }
  
  if (orderType.trigger) {
    return {
      trigger: {
        ...orderType.trigger,
        triggerPx: floatToWire(orderType.trigger.triggerPx)
      }
    };
  }
  
  throw new Error('Invalid order type');
}

module.exports = {
  signInner,
  signL1Action,
  signAgent,
  signApproveBuilderFee,
  signUsdTransferAction,
  signSpotTransferAction,
  signUsdClassTransferAction,
  signWithdrawFromBridgeAction,
  signConvertToMultiSigUserAction,
  signMultiSigAction,
  floatToWire,
  floatToIntForHashing,
  floatToUsdInt,
  floatToInt,
  getTimestampMs,
  orderRequestToOrderWire,
  orderWiresToOrderAction,
  orderTypeToWire
};
