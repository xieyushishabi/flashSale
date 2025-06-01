/**
 * 初始化数据按钮组件
 * 负责触发后端数据初始化操作
 * 提供用户友好的操作反馈
 */

import React, { useState } from 'react';
import { Settings } from 'lucide-react';
import toast from 'react-hot-toast';

export function InitDataButton() {
  const [isInitializing, setIsInitializing] = useState(false);

  const handleInit = async () => {
    const API_BASE = process.env.RSBUILD_APP_API_URL;
    
    console.log('🚀 开始初始化数据，API地址:', API_BASE);
    
    setIsInitializing(true);
    try {
      const initUrl = `${API_BASE}/products/init`;
      console.log('📡 请求初始化URL:', initUrl);
      
      const response = await fetch(initUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('📊 初始化响应状态:', response.status, response.statusText);
      console.log('📋 响应头:', Object.fromEntries(response.headers.entries()));
      
      // 处理服务端错误
      if (response.status >= 500) {
        const errorText = await response.text();
        console.error('💥 服务端初始化错误:', errorText);
        

        
        toast.error('服务器初始化失败，请检查服务端状态');
        return;
      }

      // 处理客户端错误
      if (!response.ok) {
        const errorText = await response.text();
        console.error('⚠️ 客户端初始化错误:', response.status, errorText);
        toast.error(`初始化失败 (${response.status}): ${errorText}`);
        return;
      }

      // 解析响应
      let result;
      try {
        result = await response.json();
        console.log('✅ 初始化响应结果:', result);
      } catch (parseError) {
        console.error('🔴 JSON解析失败:', parseError);
        toast.error('响应格式错误');
        return;
      }

      if (result.success) {
        console.log('🎉 数据初始化成功！');
        toast.success('商品数据初始化成功！', {
          duration: 3000,
          icon: '🎉',
        });
        
        // 不使用页面重载，而是通过事件通知HomePage刷新数据
        // 延迟一下确保后端处理完成，然后触发自定义事件
        setTimeout(() => {
          console.log('📢 触发数据刷新事件');
          window.dispatchEvent(new CustomEvent('productsInitialized'));
        }, 1000);
        
      } else {
        console.error('❌ 初始化返回失败:', result.message);
        toast.error(result.message || '初始化失败');
      }

    } catch (error) {
      console.error('💥 初始化数据网络错误:', error);
      toast.error(`网络错误: ${error.message}`);
    } finally {
      setIsInitializing(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={handleInit}
        disabled={isInitializing}
        className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white px-4 py-2 rounded-xl font-medium shadow-lg transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Settings className="w-4 h-4" />
        <span>{isInitializing ? '初始化中...' : '初始化数据'}</span>
        {isInitializing && (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin ml-1" />
        )}
      </button>
    </div>
  );
}
