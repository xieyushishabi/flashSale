/**
 * 导航栏组件
 * 负责应用的顶部导航和用户状态显示
 * 集成路由导航和身份验证状态
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Home, BarChart3, ShoppingBag, User, LogOut, LogIn, Zap } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export function Navigation() {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <nav className="bg-white shadow-lg border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2 text-xl font-bold text-gray-800">
            <Zap className="w-6 h-6 text-blue-500" />
            <span>秒杀商城</span>
          </Link>

          <div className="flex items-center space-x-6">
            <Link
              to="/"
              className="flex items-center space-x-1 px-3 py-2 rounded-lg text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            >
              <Home className="w-4 h-4" />
              <span>首页</span>
            </Link>

            <Link
              to="/stats"
              className="flex items-center space-x-1 px-3 py-2 rounded-lg text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            >
              <BarChart3 className="w-4 h-4" />
              <span>数据统计</span>
            </Link>

            {isAuthenticated && (
              <Link
                to="/orders"
                className="flex items-center space-x-1 px-3 py-2 rounded-lg text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>我的订单</span>
              </Link>
            )}

            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-gray-700">
                  <User className="w-4 h-4" />
                  <span>{user?.username}</span>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center space-x-1 px-3 py-2 rounded-lg text-gray-700 hover:text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>退出</span>
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center space-x-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <LogIn className="w-4 h-4" />
                <span>登录</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
