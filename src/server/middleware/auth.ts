/**
 * JWT认证中间件
 * 用于验证API请求的身份认证
 */

import { Context, Next } from 'hono';
import { verifyToken, extractTokenFromHeader } from '../utils/jwt';

interface AuthContext extends Context {
  user?: any;
}

export async function authenticateToken(c: AuthContext, next: Next) {
  try {
    console.log('开始身份验证...');

    // 从请求头中提取token
    const token = extractTokenFromHeader(c.req.header('Authorization'));
    
    if (!token) {
      console.log('访问令牌缺失');
      return c.json({ 
        success: false, 
        message: '访问令牌缺失' 
      }, 401);
    }

    // 验证token
    const decoded = await verifyToken(token);
    if (!decoded) {
      console.log('访问令牌无效');
      return c.json({ 
        success: false, 
        message: '访问令牌无效' 
      }, 401);
    }

    console.log('Token验证成功，用户ID:', decoded.userId);

    // 获取用户信息
    const user = await db.collection('12a2d3dc_users').findOne({
      _id: new mongo.ObjectId(decoded.userId)
    });

    if (!user) {
      console.log('用户不存在:', decoded.userId);
      return c.json({ 
        success: false, 
        message: '用户不存在' 
      }, 401);
    }

    // 将用户信息添加到上下文中
    c.set('user', {
      ...user,
      _id: user._id.toString(),
    });

    console.log('用户认证成功:', user.username);
    await next();
    
  } catch (error) {
    console.error('认证失败:', error.message);
    return c.json({ 
      success: false, 
      message: '认证失败' 
    }, 401);
  }
}

// 可选的认证中间件，允许请求通过但会尝试获取用户信息
export async function optionalAuth(c: AuthContext, next: Next) {
  try {
    const token = extractTokenFromHeader(c.req.header('Authorization'));
    
    if (token) {
      const decoded = await verifyToken(token);
      if (decoded) {
        const user = await db.collection('12a2d3dc_users').findOne({
          _id: new mongo.ObjectId(decoded.userId)
        });
        
        if (user) {
          c.set('user', {
            ...user,
            _id: user._id.toString(),
          });
        }
      }
    }
    
    await next();
  } catch (error) {
    console.log('可选认证失败，继续请求:', error.message);
    await next();
  }
}