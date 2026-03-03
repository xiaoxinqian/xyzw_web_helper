# 需求实施计划

## 项目概述

基于 Node.js + node-cron 实现的后端定时任务调度服务，为 XYZW 游戏提供完全后台运行的自动化任务执行能力。

---

- [ ] 1. 项目初始化和基础结构搭建
   - 创建项目目录结构（managers/、scheduler/、executors/、utils/、logs/、data/）
   - 初始化 package.json 并配置依赖项
   - 配置环境变量文件（.env.example）
   - 配置 .gitignore 文件

- [ ] 2. 核心工具模块实现
  - [ ] 2.1 实现日志工具模块
     - 创建 utils/logger.js，实现日志分级（INFO、ERROR、WARN、DEBUG）
     - 实现日志文件写入功能
     - 实现控制台日志输出（开发环境）
     - 确保日志目录自动创建

  - [ ] 2.2 实现 WebSocket 客户端
     - 创建 utils/WebSocketClient.js
     - 实现 WebSocket 连接管理（connect、disconnect）
     - 实现消息发送和响应处理
     - 实现消息队列机制（使用 p-queue）
     - 实现断线自动重连机制（最多5次重试）
     - 实现消息超时处理（默认8秒）

  - [ ]* 2.3 为工具模块编写单元测试
     - 编写日志工具测试用例
     - 编写 WebSocket 客户端测试用例（使用 mock）

- [ ] 3. 数据管理模块实现
  - [ ] 3.1 实现 Token 管理器
     - 创建 managers/TokenManager.js
     - 实现 Token 添加功能（自动生成 UUID）
     - 实现 Token 查询功能（单个查询、全部查询）
     - 实现 Token 更新功能
     - 实现 Token 删除功能
     - 实现数据持久化（data/tokens.json）
     - 实现从磁盘加载数据功能

  - [ ] 3.2 实现任务管理器
     - 创建 managers/TaskManager.js
     - 实现任务添加功能（支持 Cron 表达式）
     - 实现任务查询功能（单个查询、全部查询）
     - 实现任务更新功能（包括启用/禁用）
     - 实现任务删除功能
     - 实现数据持久化（data/tasks.json）
     - 实现从磁盘加载数据功能
     - 记录任务最后执行时间

  - [ ]* 3.3 为数据管理模块编写单元测试
     - 编写 Token 管理器测试用例
     - 编写任务管理器测试用例
     - 测试数据持久化和加载功能

- [ ] 4. 检查点 - 核心模块验证
   - 确保所有测试通过，如有疑问请询问用户
   - 验证日志工具正常工作
   - 验证数据管理器的增删改查功能

- [ ] 5. 任务执行引擎实现
  - [ ] 5.1 实现任务执行器
     - 创建 executors/TaskExecutor.js
     - 实现任务执行主流程（遍历所有 Token）
     - 实现每日签到任务（daily_signin）
     - 实现竞技场战斗任务（arena_fight）
     - 实现爬塔任务（tower_climb）
     - 实现自定义命令任务（custom）
     - 实现任务执行结果收集和返回
     - 实现错误处理和异常捕获

  - [ ] 5.2 实现任务调度器
     - 创建 scheduler/TaskScheduler.js
     - 集成 node-cron 实现 Cron 调度
     - 实现任务调度功能（scheduleTask）
     - 实现任务取消调度功能（unscheduleTask）
     - 实现立即执行功能（executeTaskNow）
     - 实现任务执行日志记录（logs/executions.json）
     - 实现活跃任务查询功能
     - 支持时区设置（Asia/Shanghai）

  - [ ]* 5.3 为任务执行引擎编写单元测试
     - 编写任务执行器测试用例（使用 mock WebSocket）
     - 编写任务调度器测试用例
     - 测试 Cron 表达式解析和调度准确性

- [ ] 6. RESTful API 服务实现
  - [ ] 6.1 实现主服务入口
     - 创建 server.js 作为服务入口
     - 配置 Express 应用（端口、CORS、JSON 解析）
     - 实现服务启动逻辑（加载已有数据、启动调度）
     - 实现优雅关闭处理

  - [ ] 6.2 实现 Token 管理 API
     - GET /api/tokens - 获取所有 Token
     - POST /api/tokens - 添加 Token
     - DELETE /api/tokens/:id - 删除 Token
     - 实现请求参数验证
     - 实现错误响应处理

  - [ ] 6.3 实现任务管理 API
     - GET /api/tasks - 获取所有任务
     - POST /api/tasks - 创建定时任务
     - PUT /api/tasks/:id - 更新任务
     - DELETE /api/tasks/:id - 删除任务
     - POST /api/tasks/:id/execute - 立即执行任务
     - 实现请求参数验证
     - 实现错误响应处理
     - 任务变更时自动更新调度器

  - [ ] 6.4 实现监控 API
     - GET /api/health - 健康检查接口
     - GET /api/logs - 查看运行日志
     - 返回服务状态和统计信息

  - [ ]* 6.5 为 API 服务编写集成测试
     - 编写 Token API 测试用例
     - 编写任务 API 测试用例
     - 编写监控 API 测试用例

- [ ] 7. 检查点 - 功能完整性验证
   - 确保所有测试通过，如有疑问请询问用户
   - 验证 API 接口可正常访问
   - 验证任务调度功能正常工作

- [ ] 8. 生产环境配置
  - [ ] 8.1 配置进程管理
     - 创建 systemd 服务文件（xyzw-scheduler.service）
     - 配置服务自动重启策略
     - 配置日志输出到 syslog

  - [ ] 8.2 编写部署文档
     - 编写 README.md 包含快速开始指南
     - 编写 API 接口文档
     - 编写任务类型说明文档
     - 编写开机自启配置指南

  - [ ] 8.3 创建示例配置文件
     - 创建 .env.example 包含所有配置项
     - 添加 Cron 表达式示例
     - 添加任务配置示例

- [ ] 9. 最终验证
   - 完整测试服务启动流程
   - 测试 Token 管理完整流程（添加、查询、删除）
   - 测试任务管理完整流程（创建、调度、执行、删除）
   - 测试数据持久化（重启后数据恢复）
   - 验证日志记录功能
   - 验证健康检查接口

---

## 实施说明

### 开发优先级

1. **核心功能优先**：先实现数据管理、任务调度、API 服务
2. **测试后置**：测试任务标记为可选（*），优先保证核心功能可用
3. **渐进式开发**：每个模块完成后进行验证，确保基础功能正常

### 关键技术点

- **Cron 调度**：使用 node-cron 实现，支持标准 Cron 表达式
- **WebSocket 连接**：实现自动重连和消息队列机制
- **数据持久化**：使用 JSON 文件存储，简单可靠
- **错误处理**：完善的异常捕获和日志记录

### 依赖项说明

```json
{
  "express": "Web 框架",
  "cors": "跨域支持",
  "node-cron": "Cron 调度器",
  "ws": "WebSocket 客户端",
  "p-queue": "消息队列",
  "axios": "HTTP 客户端",
  "dotenv": "环境变量管理"
}
```

### 验收标准

- [ ] 服务可以正常启动并监听端口
- [ ] API 接口响应正常，返回格式正确
- [ ] Token 可以正常添加、查询、删除
- [ ] 任务可以正常创建、调度、执行、删除
- [ ] Cron 调度准确执行
- [ ] 数据持久化正常，重启后可恢复
- [ ] 日志记录完整
- [ ] 健康检查接口返回正确状态
