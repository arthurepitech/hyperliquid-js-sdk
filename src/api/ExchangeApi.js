const BaseApi = require('./BaseApi');
const InfoApi = require('./InfoApi');
const { signL1Action, orderRequestToOrderWire, orderWiresToOrderAction, getTimestampMs } = require('../utils/signing');
const { URLS } = require('../utils/constants');

class ExchangeApi extends BaseApi {
  static DEFAULT_SLIPPAGE = 0.05;

  constructor(wallet, baseUrl = null, meta = null, vaultAddress = null, accountAddress = null, spotMeta = null) {
    super(baseUrl);
    this.wallet = wallet;
    this.vaultAddress = vaultAddress;
    this.accountAddress = accountAddress;
    this.info = new InfoApi(baseUrl, true, meta, spotMeta);
  }

  async _postAction(action, signature, nonce) {
    const payload = {
      action,
      signature,
      nonce,
      vaultAddress: action.type !== 'usdClassTransfer' ? this.vaultAddress : null
    };
    return this.post('/exchange', payload);
  }

  _slippagePrice(name, isBuy, slippage = ExchangeApi.DEFAULT_SLIPPAGE, px = null, isSpot = false) {
    if (!px) {
      const l2Data = this.info.l2Snapshot(name);
      const side = isBuy ? 0 : 1;
      if (!l2Data.levels[side] || l2Data.levels[side].length === 0) {
        throw new Error('No liquidity');
      }
      px = parseFloat(l2Data.levels[side][0].px);
    }

    // Calcul du slippage
    px *= isBuy ? (1 + slippage) : (1 - slippage);
    // Arrondi à 5 chiffres significatifs et 6 décimales pour perps, 8 pour spot
    return Number(px.toPrecision(5)).toFixed(isSpot ? 8 : 6);
  }

  async order(name, isBuy, sz, limitPx, orderType, reduceOnly = false, cloid = null, builder = null) {
    const orderRequest = {
      coin: name,
      is_buy: isBuy,
      sz,
      limit_px: limitPx,
      order_type: orderType,
      reduce_only: reduceOnly
    };
    if (cloid) {
      orderRequest.cloid = cloid;
    }
    return this.bulkOrders([orderRequest], builder);
  }

  async bulkOrders(orderRequests, builder = null) {
    const timestamp = getTimestampMs();
    const orderWires = orderRequests.map(order => 
      orderRequestToOrderWire(order, this.info.nameToAsset(order.coin))
    );

    if (builder) {
      builder.b = builder.b.toLowerCase();
    }

    const orderAction = orderWiresToOrderAction(orderWires, builder);
    const signature = signL1Action(
      this.wallet,
      orderAction,
      this.vaultAddress,
      timestamp,
      this.baseUrl === URLS.MAINNET.API
    );

    return this._postAction(orderAction, signature, timestamp);
  }

  // ... autres méthodes similaires à celles du SDK Python

  async marketOpen(name, isBuy, sz, px = null, slippage = ExchangeApi.DEFAULT_SLIPPAGE, cloid = null, builder = null) {
    px = this._slippagePrice(name, isBuy, slippage, px);
    return this.order(
      name,
      isBuy,
      sz,
      px,
      { limit: { tif: 'Ioc' }},
      false,
      cloid,
      builder
    );
  }

  async marketClose(coin, sz = null, px = null, slippage = ExchangeApi.DEFAULT_SLIPPAGE, cloid = null, builder = null) {
    const address = this.accountAddress || this.wallet.address;
    const positions = (await this.info.userState(address)).assetPositions;
    
    for (const position of positions) {
      const item = position.position;
      if (coin !== item.coin) continue;
      
      const szi = parseFloat(item.szi);
      if (!sz) sz = Math.abs(szi);
      const isBuy = szi < 0;
      
      px = this._slippagePrice(coin, isBuy, slippage, px);
      return this.order(
        coin,
        isBuy,
        sz,
        px,
        { limit: { tif: 'Ioc' }},
        true,
        cloid,
        builder
      );
    }
  }
}

module.exports = ExchangeApi;
