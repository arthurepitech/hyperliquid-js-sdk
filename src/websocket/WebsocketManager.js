const WebSocket = require('ws');
const EventEmitter = require('events');

class ActiveSubscription {
  constructor(callback, subscriptionId) {
    this.callback = callback;
    this.subscriptionId = subscriptionId;
  }
}

function subscriptionToIdentifier(subscription) {
  switch (subscription.type) {
    case 'allMids':
      return 'allMids';
    case 'l2Book':
      return `l2Book:${subscription.coin.toLowerCase()}`;
    case 'trades':
      return `trades:${subscription.coin.toLowerCase()}`;
    case 'userEvents':
      return 'userEvents';
    case 'userFills':
      return `userFills:${subscription.user.toLowerCase()}`;
    case 'candle':
      return `candle:${subscription.coin.toLowerCase()},${subscription.interval}`;
    case 'orderUpdates':
      return 'orderUpdates';
    case 'userFundings':
      return `userFundings:${subscription.user.toLowerCase()}`;
    case 'userNonFundingLedgerUpdates':
      return `userNonFundingLedgerUpdates:${subscription.user.toLowerCase()}`;
  }
}

function wsMsgToIdentifier(wsMsg) {
  switch (wsMsg.channel) {
    case 'pong':
      return 'pong';
    case 'allMids':
      return 'allMids';
    case 'l2Book':
      return `l2Book:${wsMsg.data.coin.toLowerCase()}`;
    case 'trades':
      if (wsMsg.data.length === 0) return null;
      return `trades:${wsMsg.data[0].coin.toLowerCase()}`;
    case 'user':
      return 'userEvents';
    case 'userFills':
      return `userFills:${wsMsg.data.user.toLowerCase()}`;
    case 'candle':
      return `candle:${wsMsg.data.s.toLowerCase()},${wsMsg.data.i}`;
    case 'orderUpdates':
      return 'orderUpdates';
    case 'userFundings':
      return `userFundings:${wsMsg.data.user.toLowerCase()}`;
    case 'userNonFundingLedgerUpdates':
      return `userNonFundingLedgerUpdates:${wsMsg.data.user.toLowerCase()}`;
    default:
      return null;
  }
}

class WebsocketManager extends EventEmitter {
  constructor(baseUrl) {
    super();
    this.subscriptionIdCounter = 0;
    this.wsReady = false;
    this.queuedSubscriptions = [];
    this.activeSubscriptions = new Map();
    this.wsUrl = `ws${baseUrl.slice(4)}/ws`;
    this.ws = null;
    this.pingInterval = null;
  }

  connect() {
    this.ws = new WebSocket(this.wsUrl);
    
    this.ws.on('open', () => {
      console.debug('WebSocket connected');
      this.wsReady = true;
      this.startPing();
      this.processQueuedSubscriptions();
    });

    this.ws.on('message', (data) => {
      this.handleMessage(data);
    });

    this.ws.on('close', () => {
      console.debug('WebSocket closed');
      this.wsReady = false;
      this.clearPing();
      this.reconnect();
    });

    this.ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      this.emit('error', error);
    });
  }

  startPing() {
    this.pingInterval = setInterval(() => {
      if (this.wsReady) {
        console.debug('WebSocket sending ping');
        this.ws.send(JSON.stringify({ method: 'ping' }));
      }
    }, 50000);
  }

  clearPing() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  reconnect() {
    setTimeout(() => {
      this.connect();
    }, 5000);
  }

  handleMessage(message) {
    if (message.toString() === 'Websocket connection established.') {
      console.debug(message.toString());
      return;
    }

    console.debug('Received message:', message.toString());
    const wsMsg = JSON.parse(message);
    const identifier = wsMsgToIdentifier(wsMsg);

    if (identifier === 'pong') {
      console.debug('WebSocket received pong');
      return;
    }

    if (!identifier) {
      console.debug('WebSocket not handling empty message');
      return;
    }

    const activeSubscriptions = this.activeSubscriptions.get(identifier) || [];
    if (activeSubscriptions.length === 0) {
      console.warn('WebSocket message from unexpected subscription:', message, identifier);
    } else {
      activeSubscriptions.forEach(sub => sub.callback(wsMsg));
    }
  }

  subscribe(subscription, callback, subscriptionId = null) {
    if (!subscriptionId) {
      this.subscriptionIdCounter += 1;
      subscriptionId = this.subscriptionIdCounter;
    }

    if (!this.wsReady) {
      console.debug('Enqueueing subscription');
      this.queuedSubscriptions.push([subscription, new ActiveSubscription(callback, subscriptionId)]);
    } else {
      console.debug('Subscribing');
      const identifier = subscriptionToIdentifier(subscription);
      
      if (identifier === 'userEvents' || identifier === 'orderUpdates') {
        const currentSubs = this.activeSubscriptions.get(identifier) || [];
        if (currentSubs.length > 0) {
          throw new Error(`Cannot subscribe to ${identifier} multiple times`);
        }
      }

      const subs = this.activeSubscriptions.get(identifier) || [];
      subs.push(new ActiveSubscription(callback, subscriptionId));
      this.activeSubscriptions.set(identifier, subs);
      
      this.ws.send(JSON.stringify({
        method: 'subscribe',
        subscription: subscription
      }));
    }

    return subscriptionId;
  }

  unsubscribe(subscription, subscriptionId) {
    if (!this.wsReady) {
      throw new Error("Can't unsubscribe before websocket connected");
    }

    const identifier = subscriptionToIdentifier(subscription);
    const activeSubs = this.activeSubscriptions.get(identifier) || [];
    const newActiveSubs = activeSubs.filter(sub => sub.subscriptionId !== subscriptionId);

    if (newActiveSubs.length === 0) {
      this.ws.send(JSON.stringify({
        method: 'unsubscribe',
        subscription: subscription
      }));
      this.activeSubscriptions.delete(identifier);
    } else {
      this.activeSubscriptions.set(identifier, newActiveSubs);
    }

    return activeSubs.length !== newActiveSubs.length;
  }

  processQueuedSubscriptions() {
    this.queuedSubscriptions.forEach(([subscription, activeSub]) => {
      this.subscribe(subscription, activeSub.callback, activeSub.subscriptionId);
    });
    this.queuedSubscriptions = [];
  }
}

module.exports = WebsocketManager;
