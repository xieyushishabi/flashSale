/**
 * 订单页面组件
 * 负责显示用户的秒杀订单记录
 * 集成身份验证和数据获取逻辑
 */

import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export function OrdersPage() {
  const { user, isAuthenticated, isLoading, verifyAuth } = useAuth();
  const [orders, setOrders] = React.useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = React.useState(true);
  const [authChecked, setAuthChecked] = React.useState(false);

  // 改进认证检查逻辑
  React.useEffect(() => {
    const checkAuth = async () => {
      console.log('🔐 订单页面认证检查:', { isAuthenticated, isLoading, hasToken: !!localStorage.getItem('auth_token') });
      
      // 如果正在加载认证状态，等待
      if (isLoading) {
        console.log('🔐 认证状态加载中，等待...');
        return;
      }
      
      // 如果已经认证，直接获取订单
      if (isAuthenticated) {
        console.log('✅ 用户已认证，获取订单');
        await fetchOrders();
        setAuthChecked(true);
        return;
      }
      
      // 如果有token但认证状态为false，尝试验证
      const token = localStorage.getItem('auth_token');
      if (token && !isAuthenticated) {
        console.log('🔐 检测到token但未认证，尝试验证...');
        const verified = await verifyAuth();
        if (verified) {
          console.log('✅ 验证成功，获取订单');
          await fetchOrders();
        } else {
          console.log('❌ 验证失败，跳转登录');
        }
      }
      
      setAuthChecked(true);
    };

    checkAuth();
  }, [isAuthenticated, isLoading, verifyAuth]);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        console.log('❌ 获取订单失败：无token');
        return;
      }

      console.log('📦 开始获取订单...');
      const response = await fetch(`${process.env.RSBUILD_APP_API_URL}/seckill/orders`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('📦 订单API响应状态:', response.status);

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          console.log('✅ 订单获取成功，数量:', result.data?.length || 0);
          setOrders(result.data || []);
        } else {
          console.log('❌ 订单API返回失败:', result.message);
        }
      } else {
        console.log('❌ 订单API请求失败:', response.status);
      }
    } catch (error) {
      console.error('💥 获取订单网络错误:', error);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  // 改进加载和认证检查逻辑
  if (!authChecked || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <div className="text-xl font-medium text-gray-700">验证身份中...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('🔐 用户未认证，跳转登录页面');
    return <Navigate to="/login" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="bg-gradient-to-r from-green-500 via-teal-500 to-blue-500 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold flex items-center justify-center space-x-3">
            <ShoppingBag className="w-10 h-10" />
            <span>我的订单</span>
          </h1>
          <p className="text-xl opacity-90 mt-2">查看您的秒杀订单记录</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {isLoadingOrders ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <div className="text-xl text-gray-700">加载订单中...</div>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <div className="text-xl text-gray-600 mb-4">暂无订单</div>
            <Link 
              to="/"
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-medium transition-colors"
            >
              去购物
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order: any) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="text-lg font-bold">订单 #{order._id.slice(-8)}</div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    order.status === 'confirmed' ? 'bg-green-100 text-green-600' :
                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-red-100 text-red-600'
                  }`}>
                    {order.status === 'confirmed' ? '已确认' :
                     order.status === 'pending' ? '处理中' : '已取消'}
                  </div>
                </div>

                {order.product && (
                  <div className="flex items-center space-x-4 mb-4">
                    <img
                      src={order.product.image}
                      alt={order.product.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <div className="font-medium">{order.product.name}</div>
                      <div className="text-gray-600">数量: {order.quantity}</div>
                    </div>
                    <div className="text-xl font-bold text-red-500">
                      ¥{order.price.toLocaleString()}
                    </div>
                  </div>
                )}

                <div className="text-sm text-gray-500">
                  创建时间: {new Date(order.createdAt).toLocaleString()}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
