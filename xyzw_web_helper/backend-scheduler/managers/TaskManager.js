const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class TaskManager {
  constructor() {
    this.tasks = new Map();
    this.dataFile = path.join(__dirname, '../data/tasks.json');
  }

  addTask(taskData) {
    const id = crypto.randomUUID();
    const task = {
      id,
      name: taskData.name,
      cronExpression: taskData.cronExpression,
      taskType: taskData.taskType,
      selectedTokens: taskData.selectedTokens || [],
      taskConfig: taskData.taskConfig || {},
      enabled: taskData.enabled !== false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastRunAt: null
    };
    this.tasks.set(id, task);
    this.saveToDisk();
    return id;
  }

  getTask(id) {
    return this.tasks.get(id);
  }

  getAllTasks() {
    return Array.from(this.tasks.values());
  }

  updateTask(id, updates) {
    const task = this.tasks.get(id);
    if (task) {
      Object.assign(task, updates, { updatedAt: new Date().toISOString() });
      this.tasks.set(id, task);
      this.saveToDisk();
      return task;
    }
    return null;
  }

  removeTask(id) {
    const result = this.tasks.delete(id);
    if (result) {
      this.saveToDisk();
    }
    return result;
  }

  saveToDisk() {
    const tasksArray = Array.from(this.tasks.values());
    fs.writeFileSync(this.dataFile, JSON.stringify(tasksArray, null, 2));
  }

  loadFromDisk() {
    if (fs.existsSync(this.dataFile)) {
      try {
        const data = JSON.parse(fs.readFileSync(this.dataFile, 'utf8'));
        data.forEach(task => {
          this.tasks.set(task.id, task);
        });
      } catch (error) {
        console.error('Error loading tasks from disk:', error);
      }
    }
  }
}

module.exports = TaskManager;
