/**
 * 商品卡片组件
 * 展示商品信息，集成秒杀功能和实时库存更新
 * 使用Redis缓存的库存数据和WebSocket实时推送
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, ShoppingCart, Users, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Product } from '../shared/types';

// Import local images
import iPhoneImg from '../assets/images/iPhone.jpeg';
import oppoImg from '../assets/images/oppo.jpeg';
import vivoImg from '../assets/images/vivo.jpeg';
import huaweiImg from '../assets/images/华为.jpeg';
import xiaomiImg from '../assets/images/小米.jpeg';

// Create an image map
const imageMap: { [key: string]: string } = {
  'iPhone.jpeg': iPhoneImg,
  'oppo.jpeg': oppoImg,
  'vivo.jpeg': vivoImg,
  '华为.jpeg': huaweiImg,
  '小米.jpeg': xiaomiImg,
  // Add a default or placeholder image if needed
  'default.jpeg': iPhoneImg, // Example: use iPhone image as a fallback
};

interface ProductCardProps {
  product: Product & { currentStock: number };
  onSeckill?: (productId: string) => void;
  isAuthenticated: boolean;
  hasParticipated?: boolean;
}

export function ProductCard({ product, onSeckill, isAuthenticated }: ProductCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [currentStock, setCurrentStock] = useState(product.currentStock);

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleString('zh-CN');
  };

  const getTimeRemaining = () => {
    const now = new Date();
    const start = new Date(product.startTime);
    const end = new Date(product.endTime);

    if (now < start) {
      const diff = start.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      return `${hours}小时${minutes}分钟后开始`;
    } else if (now < end) {
      const diff = end.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      return `${hours}小时${minutes}分钟后结束`;
    } else {
      return '已结束';
    }
  };

  const getStatusColor = () => {
    const now = new Date();
    const start = new Date(product.startTime);
    const end = new Date(product.endTime);

    if (now < start) return 'text-yellow-600';
    if (now >= start && now < end && currentStock > 0) return 'text-green-600';
    return 'text-red-600';
  };

  const getStatusText = () => {
    const now = new Date();
    const start = new Date(product.startTime);
    const end = new Date(product.endTime);

    if (now < start) return '即将开始';
    if (now >= start && now < end && currentStock > 0) return '进行中';
    if (currentStock === 0) return '已抢完';
    return '已结束';
  };

  const canSeckill = () => {
    const now = new Date();
    const start = new Date(product.startTime);
    const end = new Date(product.endTime);
    return isAuthenticated && now >= start && now < end && currentStock > 0;
  };

  const handleSeckill = async () => {
    if (!canSeckill()) {
      if (!isAuthenticated) {
        toast.error('请先登录');
      } else {
        toast.error('当前无法参与秒杀');
      }
      return;
    }

    setIsLoading(true);
    try {
      await onSeckill?.(product._id);
      // 乐观更新库存
      setCurrentStock(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('秒杀失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const discountPercentage = Math.round(
    ((product.originalPrice - product.seckillPrice) / product.originalPrice) * 100
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300"
    >
      <div className="relative">
        <img
          src={imageMap[product.image] || imageMap['default.jpeg']}
          alt={product.name}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-bold">
          -{discountPercentage}%
        </div>
        <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-sm font-medium ${
          getStatusColor() === 'text-green-600' ? 'bg-green-100 text-green-600' :
          getStatusColor() === 'text-yellow-600' ? 'bg-yellow-100 text-yellow-600' :
          'bg-red-100 text-red-600'
        }`}>
          {getStatusText()}
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">
          {product.name}
        </h3>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {product.description}
        </p>

        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-red-500">
                ¥{product.seckillPrice.toLocaleString()}
              </span>
              <span className="text-gray-400 line-through text-sm">
                ¥{product.originalPrice.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <Users className="w-4 h-4" />
              <span>库存 {currentStock}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>{getTimeRemaining()}</span>
            </div>
          </div>

          <div className="bg-gray-100 rounded-lg p-3 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>开始时间:</span>
              <span>{formatTime(product.startTime)}</span>
            </div>
            <div className="flex justify-between mt-1">
              <span>结束时间:</span>
              <span>{formatTime(product.endTime)}</span>
            </div>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: canSeckill() ? 1.02 : 1 }}
          whileTap={{ scale: canSeckill() ? 0.98 : 1 }}
          onClick={handleSeckill}
          disabled={!canSeckill() || isLoading}
          className={`w-full py-3 px-4 rounded-xl font-bold text-white transition-all duration-200 flex items-center justify-center space-x-2 ${
            canSeckill()
              ? 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 shadow-lg hover:shadow-xl'
              : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>抢购中...</span>
            </div>
          ) : (
            <>
              <Zap className="w-4 h-4" />
              <span>
                {canSeckill() ? '立即抢购' : 
                 !isAuthenticated ? '请先登录' :
                 currentStock === 0 ? '已抢完' : '无法抢购'}
              </span>
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}
