const fs = require('fs');
const path = require('path');

class Logger {
  constructor() {
    this.logFile = path.join(__dirname, '../logs/scheduler.log');
    this.logStream = null;
    this.init();
  }

  init() {
    const logsDir = path.dirname(this.logFile);
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
    this.logStream = fs.createWriteStream(this.logFile, { flags: 'a' });
  }

  formatMessage(level, message) {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level}] ${message}\n`;
  }

  info(message) {
    const logMessage = this.formatMessage('INFO', message);
    console.log(logMessage.trim());
    this.logStream.write(logMessage);
  }

  error(message) {
    const logMessage = this.formatMessage('ERROR', message);
    console.error(logMessage.trim());
    this.logStream.write(logMessage);
  }

  warn(message) {
    const logMessage = this.formatMessage('WARN', message);
    console.warn(logMessage.trim());
    this.logStream.write(logMessage);
  }

  debug(message) {
    if (process.env.NODE_ENV === 'development') {
      const logMessage = this.formatMessage('DEBUG', message);
      console.log(logMessage.trim());
      this.logStream.write(logMessage);
    }
  }
}

module.exports = new Logger();
