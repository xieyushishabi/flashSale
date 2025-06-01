/**
 * 登录页面组件
 * 负责用户登录和注册功能
 * 使用自定义认证Hook管理状态
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export function LoginPage() {
  const { login, register, isLoading } = useAuth();
  const [isLoginMode, setIsLoginMode] = React.useState(true);
  const [formData, setFormData] = React.useState({
    username: '',
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLoginMode) {
      const success = await login(formData.email, formData.password);
      if (success) {
        window.location.hash = '#/';
      }
    } else {
      const success = await register(formData.username, formData.email, formData.password);
      if (success) {
        window.location.hash = '#/';
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 text-3xl font-bold text-gray-800 mb-2">
            <Zap className="w-8 h-8 text-blue-500" />
            <span>秒杀商城</span>
          </div>
          <p className="text-gray-600">
            {isLoginMode ? '登录您的账户' : '创建新账户'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLoginMode && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                用户名
              </label>
              <input
                type="text"
                required
                value={formData.username}
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="请输入用户名"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              邮箱
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="请输入邮箱地址"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              密码
            </label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="请输入密码"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50"
          >
            {isLoading ? '处理中...' : (isLoginMode ? '登录' : '注册')}
          </button>
        </form>

        <div className="text-center mt-6">
          <button
            onClick={() => setIsLoginMode(!isLoginMode)}
            className="text-blue-500 hover:text-blue-600 font-medium"
          >
            {isLoginMode ? '没有账户？点击注册' : '已有账户？点击登录'}
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
          <div className="mb-2">技术演示账户:</div>
          <div className="space-y-1">
            <div>邮箱: demo@example.com</div>
            <div>密码: 123456</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
