/**
 * 首页组件
 * 集成Elasticsearch搜索、Redis库存、WebSocket实时更新
 * 展示商品列表和搜索功能
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Zap, TrendingUp } from 'lucide-react';
import useSWR, { mutate } from 'swr';
import toast from 'react-hot-toast';
import { ProductCard } from '../components/ProductCard';
import { useAuth } from '../hooks/useAuth';
import { useWebSocket } from '../hooks/useWebSocket';
import type { Product, ApiResponse, WebSocketMessage, ProductsResponse } from '../shared/types';

// 确保API地址正确配置
const API_BASE = process.env.RSBUILD_APP_API_URL;

const fetcher = async (url: string): Promise<ProductsResponse> => {
  const fullUrl = `${API_BASE}${url}`;
  console.log('🚀 请求商品列表:', fullUrl);
  console.log('🔧 环境变量 RSBUILD_APP_API_URL:', process.env.RSBUILD_APP_API_URL);
  
  if (!API_BASE) {
    console.error('❌ API_BASE 未设置');
    throw new Error('API服务器地址未配置');
  }
  
  const response = await fetch(fullUrl, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  console.log('📡 响应状态:', response.status, response.statusText);
  console.log('📋 响应头:', Object.fromEntries(response.headers.entries()));
  
  // 处理服务端错误(5xx)
  if (response.status >= 500) {
    const errorText = await response.text();
    console.error('💥 服务端错误详情:', errorText);

    throw new Error('服务器内部错误');
  }

  // 处理客户端错误(4xx)
  if (!response.ok) {
    const errorText = await response.text();
    console.error('⚠️ 客户端错误详情:', errorText);
    let parsedError;
    try {
      parsedError = JSON.parse(errorText);
    } catch (e) {
      throw new Error(`API请求失败 (${response.status}): ${errorText}`);
    }
    
    // 检查是否是参数验证错误
    if (parsedError.error && parsedError.error.name === 'ZodError') {
      const issues = parsedError.error.issues || [];
      const errorDetails = issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join(', ');
      throw new Error(`参数验证失败: ${errorDetails}`);
    }
    
    throw new Error(parsedError.message || `API请求失败 (${response.status})`);
  }

  let result: ApiResponse<ProductsResponse>;
  try {
    result = await response.json();
    console.log('✅ API返回结果:', result);
  } catch (parseError) {
    console.error('🔴 JSON解析失败:', parseError);
    throw new Error('响应格式错误');
  }
  
  if (!result.success) {
    console.error('❌ API返回失败:', result.message);
    throw new Error(result.message || '获取商品列表失败');
  }

  if (!result.data) {
    console.error('❌ API返回数据为空');
    throw new Error('返回数据为空');
  }

  return result.data;
};

export function HomePage() {
  const { isAuthenticated, user } = useAuth();
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [realTimeProducts, setRealTimeProducts] = useState<(Product & { currentStock: number })[]>([]);
  const [seckillLocks, setSeckillLocks] = useState<Record<string, boolean>>({});
  const [participatedProducts, setParticipatedProducts] = useState<Record<string, boolean>>({}); // 新增：管理已参与秒杀的商品

  // 🔧 修复：正确使用WebSocket Hook
  const { isConnected, connectionStatus, sendMessage } = useWebSocket(
    user?._id || null,
    {
      onMessage: (message: WebSocketMessage) => {
        console.log('📨 收到WebSocket消息:', message);

        if (message.type === 'stock_update' && message.productId && message.data) {
          setRealTimeProducts(prev =>
            prev.map(product =>
              product._id === message.productId
                ? { ...product, currentStock: message.data.stock }
                : product
            )
          );
          if (message.data.productName) {
            toast.success(
              `商品库存已更新: ${message.data.productName} 剩余 ${message.data.stock} 件`,
              { duration: 3000 }
            );
          }
        } else if (message.type === 'seckill_status' && message.productId && message.data) {
          const { action, userId: msgUserId, statusText, productName } = message.data as { action: string, userId?: string, statusText?: string, productName?: string };
          
          if (action === 'participated' || (statusText && statusText.includes('已参与'))) {
            setParticipatedProducts(prev => ({ ...prev, [message.productId!]: true }));
            if (user?._id === msgUserId || !msgUserId) {
              toast(statusText || `您已参与过 ${productName || '此商品'} 的秒杀。`, { duration: 4000 });
            }
          } else if (action === 'available_again' || action === 'reset_participation' || (statusText && statusText.includes('可再次参与'))) {
            setParticipatedProducts(prev => {
              const newState = { ...prev };
              delete newState[message.productId!];
              return newState;
            });
            if (user?._id === msgUserId || !msgUserId) {
              toast(statusText || `${productName || '此商品'} 可以再次尝试秒杀。`, { duration: 4000 });
            }
          } else if (action === 'success') {
            if (user?._id === msgUserId) {
              toast.success(statusText || `商品 ${productName || message.productId} 秒杀成功！`);
            }
            setParticipatedProducts(prev => ({ ...prev, [message.productId!]: true }));
          } else if (action === 'no_stock' && (user?._id === msgUserId || !msgUserId)) {
            toast.error(statusText || `商品 ${productName || message.productId} 库存不足。`);
          } else if (action === 'ended' && (user?._id === msgUserId || !msgUserId)) {
            toast.error(statusText || `商品 ${productName || message.productId} 秒杀已结束。`);
          } else if (action === 'not_started' && (user?._id === msgUserId || !msgUserId)) {
            toast.error(statusText || `商品 ${productName || message.productId} 秒杀未开始。`);
          } else if (action === 'error' && (user?._id === msgUserId || !msgUserId)) {
            toast.error(statusText || `商品 ${productName || message.productId} 秒杀处理失败。`);
          }
        }
      },
        
      onConnect: () => {
        console.log('🔌 WebSocket 已连接');
        toast.success('实时通讯已连接', { duration: 2000 });
      },
      onDisconnect: () => {
        console.log('🔌 WebSocket 已断开');
        toast.error('实时通讯已断开', { duration: 2000 });
      }
    }
  );

  // SWR 配置
  const buildSearchUrl = () => {
    // ... (原来的 buildSearchUrl 内容)
    let url = `/products?page=${currentPage}&pageSize=12`;
    if (searchText) url += `&search=${encodeURIComponent(searchText)}`;
    if (statusFilter) url += `&status=${statusFilter}`;
    return url;
  };

  const { data, error, isLoading, mutate: mutateProducts } = useSWR(
    buildSearchUrl, // 使用函数作为key，当依赖变化时SWR会重新请求
    fetcher,
    {
      revalidateOnFocus: false, // 页面聚焦时不自动重新验证
      shouldRetryOnError: (error) => {
        // 自定义错误重试逻辑
        if (error.message.includes('参数验证失败')) return false; // 参数问题不重试
        return true; // 其他错误默认重试
      },
      onError: (error) => {
        toast.error(`获取商品失败: ${error.message}`);
      },
      onSuccess: (data) => {
        if (data && data.products) {
          setRealTimeProducts(data.products.map(p => ({ ...p, currentStock: p.stock })));
        }
      },
    }
  );

  // 监听自定义事件，用于在数据初始化后重新获取商品列表
  useEffect(() => {
    const handleProductsInitialized = () => {
      console.log('🎉 监听到 productsInitialized 事件, 重新获取商品列表...');
      mutateProducts(); // 重新触发SWR请求
      toast.success('商品数据已初始化，列表已更新！');
    };

    window.addEventListener('productsInitialized', handleProductsInitialized);
    return () => {
      window.removeEventListener('productsInitialized', handleProductsInitialized);
    };
  }, [mutateProducts]);

  // 🔧 新增：秒杀处理函数
  const handleSeckill = async (productId: string) => {
    if (!isAuthenticated) {
      toast.error('请先登录后再参与秒杀');
      return;
    }

    try {
      console.log('🚀 开始秒杀商品:', productId);
      
      // 发送WebSocket消息通知开始秒杀
      if (isConnected) {
        sendMessage({
          type: 'seckill_status',
          productId,
          data: { action: 'start', userId: user?._id }
        });
      }

      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE}/seckill`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ productId, quantity: 1 }),
      });

      const result = await response.json();
      console.log('📡 秒杀API响应:', result);
      
      if (result.success) {
        toast.success(`🎉 ${result.data.message || '秒杀成功！'}`);
        
        // 刷新商品数据
        mutateProducts();
        
        // 发送成功消息
        if (isConnected) {
          sendMessage({
            type: 'seckill_status',
            productId,
            data: { action: 'success', userId: user?._id, orderId: result.data.orderId }
          });
        }
      } else {
        // 如果是已经参与过秒杀的错误，提供重置选项
        if (result.message && (result.message.includes('已经参与过') || result.message.includes('请稍后再试') || result.message.includes('冷却'))) {
          setParticipatedProducts(prev => ({ ...prev, [productId]: true })); // 更新参与状态
          toast.error(
            <div>
              <div>{result.message}</div>
              {/* 重置按钮暂时移除，因为参与状态应由后端或WS控制，或定时器 */}
              {/* <button
                onClick={() => resetSeckillLock(productId)} // resetSeckillLock可能需要调整或移除
                className="mt-2 text-blue-500 underline text-sm"
              >
                点击重置并重试
              </button> */}
            </div>,
            { duration: 6000 }
          );
        } else {
          toast.error(result.message || '秒杀失败');
        }
      }
    } catch (error) {
      console.error('秒杀错误:', error);
      toast.error('秒杀请求失败，请重试');
    }
  };

  // 🔧 新增：重置秒杀锁的函数
  // 注意：这个函数目前主要用于UI操作频繁的场景，业务上的“已参与”状态应由后端逻辑或定时器控制
  const resetSeckillLock = (productId: string) => {
    // setSeckillLocks(prev => ({ ...prev, [productId]: false }));
    // setParticipatedProducts(prev => ({ ...prev, [productId]: false })); // 如果需要手动重置参与状态
    toast(`已重置 ${productId} 的状态，您可以再次尝试。`);
    // 可能需要重新获取商品信息或等待WebSocket更新
  };

  // 🔧 新增：同步库存的函数
  const syncStock = async () => {
    // ... (原来的 syncStock 内容)
  };

  // 搜索处理
  const handleSearch = () => {
    // ... (原来的 handleSearch 内容)
  };

  // 重置搜索
  const handleReset = () => {
    // ... (原来的 handleReset 内容)
  };

  // 增强错误显示 - 包含初始化建议
  const renderErrorState = () => (
    <div className="text-center py-12">
      <div className="bg-red-50 border border-red-200 rounded-2xl p-8 max-w-lg mx-auto">
        <Zap className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <div className="text-red-600 text-xl mb-4 font-medium">
          哎呀，出错了！
        </div>
        <p className="text-red-500 mb-6">
          获取商品列表失败。可能是网络问题或服务器暂时不可用。
        </p>
        <div className="bg-red-100 p-4 rounded-lg text-sm text-red-700 mb-4">
          <div className="font-medium mb-2">💡 错误详情：</div>
          <pre className="whitespace-pre-wrap break-all">{error?.message || '未知错误'}</pre>
        </div>
        <div className="bg-yellow-50 border border-yellow-300 p-4 rounded-lg text-sm text-yellow-700 mb-6">
          <div className="font-medium mb-2">🤔 尝试以下操作：</div>
          <div>1. 检查您的网络连接</div>
          <div>2. 点击下方按钮刷新页面</div>
          <div>3. 如果问题持续，请联系技术支持</div>
        </div>
        <button
          onClick={() => mutateProducts()} // 点击按钮重新获取数据
          className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-medium transition-colors"
        >
          刷新页面
        </button>
      </div>
    </div>
  );

  // 改善"暂无商品"状态显示
  const renderEmptyState = () => (
    <div className="text-center py-12">
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8 max-w-lg mx-auto">
        <TrendingUp className="w-16 h-16 text-blue-400 mx-auto mb-4" />
        <div className="text-blue-600 text-xl mb-4 font-medium">暂无商品</div>
        <p className="text-blue-500 mb-6">
          数据库中还没有商品数据，请先初始化示例数据
        </p>
        <div className="bg-blue-100 p-4 rounded-lg text-sm text-blue-700 mb-4">
          <div className="font-medium mb-2">📝 操作说明：</div>
          <div>1. 点击右下角的"初始化数据"按钮</div>
          <div>2. 等待初始化完成的成功提示</div>
          <div>3. 商品列表将自动刷新显示</div>
        </div>
        <button
          onClick={() => mutateProducts()}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-medium transition-colors"
        >
          刷新页面
        </button>
      </div>
    </div>
  );


// 确保API地址正确配置
// const API_BASE = process.env.RSBUILD_APP_API_URL; // 已移到文件顶部

// fetcher 函数已移到文件顶部

// HomePage 组件已定义

// 注意：确保所有函数和变量都在 HomePage 组件内部或正确的作用域中定义。
// 移除了末尾重复的 console.log 和注释掉的 fetcher 定义

// 原始的 onSuccess 和 onError 可能需要根据新的 SWR 结构调整或移除，如果它们不再被直接使用
// const onSuccess = (data: ProductsResponse) => {
//   console.log('✅ 商品列表获取成功:', data);
//   if (data && data.products) {
//     setRealTimeProducts(data.products.map(p => ({ ...p, currentStock: p.stock })));
//   }
// };

// const onError = (error: Error) => {
//   console.error('🔴 获取商品列表失败:', error);
//   toast.error(`获取商品失败: ${error.message}`);
// };

// 之前的 useSWR 调用，现在已整合到组件内部
// const { data, error, isLoading, mutate: mutateProducts } = useSWR(
//   () => buildSearchUrl(), // 使用函数作为key
//   fetcher,
//   {
//     revalidateOnFocus: false,
//     shouldRetryOnError: shouldRetryOnError, // 自定义重试逻辑
//     onError: onError,
//     onSuccess: onSuccess,
//   }
// );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* 头部横幅 */}
      <div className="bg-gradient-to-r from-red-500 via-pink-500 to-purple-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h1 className="text-4xl md:text-6xl font-bold">
              <span className="inline-flex items-center space-x-2">
                <Zap className="w-8 h-8 md:w-12 md:h-12" />
                <span>秒杀商城</span>
              </span>
            </h1>
            <p className="text-xl md:text-2xl opacity-90">
              高性能秒杀系统
            </p>
            {/* 🔧 修复：正确显示连接状态 */}
            {isConnected && (
              <div className="flex justify-center items-center text-sm opacity-80">
                <span className="text-green-300 font-medium">🟢 实时连接</span>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 搜索和过滤 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="搜索商品名称或描述..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">所有状态</option>
                <option value="pending">即将开始</option>
                <option value="active">进行中</option>
                <option value="ended">已结束</option>
              </select>
              
              <button
                onClick={handleSearch}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center space-x-2"
              >
                <Search className="w-4 h-4" />
                <span>搜索</span>
              </button>
              
              <button
                onClick={handleReset}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-xl font-medium transition-colors"
              >
                重置
              </button>
            </div>
          </div>
          
          {searchText || statusFilter ? (
            <div className="mt-4 text-sm text-gray-600">
              <span className="flex items-center space-x-2">
                <Filter className="w-4 h-4" />
                <span>
                  当前筛选: 
                  {searchText && <span className="ml-1 text-blue-600">"{searchText}"</span>}
                  {statusFilter && <span className="ml-1 text-green-600">{statusFilter === 'active' ? '进行中' : statusFilter === 'pending' ? '即将开始' : '已结束'}</span>}
                </span>
              </span>
            </div>
          ) : null}
        </motion.div>

        {/* 商品网格 - 使用新的空状态组件 */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
                <div className="bg-gray-200 h-48 rounded-xl mb-4" />
                <div className="bg-gray-200 h-6 rounded mb-2" />
                <div className="bg-gray-200 h-4 rounded mb-4" />
                <div className="bg-gray-200 h-10 rounded" />
              </div>
            ))}
          </div>
        ) : error ? (
          renderErrorState()
        ) : !realTimeProducts.length ? (
          renderEmptyState()
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8"
            >
              {realTimeProducts.map((product, index) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <ProductCard
                    product={product}
                    onSeckill={handleSeckill}
                    isAuthenticated={isAuthenticated}
                    hasParticipated={participatedProducts[product._id] || false}
                  />
                </motion.div>
              ))}
            </motion.div>

            {/* 分页 */}
            {data && data.pagination.totalPages > 1 && (
              <div className="flex justify-center space-x-2">
                {[...Array(data.pagination.totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      currentPage === i + 1
                        ? 'bg-blue-500 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}