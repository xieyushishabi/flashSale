/**
 * 商品管理路由模块
 * 使用RESTful API设计，集成Elasticsearch搜索、Redis缓存
 * 核心功能：商品CRUD、库存管理、秒杀逻辑
 */

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { redis, RedisKeys, SeckillStockManager } from '../utils/redis';
import { ProductSearchService } from '../utils/elasticsearch';
import type { Product, ApiResponse, ProductsResponse } from '../../shared/types';

const products = new Hono();

// 商品查询参数验证模式
const productQuerySchema = z.object({
  page: z.string().transform(val => parseInt(val) || 1),
  pageSize: z.string().transform(val => parseInt(val) || 12),
  search: z.string().optional(),
  status: z.string().optional(),
  minPrice: z.string().transform(val => val ? parseFloat(val) : undefined).optional(),
  maxPrice: z.string().transform(val => val ? parseFloat(val) : undefined).optional(),
});

// 获取商品列表 - RESTful GET /api/products
products.get('/', zValidator('query', productQuerySchema), async (c) => {
  try {
    const { page, pageSize, search, status, minPrice, maxPrice } = c.req.valid('query');
    
    console.log('🔍 查询商品列表参数:', { page, pageSize, search, status, minPrice, maxPrice });
    console.log('📊 参数类型检查:', { 
      pageType: typeof page, 
      pageSizeType: typeof pageSize,
      pageValue: page,
      pageSizeValue: pageSize
    });

    // 使用正确的表名
    const collectionName = '12a2d3dc_products';
    console.log('📋 使用数据表:', collectionName);

    // 构建查询条件
    const query: any = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status) {
      query.status = status;
    }
    
    if (minPrice !== undefined || maxPrice !== undefined) {
      query.seckillPrice = {};
      if (minPrice !== undefined) query.seckillPrice.$gte = minPrice;
      if (maxPrice !== undefined) query.seckillPrice.$lte = maxPrice;
    }

    console.log('🔍 MongoDB查询条件:', JSON.stringify(query, null, 2));

    // 检查数据库连接
    const healthCheck = await db.collection(collectionName).countDocuments();
    console.log('💾 数据库连接正常，文档总数:', healthCheck);

    // 获取总数
    const total = await db.collection(collectionName).countDocuments(query);
    console.log('📊 符合条件的商品总数:', total);

    // 分页查询
    const skip = (page - 1) * pageSize;
    const productsData = await db.collection(collectionName)
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize)
      .toArray();

    console.log('📦 查询到的商品数量:', productsData.length);
    console.log('📋 商品列表预览:', productsData.map(p => ({ 
      id: p._id, 
      name: p.name, 
      status: p.status,
      stock: p.stock 
    })));

    // 获取实时库存信息
    const productsWithStock = await Promise.all(
      productsData.map(async (productDoc) => {
        const product = productDoc as unknown as Product; 
        const currentStock = await SeckillStockManager.getStock(product._id.toString());
        return {
          ...product, 
          _id: product._id.toString(), 
          currentStock: typeof currentStock === 'number' && currentStock > 0 ? currentStock : product.stock, 
        } as (Product & { currentStock: number }); 
      })
    );

    const response: ProductsResponse = {
      products: productsWithStock,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };

    console.log('✅ 商品列表查询成功');
    return c.json<ApiResponse<ProductsResponse>>({
      success: true,
      data: response,
    });

  } catch (error) {
    console.error('💥 获取商品列表失败:', error.message);
    return c.json<ApiResponse>({
      success: false,
      message: `获取商品列表失败: ${error.message}`,
    }, 500);
  }
});

// 初始化示例数据 - POST /api/products/init
products.post('/init', async (c) => {
  try {
    console.log('🚀 开始初始化数据...');
    
    // 使用简单的数据库连接验证（不需要admin权限）
    console.log('📊 验证数据库连接...');
    const collectionName = '12a2d3dc_products';
    
    try {
      // 使用简单的计数操作验证连接，而不是serverStatus
      await db.collection(collectionName).countDocuments();
      console.log('✅ 数据库连接正常');
    } catch (dbError) {
      console.error('❌ 数据库连接问题:', dbError.message);
      throw new Error('数据库连接失败');
    }

    // 1. 先创建演示用户（如果不存在）
    console.log('👤 检查并创建演示用户...');
    const existingUser = await db.collection('12a2d3dc_users').findOne({ email: 'demo@example.com' });
    
    if (!existingUser) {
      const demoUser = {
        username: '演示用户',
        email: 'demo@example.com',
        password: '123456', // 明文密码（实际项目中应该加密）
        avatar: 'https://picsum.photos/100/100?random=demo',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      const userResult = await db.collection('12a2d3dc_users').insertOne(demoUser);
      console.log('✅ 演示用户创建成功:', userResult.insertedId);
    } else {
      console.log('✅ 演示用户已存在:', existingUser._id);
    }

    // 2. 清理现有商品数据
    console.log('🗑️ 清理现有商品数据...');
    const deleteResult = await db.collection(collectionName).deleteMany({});
    console.log(`🗑️ 删除了 ${deleteResult.deletedCount} 个现有商品`);

    // 3. 创建示例商品数据
    console.log('📦 创建示例商品数据...');
    const now = new Date();
    
    const sampleProducts = [
      {
        name: '苹果 iPhone 15 Pro Max',
        description: '最新款苹果手机，搭载A17 Pro芯片，支持5G网络，128GB存储空间',
        originalPrice: 9999,
        seckillPrice: 8888,
        stock: 50,
        image: 'iPhone.jpeg',
        startTime: new Date(now.getTime() - 60 * 60 * 1000), // 1小时前开始
        endTime: new Date(now.getTime() + 24 * 60 * 60 * 1000), // 24小时后结束
        status: 'active',
        createdAt: now,
        updatedAt: now,
      },
      {
        name: '华为 Mate 60 Pro',
        description: '华为旗舰手机，麒麟9000S芯片，超强拍照功能，256GB大容量',
        originalPrice: 6999,
        seckillPrice: 5999,
        stock: 30,
        image: '华为.jpeg',
        startTime: new Date(now.getTime() - 30 * 60 * 1000),
        endTime: new Date(now.getTime() + 12 * 60 * 60 * 1000),
        status: 'active',
        createdAt: now,
        updatedAt: now,
      },
      {
        name: '小米14 Ultra',
        description: '小米影像旗舰，骁龙8 Gen3处理器，徕卡专业摄影系统',
        originalPrice: 5999,
        seckillPrice: 4999,
        stock: 80,
        image: '小米.jpeg',
        startTime: new Date(now.getTime() + 60 * 60 * 1000), // 1小时后开始
        endTime: new Date(now.getTime() + 48 * 60 * 60 * 1000),
        status: 'pending',
        createdAt: now,
        updatedAt: now,
      },
      {
        name: 'OPPO Find X7',
        description: 'OPPO影像旗舰，天玑9300处理器，哈苏专业摄影',
        originalPrice: 4999,
        seckillPrice: 3999,
        stock: 60,
        image: 'oppo.jpeg',
        startTime: new Date(now.getTime() - 120 * 60 * 1000),
        endTime: new Date(now.getTime() + 6 * 60 * 60 * 1000),
        status: 'active',
        createdAt: now,
        updatedAt: now,
      },
      {
        name: 'vivo X100 Pro',
        description: 'vivo专业影像手机，天玑9300芯片，蔡司光学镜头',
        originalPrice: 4499,
        seckillPrice: 3599,
        stock: 40,
        image: 'vivo.jpeg',
        startTime: new Date(now.getTime() - 240 * 60 * 1000),
        endTime: new Date(now.getTime() - 60 * 60 * 1000), // 已结束
        status: 'ended',
        createdAt: now,
        updatedAt: now,
      },
      {
        name: '三星 Galaxy S24 Ultra',
        description: '三星旗舰手机，骁龙8 Gen3处理器，S Pen手写笔支持',
        originalPrice: 9299,
        seckillPrice: 7999,
        stock: 25,
        image: 'https://picsum.photos/300/300?random=6',
        startTime: new Date(now.getTime() - 90 * 60 * 1000),
        endTime: new Date(now.getTime() + 18 * 60 * 60 * 1000),
        status: 'active',
        createdAt: now,
        updatedAt: now,
      },
    ];

    // 4. 插入新的商品数据到MongoDB
    console.log('📝 插入新商品数据到MongoDB...');
    const result = await db.collection(collectionName).insertMany(sampleProducts);
    const insertedCount = Object.keys(result.insertedIds).length;
    console.log('✅ 商品数据插入成功:', insertedCount, '个商品');

    // 5. 获取插入的商品数据（用于同步）
    const insertedProducts = await db.collection(collectionName)
      .find({ _id: { $in: Object.values(result.insertedIds) } })
      .toArray();

    // 6. 同步到搜索引擎
    console.log('🔍 同步商品数据到搜索引擎...');
    for (const insertedDoc of insertedProducts) {
      await ProductSearchService.indexProduct({
        ...(insertedDoc as unknown as Product),
        _id: insertedDoc._id.toString(),
      });
    }

    // 7. 初始化Redis库存
    console.log('💾 初始化Redis库存数据...');
    for (const product of insertedProducts) {
      await SeckillStockManager.initStock(product._id.toString(), product.stock);
    }

    // 8. 验证数据是否正确插入
    const verifyProductCount = await db.collection(collectionName).countDocuments();
    const verifyUserCount = await db.collection('12a2d3dc_users').countDocuments();
    
    console.log('✅ 数据初始化完成！');
    console.log('📊 验证结果 - 商品数量:', verifyProductCount, '用户数量:', verifyUserCount);

    return c.json<ApiResponse>({
      success: true,
      message: `初始化成功！创建了 ${verifyProductCount} 个商品和 ${verifyUserCount} 个用户（包含演示账户）`,
      data: {
        products: verifyProductCount,
        users: verifyUserCount,
        productIds: Object.values(result.insertedIds).map(id => id.toString())
      }
    });

  } catch (error) {
    console.error('💥 初始化数据失败:', error.message);
    console.error('错误详情:', error);
    return c.json<ApiResponse>({
      success: false,
      message: `初始化失败: ${error.message}`,
    }, 500);
  }
});

// 获取单个商品详情 - RESTful GET /api/products/:id
products.get('/:id', async (c) => {
  try {
    const productId = c.req.param('id');
    console.log('获取商品详情:', productId);

    const product = await db.collection('12a2d3dc_products').findOne({
      _id: new mongo.ObjectId(productId)
    });

    if (!product) {
      return c.json<ApiResponse>({ 
        success: false, 
        message: '商品不存在' 
      }, 404);
    }

    // 获取实时库存
    const currentStock = await SeckillStockManager.getStock(productId);

    const productData: Product & { currentStock: number } = {
      _id: product._id.toString(),
      name: product.name,
      description: product.description,
      originalPrice: product.originalPrice,
      seckillPrice: product.seckillPrice,
      stock: product.stock,
      image: product.image,
      startTime: product.startTime,
      endTime: product.endTime,
      status: product.status,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      currentStock,
    };

    return c.json<ApiResponse>({
      success: true,
      data: productData
    });

  } catch (error) {
    console.error('获取商品详情失败:', error.message);
    return c.json<ApiResponse>({ 
      success: false, 
      message: '获取商品详情失败' 
    }, 500);
  }
});

export default products;