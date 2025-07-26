"use client";

import React from 'react';

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 登录页不需要主题切换功能，直接渲染子组件
  return <>{children}</>;
} 