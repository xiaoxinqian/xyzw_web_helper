const WebSocket = require('ws');
const PQueue = require('p-queue').default;
const logger = require('../utils/logger');

class WebSocketClient {
  constructor(wsUrl, token) {
    this.wsUrl = wsUrl;
    this.token = token;
    this.ws = null;
    this.messageQueue = new PQueue({ concurrency: 1 });
    this.messageId = 0;
    this.pendingMessages = new Map();
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  async connect() {
    return new Promise((resolve, reject) => {
      try {
        const url = `${this.wsUrl}?token=${encodeURIComponent(this.token)}`;
        this.ws = new WebSocket(url);

        this.ws.on('open', () => {
          logger.info('WebSocket connected');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          resolve();
        });

        this.ws.on('message', (data) => {
          this.handleMessage(data);
        });

        this.ws.on('error', (error) => {
          logger.error('WebSocket error:', error);
          this.isConnected = false;
          reject(error);
        });

        this.ws.on('close', () => {
          logger.info('WebSocket disconnected');
          this.isConnected = false;
          this.handleDisconnect();
        });

        setTimeout(() => {
          if (!this.isConnected) {
            reject(new Error('Connection timeout'));
          }
        }, 10000);
      } catch (error) {
        reject(error);
      }
    });
  }

  async handleDisconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      logger.info(`Reconnecting... Attempt ${this.reconnectAttempts}`);
      await new Promise(r => setTimeout(r, 2000 * this.reconnectAttempts));
      try {
        await this.connect();
      } catch (error) {
        logger.error('Reconnection failed:', error);
      }
    }
  }

  handleMessage(data) {
    try {
      const message = JSON.parse(data.toString());
      
      if (message.ack && this.pendingMessages.has(message.ack)) {
        const { resolve } = this.pendingMessages.get(message.ack);
        this.pendingMessages.delete(message.ack);
        resolve(message);
      }
    } catch (error) {
      logger.error('Error handling message:', error);
    }
  }

  async send(cmd, params = {}, timeout = 8000) {
    return this.messageQueue.add(async () => {
      if (!this.isConnected) {
        throw new Error('WebSocket not connected');
      }

      const messageId = ++this.messageId;
      const message = {
        cmd,
        body: params,
        ack: 0,
        seq: messageId,
        time: Date.now()
      };

      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          this.pendingMessages.delete(messageId);
          reject(new Error('Message timeout'));
        }, timeout);

        this.pendingMessages.set(messageId, {
          resolve: (response) => {
            clearTimeout(timer);
            resolve(response);
          },
          reject
        });

        this.ws.send(JSON.stringify(message));
      });
    });
  }

  async disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      this.isConnected = false;
    }
  }
}

module.exports = { WebSocketClient };
