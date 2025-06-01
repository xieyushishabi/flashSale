/**
 * 应用底部组件
 * 负责显示项目信息
 * 提供简洁的页脚展示
 */

import React from 'react';

export function AppFooter() {
  return (
    <footer className="bg-gray-800 text-white py-8 mt-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center text-gray-400 text-sm">
          <p>
            演示项目 | 高性能秒杀系统
          </p>
        </div>
      </div>
    </footer>
  );
}