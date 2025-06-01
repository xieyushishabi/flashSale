/**
 * Redis缓存工具类
 * 使用Redis技术实现高性能缓存和秒杀库存管理
 * 核心功能：库存原子操作、用户会话缓存、分布式锁
 */

// 模拟Redis客户端 - 在实际环境中应使用真实Redis
class MockRedis {
  private data: Map<string, any> = new Map();
  private expiry: Map<string, number> = new Map();

  async set(key: string, value: any, options?: { ex?: number }): Promise<void> {
    this.data.set(key, JSON.stringify(value));
    if (options?.ex) {
      this.expiry.set(key, Date.now() + options.ex * 1000);
    }
  }

  async get(key: string): Promise<string | null> {
    if (this.expiry.has(key) && this.expiry.get(key)! < Date.now()) {
      this.data.delete(key);
      this.expiry.delete(key);
      return null;
    }
    return this.data.get(key) || null;
  }

  async incr(key: string): Promise<number> {
    const current = parseInt(this.data.get(key) || '0');
    const newValue = current + 1;
    this.data.set(key, newValue.toString());
    return newValue;
  }

  async decr(key: string): Promise<number> {
    const current = parseInt(this.data.get(key) || '0');
    const newValue = Math.max(0, current - 1);
    this.data.set(key, newValue.toString());
    return newValue;
  }

  async del(key: string): Promise<void> {
    this.data.delete(key);
    this.expiry.delete(key);
  }

  async exists(key: string): Promise<boolean> {
    if (this.expiry.has(key) && this.expiry.get(key)! < Date.now()) {
      this.data.delete(key);
      this.expiry.delete(key);
      return false;
    }
    return this.data.has(key);
  }

  async setex(key: string, seconds: number, value: any): Promise<void> {
    await this.set(key, value, { ex: seconds });
  }
}

export const redis = new MockRedis();

// Redis缓存键管理
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
    await redis.set(RedisKeys.productStock(productId), stock);
    console.log(`✅ 初始化商品 ${productId} 库存: ${stock}`);
  }

  static async syncStockFromDB(productId: string): Promise<number> {
    try {
      // 从数据库获取最新库存
      const product = await db.collection('12a2d3dc_products').findOne({
        _id: new mongo.ObjectId(productId)
      });
      
      if (product) {
        await this.initStock(productId, product.stock);
        console.log(`🔄 从数据库同步库存 ${productId}: ${product.stock}`);
        return product.stock;
      }
      
      return 0;
    } catch (error) {
      console.error('❌ 同步库存失败:', error.message);
      return 0;
    }
  }

  static async decrementStock(productId: string): Promise<boolean> {
    const stockKey = RedisKeys.productStock(productId);
    let currentStock = await redis.get(stockKey);
    
    // 如果Redis中没有库存数据，从数据库同步
    if (!currentStock) {
      console.log(`⚠️ Redis中没有商品 ${productId} 的库存数据，从数据库同步...`);
      const dbStock = await this.syncStockFromDB(productId);
      if (dbStock <= 0) {
        console.log(`❌ 数据库中商品 ${productId} 库存不足: ${dbStock}`);
        return false;
      }
      currentStock = dbStock.toString();
    }

    const stockNum = parseInt(currentStock);
    console.log(`📊 商品 ${productId} 当前库存: ${stockNum}`);
    
    if (stockNum <= 0) {
      console.log(`❌ 商品 ${productId} 库存不足，无法购买`);
      return false;
    }

    const newStock = await redis.decr(stockKey);
    console.log(`✅ 商品 ${productId} 库存扣减成功，剩余: ${newStock}`);
    return newStock >= 0;
  }

  static async getStock(productId: string): Promise<number> {
    const stockKey = RedisKeys.productStock(productId);
    let stock = await redis.get(stockKey);
    
    // 如果Redis中没有库存数据，从数据库同步
    if (!stock) {
      console.log(`⚠️ Redis中没有商品 ${productId} 的库存数据，从数据库获取...`);
      return await this.syncStockFromDB(productId);
    }
    
    return parseInt(stock || '0');
  }

  static async acquireSeckillLock(productId: string, userId: string): Promise<boolean> {
    const lockKey = RedisKeys.seckillLock(productId, userId);
    const exists = await redis.exists(lockKey);
    
    if (exists) {
      console.log(`⚠️ 用户 ${userId} 已经参与过商品 ${productId} 的秒杀`);
      return false; // 用户已经参与过秒杀
    }

    await redis.setex(lockKey, 300, '1'); // 5分钟锁定期
    console.log(`🔒 用户 ${userId} 获取商品 ${productId} 秒杀锁成功`);
    return true;
  }

  // 新增：释放秒杀锁（用于测试或管理）
  static async releaseSeckillLock(productId: string, userId: string): Promise<void> {
    const lockKey = RedisKeys.seckillLock(productId, userId);
    await redis.del(lockKey);
    console.log(`🔓 释放用户 ${userId} 商品 ${productId} 的秒杀锁`);
  }

  // 新增：强制同步所有商品库存
  static async syncAllStock(): Promise<void> {
    try {
      console.log('🔄 开始同步所有商品库存...');
      const products = await db.collection('12a2d3dc_products').find().toArray();
      
      for (const product of products) {
        await this.initStock(product._id.toString(), product.stock);
      }
      
      console.log(`✅ 成功同步 ${products.length} 个商品的库存`);
    } catch (error) {
      console.error('❌ 同步所有库存失败:', error.message);
    }
  }
}