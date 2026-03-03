const cron = require('node-cron');
const fs = require('fs');
const path = require('path');
const { WebSocketClient } = require('../utils/WebSocketClient');
const { TaskExecutor } = require('../executors/TaskExecutor');
const logger = require('../utils/logger');

class TaskScheduler {
  constructor(tokenManager, taskManager) {
    this.tokenManager = tokenManager;
    this.taskManager = taskManager;
    this.activeJobs = new Map();
    this.taskExecutor = new TaskExecutor(tokenManager);
  }

  scheduleTask(task) {
    if (!task.enabled) {
      logger.info(`Task ${task.name} (${task.id}) is disabled, skipping`);
      return;
    }

    if (!cron.validate(task.cronExpression)) {
      logger.error(`Invalid cron expression for task ${task.name}: ${task.cronExpression}`);
      return;
    }

    const job = cron.schedule(task.cronExpression, async () => {
      logger.info(`Executing scheduled task: ${task.name} (${task.id})`);
      try {
        await this.executeTask(task);
      } catch (error) {
        logger.error(`Error executing task ${task.name}: ${error.message}`);
      }
    }, {
      scheduled: true,
      timezone: "Asia/Shanghai"
    });

    this.activeJobs.set(task.id, job);
    logger.info(`Scheduled task: ${task.name} (${task.id}) with cron: ${task.cronExpression}`);
  }

  unscheduleTask(taskId) {
    const job = this.activeJobs.get(taskId);
    if (job) {
      job.stop();
      this.activeJobs.delete(taskId);
      logger.info(`Unscheduled task: ${taskId}`);
    }
  }

  async executeTaskNow(task) {
    logger.info(`Manual execution requested for task: ${task.name} (${task.id})`);
    await this.executeTask(task);
  }

  async executeTask(task) {
    const { taskType, selectedTokens, taskConfig } = task;

    if (!selectedTokens || selectedTokens.length === 0) {
      logger.warn(`Task ${task.name} has no selected tokens, skipping`);
      return;
    }

    const startTime = Date.now();
    logger.info(`Starting task execution: ${task.name} for ${selectedTokens.length} tokens`);

    try {
      const results = await this.taskExecutor.execute(taskType, selectedTokens, taskConfig);
      
      const duration = Date.now() - startTime;
      const successCount = results.filter(r => r.success).length;
      const failCount = results.filter(r => !r.success).length;
      
      logger.info(`Task ${task.name} completed in ${duration}ms. Success: ${successCount}, Failed: ${failCount}`);
      
      this.logTaskExecution(task, results, duration);
    } catch (error) {
      logger.error(`Task execution failed: ${task.name} - ${error.message}`);
      throw error;
    }
  }

  logTaskExecution(task, results, duration) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      taskId: task.id,
      taskName: task.name,
      taskType: task.taskType,
      tokenCount: results.length,
      successCount: results.filter(r => r.success).length,
      failCount: results.filter(r => !r.success).length,
      duration: duration,
      results: results.map(r => ({
        tokenId: r.tokenId,
        tokenName: r.tokenName,
        success: r.success,
        error: r.error || null
      }))
    };

    const logFile = path.join(__dirname, '../logs', 'executions.json');
    let logs = [];
    if (fs.existsSync(logFile)) {
      try {
        logs = JSON.parse(fs.readFileSync(logFile, 'utf8'));
      } catch (e) {
        logs = [];
      }
    }
    logs.push(logEntry);
    
    const last100Logs = logs.slice(-100);
    fs.writeFileSync(logFile, JSON.stringify(last100Logs, null, 2));
  }

  getActiveJobs() {
    return Array.from(this.activeJobs.entries()).map(([id, job]) => ({
      taskId: id,
      nextRun: job.nextDate ? job.nextDate().toISO() : null
    }));
  }

  stopAll() {
    this.activeJobs.forEach((job, id) => {
      job.stop();
      logger.info(`Stopped job: ${id}`);
    });
    this.activeJobs.clear();
  }
}

module.exports = TaskScheduler;
