/**
 * 统计页面组件
 * 使用Highcharts展示秒杀系统数据分析
 * 集成实时数据更新和多维度统计
 */

import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Users, ShoppingCart } from 'lucide-react';
import useSWR from 'swr';
import { StatsChart } from '../components/StatsChart';
import type { SeckillStats, ApiResponse } from '../shared/types';

const API_BASE = process.env.RSBUILD_APP_API_URL;

const fetcher = async (url: string): Promise<SeckillStats> => {
  const response = await fetch(`${API_BASE}${url}`);
  
  if (response.status >= 500) {
    const errorText = await response.text();

    throw new Error('服务器错误');
  }

  if (!response.ok) {
    throw new Error('获取统计数据失败');
  }

  const result: ApiResponse<SeckillStats> = await response.json();
  if (!result.success) {
    throw new Error(result.message || '获取统计数据失败');
  }

  return result.data!;
};

export function StatsPage() {
  const { data: stats, error, isLoading, mutate } = useSWR(
    '/seckill/stats',
    fetcher,
    {
      refreshInterval: 60000, // 每分钟刷新
      revalidateOnFocus: false,
    }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <div className="text-xl font-medium text-gray-700">正在加载统计数据...</div>
          <div className="text-gray-500 mt-2">使用 Highcharts 渲染图表</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <div className="text-xl font-medium text-red-600 mb-4">加载统计数据失败</div>
          <button
            onClick={() => mutate()}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-medium transition-colors"
          >
            重新加载
          </button>
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const totalRevenue = stats.hourlyStats.reduce((sum, item) => sum + item.revenue, 0);
  const avgOrderValue = stats.totalOrders > 0 ? totalRevenue / stats.totalOrders : 0;
  const successRate = stats.totalOrders > 0 ? (stats.successfulOrders / stats.totalOrders) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* 头部 */}
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4"
          >
            <h1 className="text-4xl md:text-5xl font-bold flex items-center justify-center space-x-3">
              <BarChart3 className="w-10 h-10 md:w-12 md:h-12" />
              <span>数据统计中心</span>
            </h1>
            <p className="text-xl md:text-2xl opacity-90">
              实时数据可视化
            </p>
            <div className="text-sm opacity-80">
              数据每分钟自动更新 • 多维度分析 • 实时监控
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 核心指标概览 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <ShoppingCart className="w-8 h-8 opacity-80" />
              <div className="text-sm opacity-80">总收入</div>
            </div>
            <div className="text-3xl font-bold">¥{totalRevenue.toLocaleString()}</div>
            <div className="text-blue-100 text-sm mt-2">
              24小时累计收入
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8 opacity-80" />
              <div className="text-sm opacity-80">成功率</div>
            </div>
            <div className="text-3xl font-bold">{successRate.toFixed(1)}%</div>
            <div className="text-green-100 text-sm mt-2">
              订单成功率
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 opacity-80" />
              <div className="text-sm opacity-80">客单价</div>
            </div>
            <div className="text-3xl font-bold">¥{avgOrderValue.toFixed(0)}</div>
            <div className="text-purple-100 text-sm mt-2">
              平均订单金额
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-500 to-red-600 text-white p-6 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <BarChart3 className="w-8 h-8 opacity-80" />
              <div className="text-sm opacity-80">活跃度</div>
            </div>
            <div className="text-3xl font-bold">
              {stats.totalProducts > 0 ? Math.round((stats.activeProducts / stats.totalProducts) * 100) : 0}%
            </div>
            <div className="text-red-100 text-sm mt-2">
              商品活跃率
            </div>
          </div>
        </motion.div>

        {/* Highcharts图表展示 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <StatsChart 
            stats={stats} 
            title="秒杀系统数据大屏"
          />
        </motion.div>

        {/* 技术说明 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6"
        >
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center space-x-2">
            <BarChart3 className="w-6 h-6" />
            <span>技术栈说明</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div className="bg-white p-4 rounded-lg">
              <div className="font-medium text-blue-600 mb-2">📊 Highcharts</div>
              <div className="text-gray-600">专业的数据可视化图表库，支持多种图表类型和交互效果</div>
            </div>
            
            <div className="bg-white p-4 rounded-lg">
              <div className="font-medium text-green-600 mb-2">🔄 SWR</div>
              <div className="text-gray-600">数据获取库，提供缓存、重新验证和自动刷新功能</div>
            </div>
            
            <div className="bg-white p-4 rounded-lg">
              <div className="font-medium text-purple-600 mb-2">⚡ 实时更新</div>
              <div className="text-gray-600">每分钟自动刷新数据，保证统计信息的实时性</div>
            </div>
          </div>
        </motion.div>

        {/* 数据刷新按钮 */}
        <div className="text-center mt-8">
          <button
            onClick={() => mutate()}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            手动刷新数据
          </button>
          <div className="text-gray-500 text-sm mt-2">
            最后更新: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>
    </div>
  );
}