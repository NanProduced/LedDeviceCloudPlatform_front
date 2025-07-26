'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { LanguageConfig } from '@/lib/types';

// 通用翻译文本
export const commonTranslations: LanguageConfig = {
  zh: {
    profile: '个人资料',
    settings: '设置',
    logout: '退出登录',
    userInfo: '用户信息',
    username: '用户名',
    email: '邮箱',
    phone: '电话',
    organization: '所属组织',
    userGroup: '用户组',
    roles: '角色',
    accountStatus: '账号状态',
    active: '正常',
    inactive: '已禁用',
    createdAt: '创建时间',
    updatedAt: '更新时间',
    changePassword: '修改密码',
    oldPassword: '旧密码',
    newPassword: '新密码',
    confirmPassword: '确认密码',
    submit: '提交',
    cancel: '取消',
    passwordNotMatch: '两次输入的密码不一致',
    passwordSuccess: '密码修改成功',
    passwordError: '密码修改失败',
    required: '必填项'
  },
  en: {
    profile: 'Profile',
    settings: 'Settings',
    logout: 'Logout',
    userInfo: 'User Information',
    username: 'Username',
    email: 'Email',
    phone: 'Phone',
    organization: 'Organization',
    userGroup: 'User Group',
    roles: 'Roles',
    accountStatus: 'Account Status',
    active: 'Active',
    inactive: 'Inactive',
    createdAt: 'Created At',
    updatedAt: 'Updated At',
    changePassword: 'Change Password',
    oldPassword: 'Old Password',
    newPassword: 'New Password',
    confirmPassword: 'Confirm Password',
    submit: 'Submit',
    cancel: 'Cancel',
    passwordNotMatch: 'Passwords do not match',
    passwordSuccess: 'Password changed successfully',
    passwordError: 'Failed to change password',
    required: 'Required'
  }
};

// 语言上下文类型
interface LanguageContextType {
  language: 'zh' | 'en';
  setLanguage: (language: 'zh' | 'en') => void;
  t: (key: string) => string;
}

// 创建上下文
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// 语言上下文提供者组件
interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  // 从localStorage或默认值初始化语言
  const [language, setLanguageState] = useState<'zh' | 'en'>('zh');

  // 设置语言并保存到localStorage
  const setLanguage = (lang: 'zh' | 'en') => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', lang);
    }
  };

  // 从localStorage加载语言设置
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem('language') as 'zh' | 'en' | null;
      if (savedLanguage && (savedLanguage === 'zh' || savedLanguage === 'en')) {
        setLanguageState(savedLanguage);
      }
    }
  }, []);

  // 翻译函数
  const t = (key: string): string => {
    return commonTranslations[language][key] || key;
  };

  // 向子组件提供上下文
  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

// 自定义hook，简化上下文使用
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage必须在LanguageProvider内部使用');
  }
  return context;
} 