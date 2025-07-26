'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserInfo } from '@/lib/types';
import { userApi } from '@/lib/api';

// 用户上下文类型
interface UserContextType {
  user: UserInfo | null;
  loading: boolean;
  error: string | null;
  fetchUserInfo: () => Promise<void>;
  clearUserInfo: () => void;
  updateUserInfo: (updatedUser: Partial<UserInfo>) => void;
}

// 创建上下文
const UserContext = createContext<UserContextType | undefined>(undefined);

// 用户上下文提供者组件
interface UserProviderProps {
  children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 获取用户信息
  const fetchUserInfo = async () => {
    console.log('开始获取用户信息...');
    try {
      setLoading(true);
      setError(null);
      const userData = await userApi.getCurrentUser();
      console.log('用户API返回的原始数据:', userData);
      console.log('用户数据类型:', typeof userData);
      console.log('用户数据键:', userData ? Object.keys(userData) : 'null');
      
      // 验证用户数据结构
      if (userData && typeof userData === 'object' && 'uid' in userData) {
        console.log('用户信息验证成功，设置用户状态');
        setUser(userData);
      } else {
        console.error('用户数据格式不正确:', userData);
        setError('用户数据格式错误');
      }
    } catch (err) {
      console.error('获取用户信息失败:', err);
      // 检查是否是认证失败（401或403），如果是则需要重新登录
      if (err instanceof Error && err.message.includes('401')) {
        setError('认证失败，请重新登录');
      } else if (err instanceof Error && err.message.includes('403')) {
        setError('权限不足');
      } else {
        setError('获取用户信息失败');
      }
      // 不要在这里清除用户信息，因为可能是临时网络错误
    } finally {
      setLoading(false);
    }
  };

  // 清除用户信息（用于登出）
  const clearUserInfo = () => {
    setUser(null);
  };

  // 更新用户信息
  const updateUserInfo = (updatedUser: Partial<UserInfo>) => {
    if (user) {
      setUser({ ...user, ...updatedUser });
    }
  };

  // 组件挂载后获取用户信息
  useEffect(() => {
    fetchUserInfo();
  }, []);

  // 向子组件提供上下文
  return (
    <UserContext.Provider value={{ 
      user, 
      loading, 
      error, 
      fetchUserInfo, 
      clearUserInfo,
      updateUserInfo
    }}>
      {children}
    </UserContext.Provider>
  );
}

// 自定义hook，简化上下文使用
export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser必须在UserProvider内部使用');
  }
  return context;
} 