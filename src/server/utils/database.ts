// src/server/utils/database.ts
import { MongoClient, Db } from 'mongodb';
import * as mongoDriver from 'mongodb'; // Import the entire mongodb driver
import config from '../config'; // 导入新的配置模块

// 扩展全局命名空间以包含我们的数据库连接和 MongoDB 驱动实例
declare global {
  // eslint-disable-next-line no-var
  var mongo: typeof mongoDriver;
  // eslint-disable-next-line no-var
  var db: Db;
}

const MONGODB_URI = config.DATABASE_URL; // 从配置模块获取URI
let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

// DATABASE_URL 的验证已在 config.ts 中完成

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    console.log('[Database] Using cached database instance');
    // global.mongo is already set from the first successful connection
    // global.db is already set
    return { client: cachedClient, db: cachedDb };
  }

  console.log('[Database] Connecting to MongoDB...');
  if (!MONGODB_URI) {
    // This check is redundant due to config.ts, but kept for safety.
    console.error('[Database] FATAL: MONGODB_URI is not available from config.');
    throw new Error('MONGODB_URI is not configured.');
  }
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const dbName = new URL(MONGODB_URI).pathname.substring(1) || 'miaogou';
    const dbInstance = client.db(dbName);
    console.log(`[Database] Successfully connected to database: ${dbName}`);

    cachedClient = client;
    cachedDb = dbInstance;

    // 将 MongoDB 驱动和数据库实例赋给全局变量
    global.mongo = mongoDriver; // Assign the entire driver
    global.db = dbInstance;    // Assign the Db instance

    return { client, db: dbInstance };
  } catch (error) {
    console.error('[Database] Failed to connect to MongoDB', error);
    throw error;
  }
}

export async function closeDatabaseConnection() {
  if (cachedClient) {
    try {
      await cachedClient.close();
      cachedClient = null;
      cachedDb = null;
      // @ts-ignore - allowing mongo to be undefined after close
      global.mongo = undefined;
      // @ts-ignore - allowing db to be undefined after close
      global.db = undefined;
      console.log('[Database] MongoDB connection closed.');
    } catch (error) {
      console.error('[Database] Error closing MongoDB connection:', error);
      throw error;
    }
  }
}

process.on('SIGINT', async () => {
  await closeDatabaseConnection();
  process.exit(0);
});
process.on('SIGTERM', async () => {
  await closeDatabaseConnection();
  process.exit(0);
});

// Export global references. Other modules can import these,
// but must ensure connectToDatabase() is called before use.
export const mongo = global.mongo;
export const db = global.db;
