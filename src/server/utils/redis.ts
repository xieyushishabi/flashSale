import { createClient, RedisClientType, RedisFunctions, RedisModules, RedisScripts } from 'redis';
import { Logger } from 'log4js'; // Import Logger type
import loggerInstanceFromFile from './logger'; // Rename imported instance
import { format } from 'util';
import { connectToDatabase, getDbInstance, getMongoDriver } from '../utils/database'; // Use getter functions
import dotenv from 'dotenv';

// Explicitly type the logger instance
const logger: Logger = loggerInstanceFromFile as Logger;

// Load .env file for REDIS_URL or other configurations
dotenv.config();

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// Exported Redis client instance
// It will be undefined until the initial connection attempt completes.
export let redis: RedisClientType<RedisModules, RedisFunctions, RedisScripts>;

let connectionAttempts = 0;
const MAX_CONNECTION_ATTEMPTS = 5; // Max retries for initial connection
const RETRY_DELAY_MS = 5000; // Delay between retries

/**
 * Initializes and connects the Redis client.
 * Handles connection events and implements a retry mechanism for the initial connection.
 */
async function initializeRedisClient(): Promise<RedisClientType<RedisModules, RedisFunctions, RedisScripts> | null> {
  // Avoid re-initializing if already connected and open
  if (redis && redis.isOpen) {
    logger.info('Redis client is already connected.');
    return redis;
  }

  // Avoid re-initializing if a connection attempt is already in progress by another call
  // This is a simple guard; more sophisticated locking might be needed in some scenarios.
  if (connectionAttempts > 0 && connectionAttempts < MAX_CONNECTION_ATTEMPTS && !(redis && redis.isOpen)) {
      logger.info('Redis connection attempt already in progress...');
      // Potentially return a promise that resolves when the ongoing attempt completes
      // For now, returning null or an existing promise if we had one for the current attempt
      return null; // Or handle more gracefully by returning the promise of the ongoing attempt
  }

  connectionAttempts++;
  logger.info(`Attempting to connect to Redis at ${REDIS_URL}... (Attempt ${connectionAttempts}/${MAX_CONNECTION_ATTEMPTS})`);

  const client = createClient({
    url: REDIS_URL,
    // Example: Configure socket options for timeouts and retry strategy for the client itself
    // socket: {
    //   connectTimeout: 5000,
    //   // The client's built-in reconnectStrategy. 
    //   // 'retries' is the number of attempts made *by the client library* after a disconnect.
    //   reconnectStrategy: (retries) => {
    //     if (retries > 10) { // Stop retrying after 10 attempts by the client library
    //       logger.error('Redis client: Too many reconnect attempts. Stopping.');
    //       return new Error('Too many reconnect attempts.'); 
    //     }
    //     return Math.min(retries * 100, 3000); // Exponential backoff
    //   }
    // }
  });

  client.on('connect', () => {
    logger.info('Redis client is connecting...');
  });

  client.on('ready', () => {
    logger.info('✅ Redis client connected successfully and is ready.');
    connectionAttempts = 0; // Reset counter on successful connection
  });

  client.on('error', (err) => {
    logger.error('❌ Redis Client Error:', err);
    // The client itself might attempt to reconnect based on its `reconnectStrategy`.
    // This 'error' event can be for various issues, not just connection ones after it's been ready.
  });

  client.on('reconnecting', () => {
    logger.warn('Redis client is reconnecting...');
  });

  client.on('end', () => {
    logger.warn('Redis client connection has been closed.');
    // This event is fired when the connection is closed, either intentionally or due to an error
    // after which the client is no longer trying to reconnect (e.g. if reconnectStrategy returns an Error).
  });

  try {
    await client.connect();
    // Assign to the exported variable only after a successful connection.
    redis = client as RedisClientType<RedisModules, RedisFunctions, RedisScripts>;
    return redis; 
  } catch (err) {
    logger.error(`❌ Failed to connect to Redis (Attempt ${connectionAttempts}/${MAX_CONNECTION_ATTEMPTS}):`, err);
    if (connectionAttempts < MAX_CONNECTION_ATTEMPTS) {
      logger.info(`Retrying Redis connection in ${RETRY_DELAY_MS / 1000} seconds...`);
      setTimeout(initializeRedisClient, RETRY_DELAY_MS); // Schedule next attempt for initial connection
    } else {
      logger.error(`❌ Max Redis initial connection attempts (${MAX_CONNECTION_ATTEMPTS}) reached. Giving up on initial connection.`);
      // Application might need to handle this state (e.g., run in degraded mode or exit).
      // For now, `redis` remains uninitialized or points to a closed client.
    }
    return null; // Indicate failure to connect after retries
  }
}

// Initialize the Redis client when this module is loaded and export the promise.
export const redisConnectionPromise = initializeRedisClient();

/**
 * Ensures the Redis client is connected before performing an operation.
 * Throws an error if the client is not connected and cannot be re-established.
 */
async function ensureConnected(): Promise<void> {
  if (!redis || !redis.isOpen) {
    logger.warn('Redis client is not connected. Attempting to initialize/reconnect...');
    // This will re-attempt connection if initial attempts failed or if client got disconnected.
    // It reuses the same retry logic if connectionAttempts < MAX_CONNECTION_ATTEMPTS
    await initializeRedisClient(); 
    
    // Wait a brief moment for connection status to update after initializeRedisClient call
    await new Promise(resolve => setTimeout(resolve, 100)); 

    if (!redis || !redis.isOpen) {
      const errMsg = 'Redis client is not connected after attempting to re-initialize. Operations may fail.';
      logger.error(`❌ ${errMsg}`);
      throw new Error(errMsg);
    }
  }
}

// Redis缓存键管理 (Remains the same)
export const RedisKeys = {
  userSession: (userId: string) => `user:session:${userId}`,
  productStock: (productId: string) => `product:stock:${productId}`,
  seckillLock: (productId: string, userId: string) => `seckill:lock:${productId}:${userId}`,
  orderQueue: 'order:queue',
  seckillStats: 'seckill:stats',
};

// 秒杀库存管理
export class SeckillStockManager {
  static async initStock(productId: string, stock: number): Promise<void> {
    await ensureConnected();
    try {
      const stockKey = RedisKeys.productStock(productId);
      await redis.set(stockKey, stock.toString());
      logger.info(`✅ Initialized product ${productId} stock in Redis: ${stock}`);
    } catch (err) {
      const baseMessage = format('❌ Error initializing stock for product %s in Redis:', productId);
      if (err instanceof Error) {
        logger.error(baseMessage, err);
      } else {
        logger.error(baseMessage + ' Unknown error: %s', String(err));
      }
      throw err;
    }
  }

  static async syncStockFromDB(productId: string): Promise<number> {
    await ensureConnected(); // Ensure Redis is connected
    logger.info(`[SeckillStockManager.syncStockFromDB] Attempting to sync stock for product ${productId} from MongoDB.`);
    try {
      await connectToDatabase(); // Ensure MongoDB is connected
      const currentDb = getDbInstance();
      const currentMongo = getMongoDriver();
      // The getters (getDbInstance, getMongoDriver) will throw an error if instances are not available,
      // so an explicit check like '!currentDb || !currentMongo' is not strictly necessary here
      // as connectToDatabase() should ensure they are set, or the getters will fail loudly.

      const productCollection = currentDb.collection('12a2d3dc_products');
      let objectId;
      try {
        objectId = new currentMongo.ObjectId(productId);
      } catch (idError) {
        logger.error(`❌ [SeckillStockManager.syncStockFromDB] Invalid productId format for MongoDB ObjectId: ${productId}`, idError);
        return 0;
      }

      const product = await productCollection.findOne<{ stock: number, _id: any }>({ _id: objectId });

      if (product && typeof product.stock === 'number') {
        await SeckillStockManager.initStock(productId, product.stock); // Use static call
        logger.info(`🔄 Successfully synced stock from DB for product ${productId} to Redis. DB Stock: ${product.stock}`);
        return product.stock;
      } else {
        logger.warn(`⚠️ Product ${productId} not found in DB or stock data is invalid/missing. Product data: ${JSON.stringify(product)}`);
        // Optional: Consider if we should set Redis stock to 0 or delete the key if product not in DB
        // await redis.del(RedisKeys.productStock(productId)); 
        return 0;
      }
    } catch (err) {
      const baseMessage = format('❌ Error syncing stock from DB for product %s:', productId);
      if (err instanceof Error) {
        logger.error(baseMessage, err);
      } else {
        logger.error(baseMessage + ' Unknown error: %s', String(err));
      }
      return 0; // Return 0 on error to prevent cascading issues, or rethrow if preferred
    }
  }

  static async decrementStock(productId: string): Promise<boolean> {
    await ensureConnected();
    const stockKey = RedisKeys.productStock(productId);
    try {
      const newStock = await redis.decr(stockKey);

      if (newStock >= 0) {
        logger.info(`✅ Product ${productId} stock decremented in Redis. New stock: ${newStock}`);
        return true;
      } else {
        // Stock fell below zero (was 0 or less). Revert decrement.
        await redis.incr(stockKey); 
        logger.warn(`❌ Product ${productId} stock was 0 or less in Redis. Failed to decrement. Stock corrected back.`);
        
        logger.info(`Attempting to sync stock from DB for ${productId} due to insufficient stock in Redis.`);
        const dbStock = await this.syncStockFromDB(productId); // This will log errors if DB not set up
        if (dbStock > 0) {
          // If DB sync was successful and brought positive stock, try decrementing again.
          // Note: This assumes syncStockFromDB also updates Redis via initStock.
          const newStockAfterSync = await redis.decr(stockKey);
          if (newStockAfterSync >= 0) {
            logger.info(`✅ Product ${productId} stock decremented after DB sync. New stock: ${newStockAfterSync}`);
            return true;
          } else {
            await redis.incr(stockKey); // Correct back if failed again
            logger.warn(`❌ Product ${productId} stock still insufficient after DB sync and re-decrement attempt.`);
            return false;
          }
        } else {
          logger.warn(`❌ Product ${productId} stock insufficient in DB or DB sync failed.`);
          return false;
        }
      }
    } catch (err) {
      const baseMessage = format('❌ Error decrementing stock for product %s in Redis:', productId);
      if (err instanceof Error) {
        logger.error(baseMessage, err);
      } else {
        const fullErrorMessage = format(baseMessage + ' Unknown error: %s', String(err));
        logger.error(fullErrorMessage);
      }
      // Potentially re-throw or handle specific error types if needed
      return false;
    }
  }

  static async getStock(productId: string): Promise<number> {
    await ensureConnected();
    const stockKey = RedisKeys.productStock(productId);
    try {
      const stockString = await redis.get(stockKey);
      if (stockString === null) {
        logger.warn(`⚠️ Stock for product ${productId} not found in Redis. Attempting to sync from DB.`);
        return await this.syncStockFromDB(productId); // This will log errors if DB not set up
      }
      const stockNum = parseInt(String(stockString), 10);
      if (isNaN(stockNum)) {
        logger.error(`❌ Invalid stock value ('${stockString}') for product ${productId} in Redis. Deleting invalid key and attempting DB sync.`);
        await redis.del(stockKey);
        return await this.syncStockFromDB(productId); // This will log errors if DB not set up
      }
      logger.info(`📊 Current stock for product ${productId} from Redis: ${stockNum}`);
      return stockNum;
    } catch (err) {
      const baseMessage = format('❌ Error getting stock for product %s from Redis:', productId);
      if (err instanceof Error) {
        const errorMessageWithStack = format('%s MESSAGE: %s STACK: %s', baseMessage, err.message, err.stack || 'N/A');
        logger.error(errorMessageWithStack);
      } else {
        const unknownErrorString = String(err); // Ensure err is stringified
        logger.error(`${baseMessage} Unknown error: ${unknownErrorString}`);
      }
      logger.warn(`Attempting to sync stock from DB for ${productId} due to error fetching from Redis.`);
      return await this.syncStockFromDB(productId); // Fallback, will log errors if DB not set up
    }
  }

  static async acquireSeckillLock(productId: string, userId: string, lockExpirySeconds: number = 300): Promise<boolean> {
    await ensureConnected();
    const lockKey = RedisKeys.seckillLock(productId, userId);
    try {
      const result = await redis.set(lockKey, '1', {
        NX: true, // Only set if key does not exist
        EX: lockExpirySeconds, // Set expiration in seconds
      });
      if (result === 'OK') {
        logger.info(`🔒 User ${userId} acquired seckill lock for product ${productId}. Expires in ${lockExpirySeconds}s.`);
        return true;
      } else {
        logger.warn('⚠️ User %s failed to acquire seckill lock for product %s (lock likely already held or an error occurred). Result: %s', userId, productId, String(result));
        return false;
      }
    } catch (err) {
      const baseMessage = format('❌ Error acquiring seckill lock for user %s, product %s:', userId, productId);
      if (err instanceof Error) {
        logger.error(baseMessage, err);
      } else {
        logger.error(baseMessage + ' Unknown error: %s', String(err));
      }
      return false;
    }
  }

  static async releaseSeckillLock(productId: string, userId: string): Promise<void> {
    await ensureConnected();
    const lockKey = RedisKeys.seckillLock(productId, userId);
    try {
      const result = await redis.del(lockKey);
      if (result > 0) {
        const logMessageIfReleased = format('🔓 Released seckill lock for user %s, product %s.', userId, productId);
        logger.info(logMessageIfReleased);
      } else {
        const logMessage = format('ℹ️ Attempted to release seckill lock for user %s, product %s, but lock did not exist.', userId, productId);
        logger.info(logMessage);
      }
    } catch (err) {
      const baseMessage = format('❌ Error releasing seckill lock for user %s, product %s:', userId, productId);
      if (err instanceof Error) {
        logger.error(baseMessage, err);
      } else {
        logger.error(baseMessage + ' Unknown error: %s', String(err));
      }
    }
  }

  // IMPORTANT: This method depends on 'db' and 'mongo' (see syncStockFromDB notes).
  static async syncAllStock(): Promise<void> {
    await ensureConnected(); // Ensure Redis is connected
    logger.info('[SeckillStockManager.syncAllStock] Starting to sync all product stocks from MongoDB to Redis.');
    try {
      await connectToDatabase(); // Ensure MongoDB is connected
      const currentDb = getDbInstance();
      // The getter (getDbInstance) will throw an error if the instance is not available.

      const productCollection = currentDb.collection('12a2d3dc_products');
      // Fetch only _id and stock fields for efficiency
      const products = await productCollection.find<{ _id: any, stock: number }>({}, { projection: { _id: 1, stock: 1 } }).toArray();

      if (products && products.length > 0) {
        let successCount = 0;
        let skippedCount = 0;
        for (const product of products) {
          if (product._id && typeof product.stock === 'number') {
            try {
              await SeckillStockManager.initStock(product._id.toString(), product.stock); // Use static call
              successCount++;
            } catch (initError) {
              logger.error(`❌ Error initializing stock in Redis for product ${product._id.toString()} during syncAllStock:`, initError);
              skippedCount++;
            }
          } else {
            logger.warn(`⚠️ Skipping product with invalid data (missing _id or stock) during syncAllStock: ${JSON.stringify(product)}`);
            skippedCount++;
          }
        }
        logger.info(`✅ [SeckillStockManager.syncAllStock] Finished syncing stocks. Successfully synced: ${successCount}. Skipped/Failed: ${skippedCount}. Total products processed: ${products.length}.`);
      } else {
        logger.info('[SeckillStockManager.syncAllStock] No products found in MongoDB to sync.');
      }
    } catch (err) {
      const baseMessage = '[SeckillStockManager.syncAllStock] ❌ Error during the process of syncing all stocks from DB:';
      if (err instanceof Error) {
        logger.error(baseMessage, err);
      } else {
        logger.error(baseMessage + ' Unknown error: %s', String(err));
      }
    }
  }
}

/**
 * Gracefully disconnects the Redis client.
 * Intended to be called on application shutdown.
 */
export async function disconnectRedis(): Promise<void> {
  logger.info('Attempting to gracefully disconnect Redis client...');
  if (redis && redis.isOpen) {
    try {
      await redis.quit(); // Gracefully close the connection
      logger.info('✅ Redis client disconnected gracefully.');
    } catch (err) {
      logger.error('❌ Error during Redis client graceful shutdown (quit):', err);
      // Fallback to force close if quit fails or times out (optional)
      // await redis.disconnect();
    }
  } else if (redis && redis.isReady === false && !redis.isOpen) {
    // If client exists but is not open (e.g. still trying to connect or failed all retries)
    logger.warn('Redis client exists but is not in an open state. Attempting to force disconnect if applicable.');
    try {
        await redis.disconnect(); // Force close any pending connections
        logger.info('Redis client (non-open state) disconnected.');
    } catch (err) {
        logger.error('❌ Error during Redis client force disconnect (non-open state):', err);
    }
  } else {
    logger.info('Redis client was not connected or already closed.');
  }
}

// Example of hooking into process shutdown signals for graceful disconnection.
// These should be placed in your main application file (e.g., index.ts).
// process.on('SIGINT', async () => {
//   logger.info('Received SIGINT. Shutting down...');
//   await disconnectRedis();
//   process.exit(0);
// });
// process.on('SIGTERM', async () => {
//   logger.info('Received SIGTERM. Shutting down...');
//   await disconnectRedis();
//   process.exit(0);
// });

// Note: The `db` and `mongo` dependencies in `SeckillStockManager`
// need to be resolved for `syncStockFromDB` and `syncAllStock` to function correctly.