/**
 * 身份验证路由模块
 * 使用JWT技术实现RESTful API的用户认证
 * 包含用户注册、登录、会话管理功能
 */

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { generateToken, verifyToken, extractTokenFromHeader } from '../utils/jwt';
import { redis, RedisKeys } from '../utils/redis';
import type { User, AuthResponse, ApiResponse } from '../../shared/types';

const auth = new Hono();

// 注册验证模式
const registerSchema = z.object({
  username: z.string().min(3).max(20),
  email: z.string().email(),
  password: z.string().min(6),
});

// 登录验证模式
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// 简单的密码哈希函数（不使用crypto模块）
function simpleHash(password: string): string {
  // 使用简单的字符串操作进行基础哈希，避免使用crypto
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // 转换为32位整数
  }
  return Math.abs(hash).toString(36);
}

// 用户注册 - RESTful POST /api/auth/register
auth.post('/register', zValidator('json', registerSchema), async (c) => {
  try {
    const { username, email, password } = c.req.valid('json');
    console.log('👤 用户注册请求:', email);

    // 检查用户是否已存在
    const existingUser = await db.collection('12a2d3dc_users').findOne({ email });
    if (existingUser) {
      return c.json<ApiResponse>({ 
        success: false, 
        message: '邮箱已被注册' 
      }, 400);
    }

    // 创建新用户
    const newUser = {
      username,
      email,
      password: simpleHash(password), // 使用简单哈希而不是crypto
      avatar: `https://picsum.photos/100/100?random=${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('12a2d3dc_users').insertOne(newUser);
    console.log('✅ 用户注册成功:', result.insertedId);

    // 生成JWT令牌
    const token = await generateToken(result.insertedId.toString(), username);

    // 缓存用户会话到Redis（可选操作，即使失败也不影响注册）
    try {
      await redis.set(RedisKeys.userSession(result.insertedId.toString()), {
        userId: result.insertedId.toString(),
        username,
        email,
      }, { ex: 86400 });
      console.log('✅ 用户会话缓存成功');
    } catch (redisError) {
      console.warn('⚠️ Redis缓存失败，但注册仍然成功:', redisError.message);
    }

    const user: User = {
      _id: result.insertedId.toString(),
      username,
      email,
      avatar: newUser.avatar,
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt,
    };

    return c.json<ApiResponse<AuthResponse>>({
      success: true,
      data: { token, user }
    });

  } catch (error) {
    console.error('💥 注册失败:', error.message);
    return c.json<ApiResponse>({ 
      success: false, 
      message: `注册失败: ${error.message}` 
    }, 500);
  }
});

// 用户登录 - RESTful POST /api/auth/login
auth.post('/login', zValidator('json', loginSchema), async (c) => {
  try {
    const { email, password } = c.req.valid('json');
    console.log('🔐 用户登录请求:', email);
    console.log('📊 使用的表名: 12a2d3dc_users');

    // 验证数据库连接
    const userCollection = db.collection('12a2d3dc_users');
    console.log('📊 检查用户集合...');

    // 查找用户
    console.log('🔍 查询用户:', email);
    const user = await userCollection.findOne({ email });
    console.log('🔍 查询结果:', user ? '用户找到' : '用户不存在');
    
    if (!user) {
      console.log('❌ 用户不存在:', email);
      
      // 检查数据库中是否有任何用户
      const userCount = await userCollection.countDocuments();
      console.log('📊 数据库中用户总数:', userCount);
      
      return c.json<ApiResponse>({ 
        success: false, 
        message: '邮箱或密码错误。如果是首次使用，请先点击"初始化数据"按钮' 
      }, 401);
    }

    console.log('🔍 找到用户:', user.username, '密码验证...');

    // 验证密码
    // 如果用户密码是明文存储的（如演示账户），直接比较
    // 如果是哈希存储的，进行哈希比较
    let passwordMatch = false;
    
    if (user.password === password) {
      // 明文密码匹配（演示账户）
      passwordMatch = true;
      console.log('✅ 明文密码验证成功');
    } else if (user.password === simpleHash(password)) {
      // 哈希密码匹配
      passwordMatch = true;
      console.log('✅ 哈希密码验证成功');
    } else {
      console.log('❌ 密码错误');
    }

    if (!passwordMatch) {
      return c.json<ApiResponse>({ 
        success: false, 
        message: '邮箱或密码错误' 
      }, 401);
    }

    console.log('✅ 密码验证成功，开始生成JWT令牌...');

    // 生成JWT令牌 - 增强错误处理
    let token: string;
    try {
      console.log('🔐 调用generateToken函数...');
      token = await generateToken(user._id.toString(), user.username);
      console.log('✅ JWT令牌生成成功，令牌长度:', token.length);
    } catch (tokenError) {
      console.error('💥 JWT令牌生成过程出错:', tokenError);
      console.error('💥 令牌生成错误详情:', {
        message: tokenError.message,
        stack: tokenError.stack,
        userId: user._id.toString(),
        username: user.username
      });
      
      return c.json<ApiResponse>({ 
        success: false, 
        message: `令牌生成失败: ${tokenError.message}` 
      }, 500);
    }

    // 缓存用户会话到Redis（可选操作）
    console.log('💾 缓存用户会话到Redis...');
    try {
      await redis.set(RedisKeys.userSession(user._id.toString()), {
        userId: user._id.toString(),
        username: user.username,
        email: user.email,
      }, { ex: 86400 });
      console.log('✅ 用户会话缓存成功');
    } catch (redisError) {
      console.warn('⚠️ Redis缓存失败，但继续登录流程:', redisError.message);
    }

    console.log('🎉 用户登录成功:', user._id);

    const userData: User = {
      _id: user._id.toString(),
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return c.json<ApiResponse<AuthResponse>>({
      success: true,
      data: { token, user: userData }
    });

  } catch (error) {
    console.error('💥 登录过程发生异常:', error.message);
    console.error('💥 错误堆栈:', error.stack);
    
    // 提供更详细的错误信息用于调试
    return c.json<ApiResponse>({ 
      success: false, 
      message: `登录失败: ${error.message}。请检查服务端日志或先点击"初始化数据"按钮` 
    }, 500);
  }
});

// 获取当前用户信息 - RESTful GET /api/auth/me
auth.get('/me', async (c) => {
  try {
    const authorization = c.req.header('Authorization');
    
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return c.json<ApiResponse>({ 
        success: false, 
        message: '未提供认证令牌' 
      }, 401);
    }

    const token = authorization.substring(7);
    const payload = await verifyToken(token);

    if (!payload) {
      return c.json<ApiResponse>({ 
        success: false, 
        message: '无效的认证令牌' 
      }, 401);
    }

    // 优先从Redis缓存获取用户信息
    try {
      const cachedUser = await redis.get(RedisKeys.userSession(payload.userId));
      if (cachedUser) {
        const userData = JSON.parse(cachedUser);
        console.log('✅ 从Redis缓存获取用户信息:', userData.username);
        
        return c.json<ApiResponse<Partial<User>>>({
          success: true,
          data: userData
        });
      }
    } catch (redisError) {
      console.warn('⚠️ Redis读取失败，从数据库获取:', redisError.message);
    }

    // 从数据库获取用户信息
    const user = await db.collection('12a2d3dc_users').findOne({ 
      _id: new mongo.ObjectId(payload.userId) 
    });

    if (!user) {
      return c.json<ApiResponse>({ 
        success: false, 
        message: '用户不存在' 
      }, 404);
    }

    const userData: User = {
      _id: user._id.toString(),
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return c.json<ApiResponse<User>>({
      success: true,
      data: userData
    });

  } catch (error) {
    console.error('💥 获取用户信息失败:', error.message);
    return c.json<ApiResponse>({ 
      success: false, 
      message: `获取用户信息失败: ${error.message}` 
    }, 500);
  }
});

export default auth;