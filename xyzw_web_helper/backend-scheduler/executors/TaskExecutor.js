const { WebSocketClient } = require('../utils/WebSocketClient');
const logger = require('../utils/logger');

class TaskExecutor {
  constructor(tokenManager) {
    this.tokenManager = tokenManager;
    this.connections = new Map();
  }

  async execute(taskType, selectedTokens, taskConfig) {
    const results = [];

    for (const tokenId of selectedTokens) {
      const token = this.tokenManager.getToken(tokenId);
      if (!token) {
        results.push({
          tokenId,
          tokenName: 'Unknown',
          success: false,
          error: 'Token not found'
        });
        continue;
      }

      try {
        const result = await this.executeForToken(token, taskType, taskConfig);
        results.push({
          tokenId,
          tokenName: token.name,
          success: true,
          ...result
        });
      } catch (error) {
        logger.error(`Task execution failed for token ${token.name}: ${error.message}`);
        results.push({
          tokenId,
          tokenName: token.name,
          success: false,
          error: error.message
        });
      }
    }

    return results;
  }

  async executeForToken(token, taskType, taskConfig) {
    let client = null;
    try {
      const wsUrl = token.wsUrl || process.env.DEFAULT_WS_URL || 'wss://game.xyzw.my/ws';
      client = new WebSocketClient(wsUrl, token.token);
      
      await client.connect();
      logger.info(`Connected to WebSocket for token: ${token.name}`);

      let result;
      switch (taskType) {
        case 'daily_signin':
          result = await this.executeDailySignIn(client);
          break;
        case 'arena_fight':
          result = await this.executeArenaFight(client, taskConfig);
          break;
        case 'tower_climb':
          result = await this.executeTowerClimb(client, taskConfig);
          break;
        case 'custom':
          result = await this.executeCustomCommands(client, taskConfig.commands);
          break;
        default:
          throw new Error(`Unknown task type: ${taskType}`);
      }

      return result;
    } finally {
      if (client) {
        await client.disconnect();
      }
    }
  }

  async executeDailySignIn(client) {
    logger.info('Executing daily sign-in');
    const result = await client.send('role:signin:daily', {});
    return { action: 'daily_signin', result };
  }

  async executeArenaFight(client, config) {
    logger.info('Executing arena fight');
    const battles = config.battles || 5;
    const results = [];
    
    for (let i = 0; i < battles; i++) {
      const result = await client.send('arena:fight:start', {
        targetId: config.targetId
      });
      results.push(result);
      await new Promise(r => setTimeout(r, 1000));
    }
    
    return { action: 'arena_fight', battles: results };
  }

  async executeTowerClimb(client, config) {
    logger.info('Executing tower climb');
    const floors = config.floors || 1;
    const results = [];
    
    for (let i = 0; i < floors; i++) {
      const result = await client.send('tower:climb:start', {});
      results.push(result);
      await new Promise(r => setTimeout(r, 1000));
    }
    
    return { action: 'tower_climb', floors: results };
  }

  async executeCustomCommands(client, commands) {
    logger.info(`Executing ${commands.length} custom commands`);
    const results = [];
    
    for (const cmd of commands) {
      const result = await client.send(cmd.command, cmd.params || {});
      results.push(result);
      if (cmd.delay) {
        await new Promise(r => setTimeout(r, cmd.delay));
      }
    }
    
    return { action: 'custom', commands: results };
  }
}

module.exports = { TaskExecutor };
