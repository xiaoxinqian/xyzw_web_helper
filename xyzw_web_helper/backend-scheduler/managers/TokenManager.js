const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('crypto');

class TokenManager {
  constructor() {
    this.tokens = new Map();
    this.dataFile = path.join(__dirname, '../data/tokens.json');
  }

  addToken(tokenData) {
    const id = uuidv4();
    const token = {
      id,
      name: tokenData.name,
      token: tokenData.token,
      server: tokenData.server || '',
      wsUrl: tokenData.wsUrl || null,
      remark: tokenData.remark || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.tokens.set(id, token);
    this.saveToDisk();
    return id;
  }

  getToken(id) {
    return this.tokens.get(id);
  }

  getAllTokens() {
    return Array.from(this.tokens.values());
  }

  updateToken(id, updates) {
    const token = this.tokens.get(id);
    if (token) {
      Object.assign(token, updates, { updatedAt: new Date().toISOString() });
      this.tokens.set(id, token);
      this.saveToDisk();
      return token;
    }
    return null;
  }

  removeToken(id) {
    const result = this.tokens.delete(id);
    if (result) {
      this.saveToDisk();
    }
    return result;
  }

  getTokenCount() {
    return this.tokens.size;
  }

  saveToDisk() {
    const tokensArray = Array.from(this.tokens.values());
    fs.writeFileSync(this.dataFile, JSON.stringify(tokensArray, null, 2));
  }

  loadFromDisk() {
    if (fs.existsSync(this.dataFile)) {
      try {
        const data = JSON.parse(fs.readFileSync(this.dataFile, 'utf8'));
        data.forEach(token => {
          this.tokens.set(token.id, token);
        });
      } catch (error) {
        console.error('Error loading tokens from disk:', error);
      }
    }
  }
}

module.exports = TokenManager;
