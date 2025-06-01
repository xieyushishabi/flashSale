/**
 * 秒杀业务路由模块
 * 实现秒杀下单、订单查询等核心业务逻辑
 * 集成Redis库存管理和RabbitMQ消息队列
 */

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { SeckillStockManager, RedisKeys } from '../utils/redis';
import { rabbitmq, QueueNames, MessagePublisher } from '../utils/rabbitmq';
import { WebSocketService } from '../websocket';
import { authenticateToken } from '../middleware/auth';
import type { ApiResponse } from '../../shared/types';

const seckill = new Hono();

// 秒杀下单参数验证
const seckillSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().min(1).max(10),
});

// 秒杀下单 - POST /api/seckill
seckill.post('/', authenticateToken, zValidator('json', seckillSchema), async (c) => {
  const { productId, quantity } = c.req.valid('json');
  const user = c.get('user');
  
  try {
    console.log(`🚀 用户 ${user._id} 尝试秒杀商品 ${productId}，数量: ${quantity}`);

    // 检查商品是否存在且状态为active
    const product = await db.collection('12a2d3dc_products').findOne({
      _id: new mongo.ObjectId(productId),
      status: 'active'
    });

    if (!product) {
      console.log(`❌ 商品 ${productId} 不存在或状态不是active`);
      return c.json<ApiResponse>({ 
        success: false, 
        message: '商品不存在或已结束' 
      }, 404);
    }

    console.log(`✅ 商品验证通过: ${product.name}，数据库库存: ${product.stock}`);

    // 检查当前Redis库存状态
    const currentRedisStock = await SeckillStockManager.getStock(productId);
    console.log(`📊 当前Redis库存: ${currentRedisStock}`);

    // 获取分布式锁，防止重复购买
    const lockAcquired = await SeckillStockManager.acquireSeckillLock(productId, user._id);
    if (!lockAcquired) {
      console.log(`🔒 用户 ${user._id} 已经参与过商品 ${productId} 的秒杀`);
      return c.json<ApiResponse>({ 
        success: false, 
        message: '您已经参与过此商品的秒杀，请等待5分钟后重试' 
      }, 400);
    }

    // 扣减库存
    console.log(`💰 开始扣减商品 ${productId} 库存...`);
    const stockSuccess = await SeckillStockManager.decrementStock(productId);
    if (!stockSuccess) {
      console.log(`❌ 商品 ${productId} 库存扣减失败`);
      // 释放锁
      await SeckillStockManager.releaseSeckillLock(productId, user._id);
      return c.json<ApiResponse>({ 
        success: false, 
        message: '商品已售罄，请选择其他商品' 
      }, 400);
    }

    console.log(`✅ 库存扣减成功`);

    // 创建订单
    const order = {
      userId: user._id,
      productId,
      quantity,
      price: product.seckillPrice * quantity,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const orderResult = await db.collection('12a2d3dc_orders').insertOne(order);
    const orderId = orderResult.insertedId.toString();

    console.log(`📝 订单创建成功: ${orderId}`);

    // 发布订单创建消息，以便后续处理（例如：确认订单状态）
    await MessagePublisher.publishOrderMessage(orderId, user._id, productId);
    console.log(`📬 已发布订单创建消息到队列: ${orderId}`);

    // 记录秒杀日志
    await db.collection('12a2d3dc_seckill_logs').insertOne({
      userId: user._id,
      productId,
      action: 'seckill_attempt',
      result: 'success',
      timestamp: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // 获取最新库存
    const finalStock = await SeckillStockManager.getStock(productId);
    console.log(`🎉 秒杀成功：订单 ${orderId}，剩余库存 ${finalStock}`);

    return c.json<ApiResponse>({
      success: true,
      data: {
        orderId,
        message: '🎉 抢购成功！订单已创建',
        stockLeft: finalStock,
        product: {
          name: product.name,
          price: product.seckillPrice
        }
      }
    });

  } catch (error) {
    console.error('💥 秒杀处理失败:', error.message);
    console.error('错误堆栈:', error.stack);
    
    // 确保释放锁
    try {
      await SeckillStockManager.releaseSeckillLock(productId, user._id);
    } catch (lockError) {
      console.error('释放锁失败:', lockError.message);
    }
    
    return c.json<ApiResponse>({ 
      success: false, 
      message: '系统繁忙，请稍后重试' 
    }, 500);
  }
});

// 新增：管理员重置用户秒杀锁 - POST /api/seckill/reset-lock
seckill.post('/reset-lock', authenticateToken, async (c) => {
  const { productId, userId } = await c.req.json();
  const currentUser = c.get('user');
  
  try {
    console.log(`🔧 用户 ${currentUser._id} 请求重置秒杀锁: 商品 ${productId}, 用户 ${userId || currentUser._id}`);
    
    const targetUserId = userId || currentUser._id;
    await SeckillStockManager.releaseSeckillLock(productId, targetUserId);
    
    return c.json<ApiResponse>({
      success: true,
      message: '秒杀锁重置成功，现在可以重新参与秒杀'
    });
  } catch (error) {
    console.error('重置秒杀锁失败:', error.message);
    return c.json<ApiResponse>({
      success: false,
      message: '重置失败，请稍后重试'
    }, 500);
  }
});

// 新增：同步库存 - POST /api/seckill/sync-stock
seckill.post('/sync-stock', authenticateToken, async (c) => {
  try {
    console.log('🔄 开始手动同步库存...');
    await SeckillStockManager.syncAllStock();
    
    return c.json<ApiResponse>({
      success: true,
      message: '库存同步成功'
    });
  } catch (error) {
    console.error('同步库存失败:', error.message);
    return c.json<ApiResponse>({
      success: false,
      message: '同步失败，请稍后重试'
    }, 500);
  }
});

// 获取用户订单列表 - GET /api/seckill/orders
seckill.get('/orders', authenticateToken, async (c) => {
  const user = c.get('user');
  
  try {
    console.log(`获取用户 ${user._id} 的订单列表`);

    const orders = await db.collection('12a2d3dc_orders')
      .find({ userId: user._id })
      .sort({ createdAt: -1 })
      .toArray();

    // 获取订单对应的商品信息
    const ordersWithProducts = await Promise.all(
      orders.map(async (order) => {
        const product = await db.collection('12a2d3dc_products').findOne({
          _id: new mongo.ObjectId(order.productId)
        });

        return {
          ...order,
          _id: order._id.toString(),
          product: product ? {
            ...product,
            _id: product._id.toString(),
          } : null,
        };
      })
    );

    return c.json<ApiResponse>({
      success: true,
      data: ordersWithProducts
    });

  } catch (error) {
    console.error('获取订单列表失败:', error.message);
    return c.json<ApiResponse>({ 
      success: false, 
      message: '获取订单列表失败' 
    }, 500);
  }
});

// 获取秒杀统计数据 - GET /api/seckill/stats
seckill.get('/stats', async (c) => {
  try {
    console.log('获取秒杀统计数据');

    const [totalProducts, activeProducts, totalOrders, successfulOrders] = await Promise.all([
      db.collection('12a2d3dc_products').countDocuments(),
      db.collection('12a2d3dc_products').countDocuments({ status: 'active' }),
      db.collection('12a2d3dc_orders').countDocuments(),
      db.collection('12a2d3dc_orders').countDocuments({ status: 'confirmed' }),
    ]);

    // 获取最近24小时的订单统计
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const hourlyOrders = await db.collection('12a2d3dc_orders')
      .aggregate([
        {
          $match: {
            createdAt: { $gte: oneDayAgo }
          }
        },
        {
          $group: {
            _id: {
              hour: { $hour: '$createdAt' }
            },
            orders: { $sum: 1 },
            revenue: { $sum: '$price' }
          }
        },
        {
          $sort: { '_id.hour': 1 }
        }
      ])
      .toArray();

    const stats = {
      totalProducts,
      activeProducts,
      totalOrders,
      successfulOrders,
      hourlyStats: hourlyOrders.map(stat => ({
        hour: `${stat._id.hour}:00`,
        orders: stat.orders,
        revenue: stat.revenue,
      })),
    };

    return c.json<ApiResponse>({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('获取统计数据失败:', error.message);
    return c.json<ApiResponse>({ 
      success: false, 
      message: '获取统计数据失败' 
    }, 500);
  }
});

export default seckill;