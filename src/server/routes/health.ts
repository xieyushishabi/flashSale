import { Hono } from 'hono';
import { SeckillStockManager } from '../utils/redis'; // Import for testing syncStockFromDB
import logger from '../utils/logger';
import { connectToDatabase, getDbInstance } from '../utils/database';
import { rabbitMQService } from '../utils/rabbitmq';
import { redis } from '../utils/redis'; // Assuming redis instance is exported

const healthRoutes = new Hono();

healthRoutes.get('/', async (c) => {
  let dbStatus = 'disconnected';
  try {
    // Use getDbInstance to get the database instance and ping it
    const dbInstance = getDbInstance();
    await dbInstance.command({ ping: 1 });
    dbStatus = 'connected';
  } catch (e) {
    console.error('[HealthCheck] DB ping failed:', e.message);
    dbStatus = 'error';
  }

  // For mock services, we can check if their instances exist
  const rabbitmqStatus = rabbitMQService && typeof rabbitMQService.isConnected === 'function' ? (rabbitMQService.isConnected() ? 'connected' : 'disconnected') : 'unavailable (service not fully initialized)';
  // Ensure RabbitMQ service is connected for a more accurate health check, if not already connected by index.ts
  // await rabbitMQService.connect(); // Optional: uncomment if health check should force a connection attempt
  const redisStatus = redis ? 'available' : 'unavailable';

  let syncedStockFromDB = -1;
  const testProductId = '683d7a09e7d2f68782eb6bc7'; // Product ID from user logs
  try {
    logger.info(`[Health Check] Testing SeckillStockManager.syncStockFromDB for productId: ${testProductId}`);
    syncedStockFromDB = await SeckillStockManager.syncStockFromDB(testProductId);
    logger.info(`[Health Check] SeckillStockManager.syncStockFromDB returned: ${syncedStockFromDB} for productId: ${testProductId}`);
  } catch (error) {
    logger.error(`[Health Check] Error calling SeckillStockManager.syncStockFromDB for ${testProductId}:`, error);
  }

  return c.json({
    status: 'ok',
    message: '秒购宝电商闪购系统 API is healthy!',
    timestamp: new Date().toISOString(),
    services: {
      mongodb: dbStatus,
      rabbitmq: rabbitmqStatus,
      redis: redisStatus,
    },
    test_syncStockFromDB: {
      productId: testProductId,
      stockFromDB_via_sync: syncedStockFromDB,
      note: 'This is a temporary test for syncStockFromDB.'
    }
  });
});

export default healthRoutes;
