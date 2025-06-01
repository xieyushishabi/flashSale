/**
 * 受保护路由组件
 * 负责路由级别的身份验证检查
 * 为需要登录的页面提供访问控制
 */

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();

  // 简化逻辑，只在确定未认证时跳转
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <div className="text-xl font-medium text-gray-700">加载中...</div>
        </div>
      </div>
    );
  }

  // 只有明确未认证且没有token时才跳转
  const token = localStorage.getItem('auth_token');
  if (!isAuthenticated && !token) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
}
