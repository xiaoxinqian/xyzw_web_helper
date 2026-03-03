require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const fs = require('fs');
const path = require('path');
const TaskScheduler = require('./scheduler/TaskScheduler');
const TokenManager = require('./managers/TokenManager');
const TaskManager = require('./managers/TaskManager');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

const tokenManager = new TokenManager();
const taskManager = new TaskManager();
const scheduler = new TaskScheduler(tokenManager, taskManager);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    activeJobs: scheduler.getActiveJobs().length,
    tokens: tokenManager.getTokenCount()
  });
});

app.get('/api/tokens', (req, res) => {
  res.json(tokenManager.getAllTokens());
});

app.post('/api/tokens', (req, res) => {
  const { name, token, server, wsUrl, remark } = req.body;
  
  if (!name || !token) {
    return res.status(400).json({ error: 'Name and token are required' });
  }
  
  const tokenId = tokenManager.addToken({ name, token, server, wsUrl, remark });
  res.json({ success: true, tokenId });
});

app.delete('/api/tokens/:id', (req, res) => {
  const { id } = req.params;
  tokenManager.removeToken(id);
  res.json({ success: true });
});

app.get('/api/tasks', (req, res) => {
  res.json(taskManager.getAllTasks());
});

app.post('/api/tasks', (req, res) => {
  const { name, cronExpression, taskType, selectedTokens, taskConfig, enabled } = req.body;
  
  if (!name || !cronExpression || !taskType) {
    return res.status(400).json({ error: 'Name, cronExpression, and taskType are required' });
  }
  
  const taskId = taskManager.addTask({
    name,
    cronExpression,
    taskType,
    selectedTokens,
    taskConfig,
    enabled: enabled !== false
  });
  
  if (enabled !== false) {
    scheduler.scheduleTask(taskManager.getTask(taskId));
  }
  
  res.json({ success: true, taskId });
});

app.put('/api/tasks/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  
  taskManager.updateTask(id, updates);
  
  scheduler.unscheduleTask(id);
  if (updates.enabled !== false) {
    scheduler.scheduleTask(taskManager.getTask(id));
  }
  
  res.json({ success: true });
});

app.delete('/api/tasks/:id', (req, res) => {
  const { id } = req.params;
  scheduler.unscheduleTask(id);
  taskManager.removeTask(id);
  res.json({ success: true });
});

app.post('/api/tasks/:id/execute', async (req, res) => {
  const { id } = req.params;
  const task = taskManager.getTask(id);
  
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }
  
  try {
    await scheduler.executeTaskNow(task);
    res.json({ success: true, message: 'Task executed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/logs', (req, res) => {
  const logFile = path.join(__dirname, 'logs', 'scheduler.log');
  if (fs.existsSync(logFile)) {
    const logs = fs.readFileSync(logFile, 'utf8');
    res.type('text/plain').send(logs);
  } else {
    res.send('No logs available');
  }
});

const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const LOGS_DIR = path.join(__dirname, 'logs');
if (!fs.existsSync(LOGS_DIR)) {
  fs.mkdirSync(LOGS_DIR, { recursive: true });
}

tokenManager.loadFromDisk();
taskManager.loadFromDisk();

const allTasks = taskManager.getAllTasks();
allTasks.forEach(task => {
  if (task.enabled) {
    scheduler.scheduleTask(task);
  }
});

app.listen(PORT, () => {
  console.log(`[Scheduler Server] Running on port ${PORT}`);
  console.log(`[Scheduler Server] Loaded ${tokenManager.getTokenCount()} tokens`);
  console.log(`[Scheduler Server] Loaded ${allTasks.length} tasks`);
  console.log(`[Scheduler Server] Active jobs: ${scheduler.getActiveJobs().length}`);
});
