# 后端定时任务服务

基于 Node.js + node-cron 实现的云端定时任务执行器。

## 功能特点

- 完全后台运行，无需浏览器
- 支持 Cron 表达式调度
- 支持多账号批量任务
- 任务执行日志记录
- RESTful API 管理
- 支持开机自启（systemd）
- 断线自动重连

## 技术栈

- Node.js
- Express
- node-cron
- ws (WebSocket客户端)
- p-queue (消息队列)

## 快速开始

### 1. 安装依赖

```bash
cd backend-scheduler
npm install
```

### 2. 配置环境变量

```bash
cp .env.example .env
# 编辑 .env 文件，配置 WebSocket 地址等参数
```

### 3. 启动服务

```bash
# 开发模式
npm run dev

# 生产模式
npm start
```

服务将在 `http://localhost:4000` 启动

## API 接口文档

### Token 管理

#### 获取所有 Token
```
GET /api/tokens
```

#### 添加 Token
```
POST /api/tokens
Body: {
  "name": "账号名称",
  "token": "游戏Token",
  "server": "服务器名称",
  "wsUrl": "wss://游戏WebSocket地址",
  "remark": "备注"
}
```

#### 删除 Token
```
DELETE /api/tokens/:id
```

### 定时任务管理

#### 获取所有任务
```
GET /api/tasks
```

#### 创建定时任务
```
POST /api/tasks
Body: {
  "name": "任务名称",
  "cronExpression": "0 0 8 * * *",  // Cron表达式
  "taskType": "daily_signin",       // 任务类型
  "selectedTokens": ["token-id-1", "token-id-2"],  // 选择的账号
  "taskConfig": {},                  // 任务配置
  "enabled": true                    // 是否启用
}
```

#### 更新任务
```
PUT /api/tasks/:id
```

#### 删除任务
```
DELETE /api/tasks/:id
```

#### 立即执行任务
```
POST /api/tasks/:id/execute
```

### 监控

#### 健康检查
```
GET /api/health
Response: {
  "status": "ok",
  "timestamp": "2026-03-03T...",
  "activeJobs": 3,
  "tokens": 10
}
```

#### 查看日志
```
GET /api/logs
```

## 支持的任务类型

### 1. daily_signin - 每日签到
```json
{
  "taskType": "daily_signin",
  "taskConfig": {}
}
```

### 2. arena_fight - 竞技场战斗
```json
{
  "taskType": "arena_fight",
  "taskConfig": {
    "battles": 5,
    "targetId": 12345
  }
}
```

### 3. tower_climb - 爬塔
```json
{
  "taskType": "tower_climb",
  "taskConfig": {
    "floors": 10
  }
}
```

### 4. custom - 自定义命令
```json
{
  "taskType": "custom",
  "taskConfig": {
    "commands": [
      {
        "command": "role:signin:daily",
        "params": {},
        "delay": 1000
      },
      {
        "command": "arena:fight:start",
        "params": { "targetId": 123 },
        "delay": 2000
      }
    ]
  }
}
```

## Cron 表达式示例

```
0 0 8 * * *      # 每天早上8点执行
0 30 12 * * *    # 每天中午12:30执行
0 0 */6 * * *    # 每6小时执行一次
0 0 20 * * 1-5   # 周一到周五晚上8点执行
```

## 开机自启配置（Linux systemd）

### 1. 复制服务文件
```bash
sudo cp xyzw-scheduler.service /etc/systemd/system/
```

### 2. 修改服务文件
编辑 `/etc/systemd/system/xyzw-scheduler.service`，修改：
- `WorkingDirectory`: 实际安装路径
- `User`: 运行用户

### 3. 启用服务
```bash
sudo systemctl daemon-reload
sudo systemctl enable xyzw-scheduler
sudo systemctl start xyzw-scheduler
```

### 4. 查看状态
```bash
sudo systemctl status xyzw-scheduler
```

### 5. 查看日志
```bash
sudo journalctl -u xyzw-scheduler -f
```

## 数据存储

- `data/tokens.json` - Token 数据
- `data/tasks.json` - 任务配置
- `logs/scheduler.log` - 运行日志
- `logs/executions.json` - 任务执行记录

## 与前端集成

前端页面（端口3000）可以通过以下方式与后端调度器交互：

1. **导入 Token**: 前端调用 `POST /api/tokens` 将账号信息同步到后端
2. **创建定时任务**: 前端调用 `POST /api/tasks` 创建后台定时任务
3. **查看日志**: 前端调用 `GET /api/logs` 查看执行日志

## 注意事项

1. 确保 Node.js 版本 >= 14
2. 确保服务器可以访问游戏 WebSocket 地址
3. 定时任务会在服务重启后自动恢复
4. 建议使用 PM2 或 systemd 管理进程

## 使用 PM2 管理（可选）

```bash
# 安装 PM2
npm install -g pm2

# 启动服务
pm2 start server.js --name xyzw-scheduler

# 开机自启
pm2 startup
pm2 save

# 查看日志
pm2 logs xyzw-scheduler
```
