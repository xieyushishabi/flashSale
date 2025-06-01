// src/server/config.ts
import dotenv from 'dotenv';
import path from 'path';

// 确定 .env.development 文件的路径
const envPath = path.resolve(process.cwd(), '.env.development');

// 加载环境变量
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error('[ConfigModule] FATAL: Error loading .env.development file. Please ensure it exists and is readable.', result.error);
  // 在配置加载失败时，关键服务无法启动，因此直接退出进程
  process.exit(1);
}

// 从 process.env 中获取已加载的变量
const DATABASE_URL = process.env.DATABASE_URL;
const SERVER_PORT_STRING = process.env.SERVER_PORT;
const RSBUILD_APP_API_URL = process.env.RSBUILD_APP_API_URL; // 前端可能需要的API URL
const JWT_SECRET = process.env.JWT_SECRET || 'YOUR_DEFAULT_JWT_SECRET_REPLACE_ME'; // JWT密钥，带默认值

// 验证必要的环境变量
if (!DATABASE_URL) {
  console.error('[ConfigModule] FATAL: DATABASE_URL is not defined in .env.development or environment.');
  process.exit(1);
}

if (!SERVER_PORT_STRING) {
  console.error('[ConfigModule] FATAL: SERVER_PORT is not defined in .env.development or environment.');
  process.exit(1);
}

const SERVER_PORT = parseInt(SERVER_PORT_STRING, 10);
if (isNaN(SERVER_PORT)) {
  console.error('[ConfigModule] FATAL: SERVER_PORT is not a valid number.');
  process.exit(1);
}

// 导出配置对象
const config = {
  DATABASE_URL,
  SERVER_PORT,
  RSBUILD_APP_API_URL, // 如果后端也需要知道前端的API基路径
  JWT_SECRET,
  // 您可以在此添加其他从环境变量加载的配置
};

console.log('[ConfigModule] Configuration loaded successfully.');
console.log(`[ConfigModule] DATABASE_URL: ${config.DATABASE_URL ? 'Loaded' : 'MISSING!'}`);
console.log(`[ConfigModule] SERVER_PORT: ${config.SERVER_PORT}`);

export default config;
