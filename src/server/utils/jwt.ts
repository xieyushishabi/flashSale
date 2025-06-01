/**
 * JWT工具类
 * 使用基础编码实现JWT令牌生成和验证
 * 避免使用任何受限的Node.js模块
 */

import config from '../config'; // Use the central configuration for JWT_SECRET

export interface JWTPayload {
  userId: string;
  username: string;
  exp: number;
}

// 简单的Base64编码函数 (UTF-8 safe)
function base64UrlEncode(str: string): string {
  // Convert UTF-8 string to Base64, then make it URL safe
  return Buffer.from(str, 'utf-8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

// 简单的Base64解码函数 (UTF-8 safe)
function base64UrlDecode(str: string): string {
  // Convert URL safe Base64 back to standard Base64
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  // Add padding if necessary
  while (base64.length % 4) {
    base64 += '=';
  }
  // Decode Base64 to UTF-8 string
  return Buffer.from(base64, 'base64').toString('utf-8');
}

// 简单的哈希函数（用于签名）
function simpleSign(data: string, secret: string): string {
  const combined = data + secret;
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // 转换为32位整数
  }
  return Math.abs(hash).toString(36);
}

export async function generateToken(userId: string, username: string): Promise<string> {
  try {
    console.log('🔐 开始生成JWT令牌，用户ID:', userId);
    
    // JWT Header
    const header = {
      alg: 'HS256',
      typ: 'JWT'
    };
    
    // JWT Payload
    const payload: JWTPayload = {
      userId,
      username,
      exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24), // 24小时过期
    };
    
    console.log('🔐 JWT Payload:', payload);
    
    // 编码Header和Payload
    const encodedHeader = base64UrlEncode(JSON.stringify(header));
    const encodedPayload = base64UrlEncode(JSON.stringify(payload));
    
    // 创建签名
    const dataToSign = `${encodedHeader}.${encodedPayload}`;
    const signature = simpleSign(dataToSign, config.JWT_SECRET);
    const encodedSignature = base64UrlEncode(signature);
    
    // 组装JWT
    const token = `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
    
    console.log('✅ JWT令牌生成成功，长度:', token.length);
    
    return token;
  } catch (error) {
    console.error('💥 JWT令牌生成失败:', error.message);
    console.error('💥 错误堆栈:', error.stack);
    throw new Error(`令牌生成失败: ${error.message}`);
  }
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    console.log('🔍 开始验证JWT令牌');
    
    // 分解JWT
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.log('❌ JWT格式无效');
      return null;
    }
    
    const [encodedHeader, encodedPayload, encodedSignature] = parts;
    
    // 验证签名
    const dataToSign = `${encodedHeader}.${encodedPayload}`;
    const expectedSignature = simpleSign(dataToSign, config.JWT_SECRET);
    const expectedEncodedSignature = base64UrlEncode(expectedSignature);
    
    if (encodedSignature !== expectedEncodedSignature) {
      console.log('❌ JWT签名验证失败');
      return null;
    }
    
    // 解码Payload
    const payloadStr = base64UrlDecode(encodedPayload);
    const payload = JSON.parse(payloadStr) as JWTPayload;
    
    // 检查过期时间
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) {
      console.log('❌ JWT已过期');
      return null;
    }
    
    console.log('✅ JWT令牌验证成功');
    return payload;
    
  } catch (error) {
    console.log('❌ JWT验证失败:', error.message);
    return null;
  }
}

export function extractTokenFromHeader(authorization?: string): string | null {
  if (!authorization || !authorization.startsWith('Bearer ')) {
    return null;
  }
  return authorization.substring(7);
}