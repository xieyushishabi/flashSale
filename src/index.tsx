/**
 * 应用入口文件
 * 渲染React应用到DOM节点
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { setupPageLogger } from './utils/logger';

// 获取根DOM节点
const container = document.getElementById('root');
if (!container) {
  throw new Error('Root element not found');
}

// 创建React根节点并渲染应用
const root = createRoot(container);
setupPageLogger(); //确保日志容器在渲染前或渲染初创建
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// 在开发环境下输出技术栈信息
if (process.env.NODE_ENV === 'development') {
  console.log('🚀 秒杀系统启动成功！');
  console.log('📋 技术栈清单:');
  console.log('  课内技术: Redis');
  console.log('  课外技术: React, MongoDB');
  console.log('  其他技术: Node.js, JWT, WebSocket, RESTful, Elasticsearch, RabbitMQ, Highcharts, Docker, Nginx');
  console.log('💡 系统特性:');
  console.log('  • 高并发秒杀处理');
  console.log('  • 实时库存更新');
  console.log('  • 分布式锁防重复');
  console.log('  • 异步订单处理');
  console.log('  • 数据可视化分析');
  console.log('  • 全文搜索引擎');
}
