/**
 * 身份验证Hook
 * 使用JWT令牌管理用户认证状态
 * 集成SWR实现数据缓存和自动刷新
 */

import { useState, useEffect } from 'react';
import useSWR from 'swr';
import toast from 'react-hot-toast';
import type { User, AuthResponse, ApiResponse } from '../shared/types';

const API_BASE = process.env.RSBUILD_APP_API_URL;

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const fetcher = async (url: string): Promise<User> => {
  const token = localStorage.getItem('auth_token');
  console.log('🔐 尝试认证，Token存在:', !!token);
  
  const response = await fetch(`${API_BASE}${url}`, {
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
    },
  });

  console.log('🔐 认证响应状态:', response.status);

  if (!response.ok) {
    // 如果是401错误，清除无效token
    if (response.status === 401) {
      console.log('🔐 Token无效，清除本地存储');
      localStorage.removeItem('auth_token');
    }
    throw new Error('认证失败');
  }

  const result: ApiResponse<User> = await response.json();
  if (!result.success) {
    throw new Error(result.message || '认证失败');
  }

  return result.data!;
};

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>(() => {
    // 🔧 改进：在初始化时就检查token
    const token = localStorage.getItem('auth_token');
    return {
      user: null,
      token,
      isLoading: !!token, // 如果有token就设为loading状态
      isAuthenticated: false,
    };
  });

  const { data: user, error, mutate, isLoading: swrLoading } = useSWR(
    authState.token ? '/auth/me' : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      // 🔧 增加错误重试配置
      shouldRetryOnError: false,
    }
  );

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    
    console.log('🔐 Auth状态更新:', {
      hasToken: !!token,
      hasUser: !!user,
      hasError: !!error,
      swrLoading
    });

    // 🔧 改进状态逻辑
    if (!token) {
      // 没有token，明确未认证
      setAuthState({
        user: null,
        token: null,
        isLoading: false,
        isAuthenticated: false,
      });
    } else if (error) {
      // 有token但验证失败，清除token
      console.log('🔐 Token验证失败，清除认证状态');
      localStorage.removeItem('auth_token');
      setAuthState({
        user: null,
        token: null,
        isLoading: false,
        isAuthenticated: false,
      });
    } else if (user) {
      // 验证成功，设置认证状态
      console.log('✅ 用户认证成功:', user.username);
      setAuthState({
        user,
        token,
        isLoading: false,
        isAuthenticated: true,
      });
    } else if (swrLoading) {
      // 正在验证中
      setAuthState(prev => ({
        ...prev,
        token,
        isLoading: true,
        isAuthenticated: false,
      }));
    } else {
      // 有token但还没有用户数据且不在加载中（可能是网络问题）
      // 暂时认为已登录，避免跳转到登录页
      console.log('⚠️ 有token但用户数据未加载，保持登录状态');
      setAuthState(prev => ({
        ...prev,
        token,
        isLoading: false,
        isAuthenticated: true, // 🔧 关键修复：暂时保持认证状态
      }));
    }
  }, [user, error, swrLoading]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('🔐 尝试登录:', email);
      console.log('🌐 API地址:', API_BASE);
      
      const loginUrl = `${API_BASE}/auth/login`;
      console.log('📡 登录请求URL:', loginUrl);

      const response = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      console.log('📊 登录响应状态:', response.status, response.statusText);

      // 处理服务端错误
      if (response.status >= 500) {
        const errorText = await response.text();
        console.error('💥 服务端登录错误:', errorText);
        

        
        toast.error('服务器登录失败，请检查服务端状态');
        return false;
      }

      const result: ApiResponse<AuthResponse> = await response.json();
      console.log('📋 登录响应结果:', { success: result.success, message: result.message });

      if (!result.success) {
        console.log('❌ 登录失败:', result.message);
        
        // 如果是演示账户且提示用户不存在，给出特别提示
        if (email === 'demo@example.com' && result.message?.includes('邮箱或密码错误')) {
          toast.error('演示账户不存在，请先点击右下角的"初始化数据"按钮创建演示账户', {
            duration: 6000,
          });
        } else {
          toast.error(result.message || '登录失败');
        }
        return false;
      }

      const { token, user } = result.data!;
      console.log('✅ 登录成功:', user.username);
      
      localStorage.setItem('auth_token', token);
      setAuthState({
        user,
        token,
        isLoading: false,
        isAuthenticated: true,
      });

      // 🔧 强制刷新SWR缓存
      await mutate(user, false);
      toast.success('登录成功');
      return true;

    } catch (error) {
      console.error('💥 登录网络错误:', error);
      toast.error('登录失败，请稍后重试');
      return false;
    }
  };

  const register = async (username: string, email: string, password: string): Promise<boolean> => {
    try {
      console.log('👤 尝试注册:', email);
      
      const registerUrl = `${API_BASE}/auth/register`;
      console.log('📡 注册请求URL:', registerUrl);

      const response = await fetch(registerUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });

      console.log('📊 注册响应状态:', response.status);

      // 处理服务端错误
      if (response.status >= 500) {
        const errorText = await response.text();
        console.error('💥 服务端注册错误:', errorText);
        

        
        toast.error('服务器注册失败，请检查服务端状态');
        return false;
      }

      const result: ApiResponse<AuthResponse> = await response.json();
      console.log('📋 注册响应结果:', { success: result.success, message: result.message });

      if (!result.success) {
        console.log('❌ 注册失败:', result.message);
        toast.error(result.message || '注册失败');
        return false;
      }

      const { token, user } = result.data!;
      console.log('✅ 注册成功:', user.username);
      
      localStorage.setItem('auth_token', token);
      setAuthState({
        user,
        token,
        isLoading: false,
        isAuthenticated: true,
      });

      // 🔧 强制刷新SWR缓存
      await mutate(user, false);
      toast.success('注册成功');
      return true;

    } catch (error) {
      console.error('💥 注册网络错误:', error);
      toast.error('注册失败，请稍后重试');
      return false;
    }
  };

  const logout = () => {
    console.log('👋 用户退出登录');
    localStorage.removeItem('auth_token');
    setAuthState({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,
    });
    mutate(null, false);
    toast.success('已退出登录');
  };

  // 🔧 新增：手动验证函数
  const verifyAuth = async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      return false;
    }
    
    try {
      await mutate();
      return true;
    } catch (error) {
      console.error('🔐 身份验证失败:', error);
      return false;
    }
  };

  return {
    ...authState,
    login,
    register,
    logout,
    refresh: mutate,
    verifyAuth,
  };
}