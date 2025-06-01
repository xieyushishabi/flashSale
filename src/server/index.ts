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
// import { csrf } from 'hono/csrf'; // 根据需要启用和配置
import { jwt } from 'hono/jwt'; // 根据需要启用和配置

// 1. 导入配置模块 (这将首先执行，加载 .env.development)
import config from './config';

// 2. 导入数据库连接函数及导出的实例 (db, mongo)
import { connectToDatabase, closeDatabaseConnection } from './utils/database';

// 3. 导入路由模块
import authRoutes from './routes/auth';
import productsRoutes from './routes/products';
import seckillRoutes from './routes/seckill';
import healthRoutes from './routes/health'; // Import health check routes
// import { orderRoutes } from './routes/orders'; // 假设这些存在或将被添加
// import { paymentRoutes } from './routes/payment';
// import { userRoutes } from './routes/users';
// import { cartRoutes } from './routes/cart';


// 4. 导入其他服务模块
import { initializeQueues, rabbitmq, QueueNames /*, MessagePublisher*/ } from './utils/rabbitmq'; // Use 'rabbitmq' as exported by the module
import { WebSocketService } from './websocket'; // WebSocketService will handle upgrades
import { SeckillStockManager, redis } from './utils/redis'; // Import SeckillStockManager class and redis instance
import type { IncomingMessage } from 'http';
import type { Duplex } from 'stream';
import { URL } from 'url'; // For parsing request.url in upgrade handler

const app = new Hono(); // 创建一个 Hono app 实例

async function main() {
  try {
    // --- 初始化阶段 ---
    console.log('[Main] Starting server initialization...');
    console.log('[Main] Configuration loaded:');
    console.log(`[Main]   Server Port: ${config.SERVER_PORT}`);
    console.log(`[Main]   Database URL: ${config.DATABASE_URL ? 'Loaded' : 'MISSING!'}`);
    console.log(`[Main]   JWT Secret: ${config.JWT_SECRET ? 'Loaded' : 'MISSING/Default'}`);
    // 在此添加其他相关配置日志

    // 连接数据库
    console.log('[Main] Connecting to database...');
    await connectToDatabase();
    console.log('[Main] Database connection attempt finished.');

    if (!global.db || !global.mongo || !global.mongo.ObjectId) { // Check for global.db (Db instance) and global.mongo (driver for ObjectId)
      console.error('[Main] FATAL: global.db or global.mongo.ObjectId is not available. Check database.ts.');
      process.exit(1);
    }
    console.log('[Main] Verified: Global db and mongo instances are available.');
    console.log(`[Main]   mongo.ObjectId is ${typeof mongo.ObjectId === 'function' ? 'available' : 'NOT available'}`);


    // 初始化 RabbitMQ 队列
    console.log('[Main] Initializing RabbitMQ queues...');
    await initializeQueues();
    console.log('[Main] RabbitMQ queues initialized.');

    // --- 中间件设置 ---
    console.log('[Main] Setting up Hono middleware...');
    app.use('*', logger());
    app.use('*', cors({
      origin: '*', // 根据生产环境需要配置
      allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowHeaders: ['Content-Type', 'Authorization'],
    }));
    app.use('*', secureHeaders());
    // app.use('*', csrf()); // 如果需要，启用并配置
    // JWT 中间件 (示例, 保护 /api/secure/* 路由)
    if (config.JWT_SECRET && config.JWT_SECRET !== 'YOUR_DEFAULT_JWT_SECRET_REPLACE_ME') {
      app.use('/api/secure/*', jwt({ secret: config.JWT_SECRET }));
      console.log('[Main] JWT middleware configured for /api/secure/*');
    } else {
      console.warn('[Main] JWT_SECRET is not set or is the default placeholder. JWT protected routes will not be secure. Please set a strong JWT_SECRET in your .env.development file.');
    }

    // --- 路由注册 ---
    console.log('[Main] Registering API routes...');
    app.route('/api/auth', authRoutes);
    app.route('/api/products', productsRoutes);
    app.route('/api/seckill', seckillRoutes);
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
        console.error('[Main] Error fetching system stats:', error);
        return c.json({ success: false, message: 'Failed to retrieve system statistics' }, 500);
      }
    });

    // --- RabbitMQ 消费者设置 ---
    console.log('[Main] Setting up RabbitMQ consumers...');
    // 订单处理消费者
    await rabbitmq.consume(QueueNames.ORDER_PROCESSING, async (message) => {
      console.log('[RabbitMQ] Received order for processing:', message.data);
      const { orderId, userId, productId } = message.data; // 假设此结构
      try {
        // 模拟订单处理
        await new Promise(resolve => setTimeout(resolve, 1000));
        await db.collection('12a2d3dc_orders').updateOne( // 使用实际的集合名称
          { _id: new mongo.ObjectId(orderId) },
          { $set: { status: 'confirmed', updatedAt: new Date() } }
        );
        WebSocketService.sendOrderStatus(userId, orderId, 'confirmed');
        console.log(`[RabbitMQ] Order ${orderId} processed and confirmed.`);
      } catch (error) {
        console.error(`[RabbitMQ] Error processing order ${orderId}:`, error);
        // 如果需要，实现重试或死信队列逻辑
      }
    });

    // 秒杀通知消费者
    await rabbitmq.consume(QueueNames.SECKILL_NOTIFICATIONS, async (message) => {
      console.log('[RabbitMQ] Received seckill notification:', message.data);
      const { productId, stockLeft, status } = message.data; // status 可以是 'active', 'sold_out'
      try {
        WebSocketService.sendStockUpdate(productId, stockLeft);
        if (status === 'sold_out' || stockLeft === 0) {
           WebSocketService.sendSeckillStatus(productId, 'sold_out');
           console.log(`[RabbitMQ] Product ${productId} is sold out. Notified clients.`);
           // 如果秒杀逻辑尚未处理，则可选择在数据库中更新商品状态
           // await db.collection('12a2d3dc_products').updateOne(
           //   { _id: new mongo.ObjectId(productId) },
           //   { $set: { status: 'ended', seckillStatus: 'sold_out', updatedAt: new Date() } }
           // );
        }
      } catch (error) {
        console.error(`[RabbitMQ] Error processing seckill notification for ${productId}:`, error);
      }
    });

    // 统计更新消费者 (示例)
    await rabbitmq.consume(QueueNames.STATS_UPDATE, async (message) => {
      console.log('[RabbitMQ] Received stats update:', message.data);
      // 实现更新/广播实时统计数据的逻辑
    });
    console.log('[Main] RabbitMQ consumers set up.');

    // --- 全局错误处理程序 ---
    app.onError((err, c) => {
      console.error('[Main] Hono global error:', err);
      // 如果需要，记录更详细的错误以进行调试
      // console.error(err.stack);
      return c.json({ error: 'Internal Server Error', message: err.message }, 500);
    });

    // --- 服务器启动 ---
    const PORT = parseInt(String(config.SERVER_PORT || '8080'), 10);

    const server = serve({
      fetch: app.fetch,
      port: PORT,
    }, (info) => {
      console.log(`[Main] Server listening on http://localhost:${info.port}`);
    });

    server.on('upgrade', (req: IncomingMessage, socket: Duplex, head: Buffer) => {
      const { pathname } = req.url ? new URL(req.url, `http://${req.headers.host}`) : { pathname: null };
      
      if (pathname === '/ws') {
        WebSocketService.handleUpgrade(req, socket, head);
      } else {
        console.warn(`[Server] Received upgrade request for non-/ws path ${pathname}, destroying socket.`);
        socket.destroy();
      }
    });

  } catch (error) {
    console.error('[Main] FATAL: A critical error occurred during server startup:', error);
    await closeDatabaseConnection(); // Attempt to close DB connection on fatal error
    process.exit(1); // Exit if critical setup fails
  }
}

// --- 应用程序入口点 ---
main();

// --- 优雅关机处理 ---
async function gracefulShutdown(signal: string) {
  console.log(`[Main] Received ${signal}. Initiating graceful shutdown...`);
  try {
    // 如果 `serve` 未完全处理，则添加任何特定的服务器关闭逻辑
    // 例如, WebSocketService.closeAllConnections();
    await closeDatabaseConnection();

    // 在此添加其他清理任务
    console.log('[Main] All resources cleaned up. Server shutting down.');
    process.exit(0);
  } catch (error) {
    console.error('[Main] Error during graceful shutdown:', error);
    process.exit(1);
  }
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
