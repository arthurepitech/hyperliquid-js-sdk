const BaseApi = require('./BaseApi');
const WebsocketManager = require('../websocket/WebsocketManager');

class InfoApi extends BaseApi {
  constructor(baseUrl = null, skipWs = true, meta = null, spotMeta = null) {
    super(baseUrl);
    
    if (!skipWs) {
      this.wsManager = new WebsocketManager(this.baseUrl);
      this.wsManager.connect();
    }

    this.coinToAsset = new Map();
    this.nameToCoin = new Map();

    if (!meta) {
      this.initializeMeta();
    } else {
      this.setMeta(meta);
    }

    if (!spotMeta) {
      this.initializeSpotMeta();
    } else {
      this.setSpotMeta(spotMeta);
    }
  }

  setMeta(meta) {
    meta.universe.forEach((assetInfo, index) => {
      this.coinToAsset.set(assetInfo.name, index);
      this.nameToCoin.set(assetInfo.name, assetInfo.name);
    });
  }

  setSpotMeta(spotMeta) {
    spotMeta.universe.forEach(spotInfo => {
      this.coinToAsset.set(spotInfo.name, spotInfo.index + 10000);
      this.nameToCoin.set(spotInfo.name, spotInfo.name);
      
      const [base, quote] = spotInfo.tokens;
      const name = `${spotMeta.tokens[base].name}/${spotMeta.tokens[quote].name}`;
      if (!this.nameToCoin.has(name)) {
        this.nameToCoin.set(name, spotInfo.name);
      }
    });
  }

  async initializeMeta() {
    const meta = await this.meta();
    this.setMeta(meta);
  }

  async initializeSpotMeta() {
    const spotMeta = await this.spotMeta();
    this.setSpotMeta(spotMeta);
  }

  // Méthodes d'API
  async meta() {
    return this.post('/info', { type: 'meta' });
  }

  async spotMeta() {
    return this.post('/info', { type: 'spotMeta' });
  }

  async userState(address) {
    return this.post('/info', { type: 'userState', user: address });
  }

  async userFills(address) {
    return this.post('/info', { type: 'userFills', user: address });
  }

  async userFillsByTime(address, startTime, endTime) {
    return this.post('/info', {
      type: 'userFillsByTime',
      user: address,
      startTime,
      endTime
    });
  }

  async metaAndAssetCtxs() {
    return this.post('/info', { type: 'metaAndAssetCtxs' });
  }

  async spotMetaAndAssetCtxs() {
    return this.post('/info', { type: 'spotMetaAndAssetCtxs' });
  }

  async fundingHistory(name, startTime, endTime = null) {
    const coin = this.nameToCoin.get(name);
    const payload = {
      type: 'fundingHistory',
      coin,
      startTime
    };
    if (endTime) {
      payload.endTime = endTime;
    }
    return this.post('/info', payload);
  }

  async userFundingHistory(user, startTime, endTime = null) {
    const payload = {
      type: 'userFunding',
      user,
      startTime
    };
    if (endTime) {
      payload.endTime = endTime;
    }
    return this.post('/info', payload);
  }

  async l2Snapshot(name) {
    return this.post('/info', {
      type: 'l2Book',
      coin: this.nameToCoin.get(name)
    });
  }

  async historicalOrders(address, startTime = null, endTime = null) {
    const payload = {
      type: 'historicalOrders',
      user: address
    };

    if (startTime) {
      payload.startTime = startTime;
    }
    if (endTime) {
      payload.endTime = endTime;
    }

    return this.post('/info', payload);
  }

  // Méthodes WebSocket
  subscribe(subscription, callback) {
    if (!this.wsManager) {
      throw new Error('Cannot call subscribe since skipWs was used');
    }

    if (['l2Book', 'trades', 'candle'].includes(subscription.type)) {
      subscription.coin = this.nameToCoin.get(subscription.coin);
    }

    return this.wsManager.subscribe(subscription, callback);
  }

  unsubscribe(subscription, subscriptionId) {
    if (!this.wsManager) {
      throw new Error('Cannot call unsubscribe since skipWs was used');
    }

    if (['l2Book', 'trades', 'candle'].includes(subscription.type)) {
      subscription.coin = this.nameToCoin.get(subscription.coin);
    }

    return this.wsManager.unsubscribe(subscription, subscriptionId);
  }

  nameToAsset(name) {
    return this.coinToAsset.get(this.nameToCoin.get(name));
  }
}

module.exports = InfoApi;
