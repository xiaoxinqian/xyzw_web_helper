# XYZW Web Helper - 定时任务完整解决方案

## 问题诊断

当前项目的定时任务实现是**前端浏览器方案**，存在以下限制：

1. **必须保持浏览器打开** - 关闭标签页后任务停止
2. **不能真正后台运行** - 依赖前端 JavaScript 环境
3. **无法开机自启后自动执行** - 需手动打开页面

## 解决方案对比

### 方案一：后端调度服务（推荐）✅

**优点：**
- 完全后台运行
- 支持开机自启
- 不依赖浏览器
- 服务稳定可靠

**实现：**
已为你创建了完整的后端调度服务（见 `backend-scheduler/` 目录）

**使用步骤：**

#### 1. 安装并启动后端服务

```bash
cd backend-scheduler
npm install
npm start
```

服务将在 `http://localhost:4000` 运行

#### 2. 配置开机自启（可选）

使用 systemd（推荐）：
```bash
# 复制服务文件
sudo cp xyzw-scheduler.service /etc/systemd/system/

# 修改路径和用户
sudo nano /etc/systemd/system/xyzw-scheduler.service

# 启用并启动
sudo systemctl daemon-reload
sudo systemctl enable xyzw-scheduler
sudo systemctl start xyzw-scheduler
```

或使用 PM2（更简单）：
```bash
npm install -g pm2
pm2 start server.js --name xyzw-scheduler
pm2 startup
pm2 save
```

#### 3. 添加 Token 和创建任务

方式一：通过 API（推荐用于脚本）

```bash
# 添加 Token
curl -X POST http://localhost:4000/api/tokens \
  -H "Content-Type: application/json" \
  -d '{
    "name": "我的账号",
    "token": "你的游戏Token",
    "server": "风云服"
  }'

# 创建定时任务（每天早上8点签到）
curl -X POST http://localhost:4000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "name": "每日签到",
    "cronExpression": "0 0 8 * * *",
    "taskType": "daily_signin",
    "selectedTokens": ["token-id"],
    "enabled": true
  }'
```

方式二：编写管理脚本

创建 `manage-tasks.js`:

```javascript
const axios = require('axios');
const API = 'http://localhost:4000/api';

async function setupTasks() {
  // 添加账号
  const tokens = [
    { name: '账号1', token: 'token1', server: '风云服' },
    { name: '账号2', token: 'token2', server: '风云服' }
  ];
  
  const tokenIds = [];
  for (const t of tokens) {
    const res = await axios.post(`${API}/tokens`, t);
    tokenIds.push(res.data.tokenId);
    console.log(`Added token: ${t.name}`);
  }
  
  // 创建定时任务
  const tasks = [
    {
      name: '每日签到',
      cronExpression: '0 0 8 * * *',  // 每天8点
      taskType: 'daily_signin',
      selectedTokens: tokenIds,
      enabled: true
    },
    {
      name: '竞技场5次',
      cronExpression: '0 30 20 * * *',  // 每天20:30
      taskType: 'arena_fight',
      selectedTokens: tokenIds,
      taskConfig: { battles: 5 },
      enabled: true
    }
  ];
  
  for (const task of tasks) {
    const res = await axios.post(`${API}/tasks`, task);
    console.log(`Created task: ${task.name}`);
  }
}

setupTasks().catch(console.error);
```

运行：`node manage-tasks.js`

#### 4. 监控任务执行

```bash
# 查看服务状态
curl http://localhost:4000/api/health

# 查看日志
curl http://localhost:4000/api/logs

# 或直接查看日志文件
tail -f backend-scheduler/logs/scheduler.log
```

---

### 方案二：无头浏览器 + 前端定时器

**优点：**
- 使用现有前端代码
- 可视化界面

**缺点：**
- 资源占用较高
- 需要额外配置

**实现步骤：**

#### 1. 安装 PM2

```bash
npm install -g pm2
```

#### 2. 创建启动脚本

创建 `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'xyzw-web',
    script: 'npm',
    args: 'run dev',
    cwd: '/path/to/xyzw_web_helper',
    env: {
      NODE_ENV: 'development'
    },
    watch: false,
    autorestart: true
  }]
};
```

#### 3. 启动服务

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

#### 4. 使用浏览器访问

首次访问 `http://localhost:3000`，配置任务后，浏览器可以关闭，任务将继续在后台运行。

---

### 方案三：服务器端 Cron + 脚本

**优点：**
- 最简单直接
- 利用系统 Cron

**缺点：**
- 功能受限
- 需要编写脚本

**实现步骤：**

#### 1. 创建任务脚本

创建 `/opt/xyzw-tasks/daily-signin.js`:

```javascript
const WebSocket = require('ws');

const token = process.env.XYZW_TOKEN;
const wsUrl = 'wss://game.xyzw.my/ws';

const ws = new WebSocket(`${wsUrl}?token=${token}`);

ws.on('open', () => {
  console.log('Connected, sending sign-in request...');
  ws.send(JSON.stringify({
    cmd: 'role:signin:daily',
    body: {},
    ack: 0,
    seq: 1,
    time: Date.now()
  }));
});

ws.on('message', (data) => {
  console.log('Response:', data.toString());
  ws.close();
  process.exit(0);
});

ws.on('error', (error) => {
  console.error('WebSocket error:', error);
  process.exit(1);
});
```

#### 2. 添加到系统 Cron

```bash
crontab -e
```

添加任务：
```
# 每天早上8点执行签到
0 8 * * * XYZW_TOKEN="your_token" node /opt/xyzw-tasks/daily-signin.js >> /var/log/xyzw-tasks.log 2>&1
```

---

## 推荐方案总结

| 方案 | 难度 | 稳定性 | 功能完整性 | 推荐度 |
|------|------|--------|-----------|--------|
| 后端调度服务 | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ✅ 强烈推荐 |
| PM2 + 前端 | ⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ 推荐 |
| 系统 Cron | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐ 可选 |

## 最终建议

**如果你的需求是：**

1. **多账号批量管理** → 使用后端调度服务
2. **定时任务稳定执行** → 使用后端调度服务 + systemd
3. **快速简单方案** → 使用 PM2 + 前端
4. **单账号简单任务** → 使用系统 Cron

**个人推荐：后端调度服务（方案一）**

这是最完整的解决方案，支持：
- 多账号管理
- 复杂定时任务
- 任务执行日志
- RESTful API
- 开机自启
- 完全后台运行

---

## 快速测试

立即测试后端调度服务：

```bash
# 1. 启动服务
cd backend-scheduler
npm install
npm start

# 2. 新开终端，添加测试任务
# 添加 Token（替换为你的实际 Token）
curl -X POST http://localhost:4000/api/tokens \
  -H "Content-Type: application/json" \
  -d '{"name":"测试账号","token":"你的Token"}'

# 查看返回的 tokenId，然后创建任务
curl -X POST http://localhost:4000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "name": "测试签到",
    "cronExpression": "* * * * *",  
    "taskType": "daily_signin",
    "selectedTokens": ["刚才返回的tokenId"],
    "enabled": true
  }'

# 3. 查看日志
tail -f logs/scheduler.log
```

成功后你会看到任务每分钟执行一次。

## 需要帮助？

如果遇到问题，可以：
1. 查看日志：`tail -f logs/scheduler.log`
2. 检查健康状态：`curl http://localhost:4000/api/health`
3. 查看 systemd 日志：`sudo journalctl -u xyzw-scheduler -f`
