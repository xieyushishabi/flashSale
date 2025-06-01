import { Hono } from 'hono';
import { connectToDatabase, db, mongo } from '../utils/database'; // Adjust if global.db/mongo is preferred
import { rabbitmq } from '../utils/rabbitmq'; // Assuming rabbitmq instance is exported
import { redis } from '../utils/redis'; // Assuming redis instance is exported

const healthRoutes = new Hono();

healthRoutes.get('/', async (c) => {
  let dbStatus = 'disconnected';
  try {
    // A more robust check would be to ping the database or check global.db
    // For now, we assume if connectToDatabase didn't throw, it's ok, but global.db is better.
    if (global.db && global.db.command) { // Check if db object and a command method exist
      await global.db.command({ ping: 1 });
      dbStatus = 'connected';
    } else if (db && db.command) { // Fallback to imported db if global.db is not set as expected
        await db.command({ ping: 1 });
        dbStatus = 'connected';
    }
  } catch (e) {
    console.error('[HealthCheck] DB ping failed:', e.message);
    dbStatus = 'error';
  }

  // For mock services, we can check if their instances exist
  const rabbitmqStatus = rabbitmq ? 'available' : 'unavailable';
  const redisStatus = redis ? 'available' : 'unavailable';

  return c.json({
    status: 'ok',
    message: '秒购宝电商闪购系统 API is healthy!',
    timestamp: new Date().toISOString(),
    services: {
      mongodb: dbStatus,
      rabbitmq: rabbitmqStatus,
      redis: redisStatus,
    },
  });
});

export default healthRoutes;
