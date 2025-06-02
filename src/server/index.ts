// src/server/index.ts
/**
 * 服务端入口文件
 * 整合所有技术栈，构建完整的秒购宝电商闪购系统后端
 * 技术栈：Node.js + Hono + MongoDB + Redis + RabbitMQ + WebSocket + Elasticsearch + JWT
 */

import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { secureHeaders } from 'hono/secure-headers';
import { HTTPException } from 'hono/http-exception';

import fs from 'fs/promises'; // 用于异步文件操作
import path from 'path'; // 用于处理文件路径
// import { csrf } from 'hono/csrf'; // 根据需要启用和配置
import { jwt } from 'hono/jwt'; // 根据需要启用和配置
import { authenticateToken } from './middleware/auth'; // For custom JWT authentication

console.log('[ProcessDiag] Script execution started. Registering basic exit handler.');
process.on('exit', (code) => {
  console.log(`[ProcessDiag] MINIMAL EXIT HANDLER FIRED. Exit Code: ${code}`);
});

// 1. 导入配置模块 (这将首先执行，加载 .env.development)
import config from './config';
import appLogger from './utils/logger';

// 2. 导入数据库连接函数及导出的实例 (db, mongo)
import { connectToDatabase, closeDatabaseConnection } from './utils/database';

// 3. 导入路由模块
import authRoutes from './routes/auth';
import productsRoutes from './routes/products';
import seckillRoutes from './routes/seckill';
import healthRoutes from './routes/health'; // Import health check routes
import { orderRoutes } from './routes/orders'; // 假设这些存在或将被添加

import { rabbitMQService } from './utils/rabbitmq'; // 假设这些存在或将被添加
// import { paymentRoutes } from './routes/payment';
// import { userRoutes } from './routes/users';
// import { cartRoutes } from './routes/cart';


// 4. 导入其他服务模块

import { WebSocketService } from './websocket'; // WebSocketService will handle upgrades
import { SeckillStockManager, redis, redisConnectionPromise } from './utils/redis'; // Import SeckillStockManager class and redis instance
import type { IncomingMessage, Server as HttpServerType } from 'http'; // For WebSocket upgrade and server type
import type { Http2Server, Http2SecureServer } from 'http2'; // Import http2 related types
import type { Duplex } from 'stream';
import { URL } from 'url'; // For parsing request.url in upgrade handler

let serverInstance: HttpServerType | Http2Server | Http2SecureServer | null = null;

// 定义 RabbitMQ 队列名称常量
const ORDER_PROCESSING_QUEUE = 'order_processing_queue';
const SECKILL_NOTIFICATIONS_QUEUE = 'seckill_notifications_queue';
const STATS_UPDATE_QUEUE = 'stats_update_queue';
const app = new Hono(); // 创建一个 Hono app 实例

async function main() {
  try {
    // --- 初始化阶段 ---
    appLogger.info('[Main] Starting server initialization...');
    appLogger.info('[Main] Configuration loaded:');
    appLogger.info(`[Main]   Server Port: ${config.SERVER_PORT}`);
    appLogger.info(`[Main]   Database URL: ${config.DATABASE_URL ? 'Loaded' : 'MISSING!'}`);
    appLogger.info(`[Main]   JWT Secret: ${config.JWT_SECRET ? 'Loaded' : 'MISSING/Default'}`);
    // 在此添加其他相关配置日志

    // 等待 Redis 连接成功
    appLogger.info('[Main] Waiting for Redis connection...');
    const redisClient = await redisConnectionPromise;
    if (!redisClient) {
      appLogger.error('[Main] FATAL: Redis client failed to connect after multiple retries. Exiting.');
      process.exit(1);
    }
    appLogger.info('[Main] Redis client connected and ready.');

    // 连接数据库
    appLogger.info('[Main] Connecting to database...');
    await connectToDatabase();
    appLogger.info('[Main] Database connection attempt finished.');

    if (!global.db || !global.mongo || !global.mongo.ObjectId) { // Check for global.db (Db instance) and global.mongo (driver for ObjectId)
      appLogger.error('[Main] FATAL: global.db or global.mongo.ObjectId is not available. Check database.ts.');
      process.exit(1);
    }
    appLogger.info('[Main] Verified: Global db and mongo instances are available.');
    appLogger.info(`[Main]   mongo.ObjectId is ${typeof mongo.ObjectId === 'function' ? 'available' : 'NOT available'}`);


    // 初始化 RabbitMQ 服务连接
    appLogger.info('[Main] Initializing RabbitMQ service connection...');
    try {
      await rabbitMQService.connect();
      appLogger.info('[Main] RabbitMQ service connected successfully.');
    } catch (error) {
      appLogger.error('[Main] FATAL: Failed to connect to RabbitMQ service.', error);
      process.exit(1); // 连接失败则退出
    }

    // --- 中间件设置 ---
    appLogger.info('[Main] Setting up Hono middleware...');
    app.use('*', logger());
    app.use('*', cors({
      origin: '*', // 根据生产环境需要配置
      allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowHeaders: ['Content-Type', 'Authorization'],
    }));
    app.use('*', secureHeaders());
    // app.use('*', csrf()); // 如果需要，启用并配置

    // JWT middleware for /api/secure/* is handled by the secureRoutes instance

    // --- 路由注册 ---
    appLogger.info('[Main] Registering API routes...');
    app.route('/api/auth', authRoutes);
    app.route('/api/products', productsRoutes);
  app.route('/api/seckill', seckillRoutes);

    // 安全路由组，需要JWT认证
    const secureRoutes = new Hono();
    secureRoutes.use('*', authenticateToken); // 应用自定义JWT中间件到所有 /api/secure/* 路由

    // Error handler for secure routes to ensure JSON responses for JWT errors
    secureRoutes.onError((err, c) => {
      appLogger.error('[Secure Routes Error] Error occurred:', err.message);
      if (err instanceof HTTPException && err.status === 401) {
        return c.json({ error: 'Authentication failed', message: err.message }, 401);
      }
      // For other errors within secure routes, you might want a generic JSON error response
      return c.json({ error: 'An unexpected error occurred', message: err.message }, (err instanceof HTTPException ? err.status : 500));
    });

    // 新增：获取应用日志的API接口
    secureRoutes.get('/ping', (c) => {
      appLogger.info('[Secure Routes Test] GET /api/secure/ping reached');
      return c.json({ success: true, message: 'pong from /api/secure/ping', userId: c.get('jwtPayload')?.userId });
    });

    secureRoutes.get('/logs', async (c) => {
      const page = parseInt(c.req.query('page') || '1', 10);
      const limit = parseInt(c.req.query('limit') || '50', 10);
      const logFilePath = path.join(process.cwd(), 'logs', 'app.log');

      try {
        const fileContent = await fs.readFile(logFilePath, 'utf-8');
        const lines = fileContent.split('\n').filter(line => line.trim() !== ''); // 按行分割并移除空行
        
        const parsedLogs: any[] = [];
        let lastKnownTimestamp: string | null = null; 

        for (const line of lines) {
          try {
            const logEntry = JSON.parse(line);
            parsedLogs.push({
              timestamp: logEntry.timestamp || new Date().toISOString(),
              level: logEntry.level || 'INFO',
              category: logEntry.category || 'default',
              message: logEntry.message || line, 
              hostname: logEntry.hostname,
              pid: logEntry.pid,
              stack: logEntry.stack,
              isJson: true 
            });
            if (logEntry.timestamp) {
              lastKnownTimestamp = logEntry.timestamp;
            }
          } catch (parseError) {
            appLogger.warn(`[LogsAPI] Failed to parse log line as JSON: "${line.substring(0, 100)}..." Attempting fallback.`);
            
            // Updated regex to match format: [TIMESTAMP_ISO_Z] [LEVEL] [CATEGORY] [Host: HOSTNAME] [PID: PID_NUMBER] MESSAGE
            const textLogRegex = /^\[(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)\]\s+\[([A-Z]+)\]\s+\[([\w.-]+)\]\s+\[Host:\s*([^\s\]]+)\]\s+\[PID:\s*(\d+)\]\s*(.*)$/;
            const match = line.match(textLogRegex);

            if (match) {
              parsedLogs.push({
                timestamp: match[1],
                level: match[2].toUpperCase(),
                category: match[3],
                hostname: match[4], // Captured Hostname
                pid: match[5],      // Captured PID
                message: match[6].trim(), // Rest of the line as message
                isJson: false,
                isPatternMatched: true,
                patternSource: 'complex'
              });
              if (match[1]) {
                lastKnownTimestamp = match[1];
              }
            } else {
              // Fallback to a simpler text log regex if the complex one fails
              const simpleTextLogRegex = /^(\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}\.\d{3})\s+\[([A-Z]+)\]\s+([\w.-]+)\s+-\s+(.*)$/;
              const simpleMatch = line.match(simpleTextLogRegex);
              if (simpleMatch) {
                parsedLogs.push({
                  timestamp: simpleMatch[1],
                  level: simpleMatch[2].toUpperCase(),
                  category: simpleMatch[3],
                  message: simpleMatch[4].trim(),
                  isJson: false,
                  isPatternMatched: true,
                  patternSource: 'simple'
                });
                if (simpleMatch[1]) {
                  lastKnownTimestamp = simpleMatch[1];
                }
              } else {
              parsedLogs.push({
                timestamp: lastKnownTimestamp || new Date().toISOString(),
                level: 'RAW',
                category: 'unknown',
                message: line,
                isJson: false,
                isPatternMatched: false,
                patternSource: 'none'
              });
            }
          } // Closes 'else' block from line 187
        } // Closes 'catch (parseError)' block from line 148
        } // Closes 'for (const line of lines)' loop from line 132

        // 最新的日志在文件末尾，所以反转数组使最新的日志在前面
        const reversedLogs = parsedLogs.reverse();

        const totalItems = reversedLogs.length;
        const totalPages = Math.ceil(totalItems / limit);
        const startIndex = (page - 1) * limit;
        const paginatedLogs = reversedLogs.slice(startIndex, startIndex + limit);

        return c.json({
          logs: paginatedLogs,
          currentPage: page,
          totalPages,
          totalItems,
          limit,
        });

      } catch (error: any) {
        if (error.code === 'ENOENT') {
          appLogger.error('[LogsAPI] Log file not found:', logFilePath);
          return c.json({ logs: [], currentPage: page, totalPages: 0, totalItems: 0, limit, message: 'Log file not found.' }, 404);
        }
        appLogger.error('[LogsAPI] Error reading log file:', error);
        return c.json({ logs: [], currentPage: page, totalPages: 0, totalItems: 0, limit, message: 'Error reading or processing log file.' }, 500);
      }
    });

    // 在新的 secureRoutes 实例中集成 seckill 和 orders 路由
    secureRoutes.route('/seckill', seckillRoutes);
    secureRoutes.route('/orders', orderRoutes); // Assuming orderRoutes is defined and needs protection

    // 将安全路由组应用到主应用实例
    app.route('/api/secure', secureRoutes);
    // app.route('/api/seckill', seckillRoutes); // Now handled by secureRoutes
    app.route('/api/health', healthRoutes); // Register health check route
    // app.route('/api/orders', orderRoutes);
    // app.route('/api/payment', paymentRoutes);
    // app.route('/api/users', userRoutes);
    // app.route('/api/cart', cartRoutes);


    // 系统统计路由 (来自原始代码, 清理后)
    app.get('/api/system/stats', async (c) => {
      try {
        const [userCount, productCount, orderCount] = await Promise.all([
          db.collection('12a2d3dc_users').countDocuments(), // 使用实际的集合名称
          db.collection('12a2d3dc_products').countDocuments(),
          db.collection('12a2d3dc_orders').countDocuments(),
        ]);
        const wsStats = WebSocketService.getStats();
        return c.json({
          success: true,
          data: {
            users: userCount,
            products: productCount,
            orders: orderCount,
            activeConnections: wsStats.activeConnections,
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            timestamp: new Date().toISOString(),
          }
        });
      } catch (error) {
        appLogger.error('[Main] Error fetching system stats:', error);
        return c.json({ success: false, message: 'Failed to retrieve system statistics' }, 500);
      }
    });

    // --- 声明 RabbitMQ 队列 ---
    appLogger.info('[Main] Asserting RabbitMQ queues...');
    try {
      await rabbitMQService.assertQueue(ORDER_PROCESSING_QUEUE, { durable: true });
      appLogger.info(`[Main] Queue ${ORDER_PROCESSING_QUEUE} asserted.`);
      await rabbitMQService.assertQueue(SECKILL_NOTIFICATIONS_QUEUE, { durable: true });
      appLogger.info(`[Main] Queue ${SECKILL_NOTIFICATIONS_QUEUE} asserted.`);
      await rabbitMQService.assertQueue(STATS_UPDATE_QUEUE, { durable: true });
      appLogger.info(`[Main] Queue ${STATS_UPDATE_QUEUE} asserted.`);
    } catch (error) {
      appLogger.error('[Main] FATAL: Failed to assert RabbitMQ queues.', error);
      process.exit(1); // 声明队列失败则退出
    }

    // --- RabbitMQ 消费者设置 ---
    appLogger.info('[Main] Setting up RabbitMQ consumers...');
    // 订单处理消费者
    await rabbitMQService.consumeMessage(ORDER_PROCESSING_QUEUE, async (msg, channel) => {
      if (!msg) { appLogger.warn('[RabbitMQ] Received null message for ORDER_PROCESSING. Ignoring.'); return; }
      const messageData = JSON.parse(msg.content.toString());
      const { orderId, userId, productId } = messageData;
      appLogger.info(`[RabbitMQ] Received order ${orderId} for processing.`);
      try {
        // 模拟订单处理
        await new Promise(resolve => setTimeout(resolve, 1000));
        await db.collection('12a2d3dc_orders').updateOne( // 使用实际的集合名称
          { _id: new mongo.ObjectId(orderId) },
          { $set: { status: 'confirmed', updatedAt: new Date() } }
        );
        WebSocketService.sendOrderStatus(userId, orderId, 'confirmed');
        appLogger.info(`[RabbitMQ] Order ${orderId} processed and confirmed.`);
        rabbitMQService.ackMessage(msg);
      } catch (error) {
        appLogger.error(`[RabbitMQ] Error processing order:`, error);
        if (msg) { rabbitMQService.nackMessage(msg, false, true); }
        // 如果需要，实现重试或死信队列逻辑
      }
    });

    // 秒杀通知消费者
    await rabbitMQService.consumeMessage(SECKILL_NOTIFICATIONS_QUEUE, async (msg, channel) => {
      if (!msg) { appLogger.warn('[RabbitMQ] Received null message for SECKILL_NOTIFICATIONS. Ignoring.'); return; }
      const messageData = JSON.parse(msg.content.toString());
      appLogger.info('[RabbitMQ] Received seckill notification:', messageData);
      const { productId, stockLeft, status } = messageData; // status 可以是 'active', 'sold_out'
      try {
        WebSocketService.sendStockUpdate(productId, stockLeft);
        if (status === 'sold_out' || stockLeft === 0) {
           WebSocketService.sendSeckillStatus(productId, 'sold_out');
           appLogger.info(`[RabbitMQ] Product ${productId} is sold out. Notified clients.`);
           // 如果秒杀逻辑尚未处理，则可选择在数据库中更新商品状态
           // await db.collection('12a2d3dc_products').updateOne(
           //   { _id: new mongo.ObjectId(productId) },
           //   { $set: { status: 'ended', seckillStatus: 'sold_out', updatedAt: new Date() } }
           // );
        }
        rabbitMQService.ackMessage(msg); // Acknowledge the message after successful processing
      } catch (error) {
        appLogger.error(`[RabbitMQ] Error processing seckill notification for ${productId}:`, error);
        if (msg) { rabbitMQService.nackMessage(msg, false, true); }
      }
    });

    // 统计更新消费者 (示例)
    await rabbitMQService.consumeMessage(STATS_UPDATE_QUEUE, async (msg, channel) => {
      if (!msg) { appLogger.warn('[RabbitMQ] Received null message for STATS_UPDATE. Ignoring.'); return; }
      const messageData = JSON.parse(msg.content.toString());
      appLogger.info('[RabbitMQ] Received stats update:', messageData);
      // TODO: Implement actual stats update logic
      // For now, just ack the message
      rabbitMQService.ackMessage(msg);
      // 实现更新/广播实时统计数据的逻辑
    });
    appLogger.info('[Main] RabbitMQ consumers set up.');

    // --- 全局错误处理程序 ---
    app.onError((err, c) => {
      appLogger.error('[Main] Hono global error:', err);
      // 如果需要，记录更详细的错误以进行调试
      // appLogger.error(err.stack);
      // 如果需要，记录更详细的错误以进行调试
      // logger.error(err.stack);
      return c.json({ error: 'Internal Server Error', message: err.message }, 500);
    });

    // --- 服务器启动 ---
    const PORT = parseInt(String(config.SERVER_PORT || '8080'), 10);

    const server = serve({
      fetch: app.fetch,
      port: PORT,
    }, (info: { port: number; address: string; family: string; }) => {
      appLogger.info(`[Main] Server listening on http://localhost:${info.port}`);
    });
    serverInstance = server; // Assign to the global serverInstance

    server.on('error', (err: Error) => {
      appLogger.error('[Main] HTTP Server instance error:', err);
      // Optionally, force exit with error code if a server error occurs
      // process.exit(1);
    });

    server.on('upgrade', (req: IncomingMessage, socket: Duplex, head: Buffer) => {
      const { pathname } = req.url ? new URL(req.url, `http://${req.headers.host}`) : { pathname: null };
      
      if (pathname === '/ws') {
        WebSocketService.handleUpgrade(req, socket, head);
      } else {
        appLogger.warn(`[Server] Received upgrade request for non-/ws path ${pathname}, destroying socket.`);
        socket.destroy();
      }
    });

    appLogger.info('[Main] Server setup complete. Adding indefinite promise to keep process alive for debugging...');
    await new Promise(() => {}); // Keep process alive indefinitely for debugging

  } catch (error) {
    appLogger.error('[Main] FATAL: A critical error occurred during server startup:', error);
    await closeDatabaseConnection(); // Attempt to close DB connection on fatal error
    process.exit(1); // Exit if critical setup fails
  }
}

// --- 应用程序入口点 ---
main();

// --- 优雅关机处理 ---
async function gracefulShutdown(signal: string) {
  appLogger.info(`[Main] Received ${signal}. Initiating graceful shutdown...`);
  const timeout = 10000; // 10 seconds timeout for shutdown operations
  let exitCode = 0;

  try {
    // 1. Stop accepting new HTTP requests
    if (serverInstance) {
      appLogger.info('[Shutdown] Closing HTTP server...');
      await new Promise<void>((resolve, reject) => {
        const serverCloseTimer = setTimeout(() => {
          appLogger.warn('[Shutdown] HTTP server close timed out.');
          reject(new Error('HTTP server close timed out'));
        }, timeout);

        serverInstance.close((err?: Error) => { // close callback can have an optional error
          clearTimeout(serverCloseTimer);
          if (err) {
            appLogger.error('[Shutdown] Error closing HTTP server:', err);
            exitCode = 1; // Mark for non-zero exit if server close fails
            return reject(err);
          }
          appLogger.info('[Shutdown] HTTP server closed.');
          resolve();
        });
      });
    } else {
      appLogger.info('[Shutdown] HTTP server instance not found, skipping closure.');
    }

    // 2. Close WebSocket connections (Module or method might not exist yet)
    // if (typeof WebSocketService?.closeAllConnections === 'function') {
    //   appLogger.info('[Shutdown] Closing WebSocket connections...');
    //   await WebSocketService.closeAllConnections();
    //   appLogger.info('[Shutdown] WebSocket connections closed.');
    // } else {
    //   appLogger.info('[Shutdown] WebSocketService or closeAllConnections method not found, skipping.');
    // }
    
    // 3. Close RabbitMQ connection (Module or method might not exist yet)
    // if (rabbitmq && typeof rabbitmq.closeConnection === 'function') {
    //     appLogger.info('[Shutdown] Closing RabbitMQ connection...');
    //     await rabbitmq.closeConnection();
    //     appLogger.info('[Shutdown] RabbitMQ connection closed.');
    // } else {
    //     appLogger.info('[Shutdown] RabbitMQ service not initialized or closeConnection not available, skipping.');
    // }

    // 4. Close Database connection
    appLogger.info('[Shutdown] Closing database connection...');
    await closeDatabaseConnection();
    appLogger.info('[Shutdown] Database connection closed.');

  } catch (error) {
    appLogger.error('[Shutdown] Error during graceful shutdown:', error);
    exitCode = 1;
  } finally {
    appLogger.info(`[Shutdown] Graceful shutdown sequence completed. Exiting with code ${exitCode}.`);
    process.exit(exitCode);
  }
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
