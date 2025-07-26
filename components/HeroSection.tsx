'use client';

import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const HeroSection: React.FC = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* 动态网格背景 */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }} />
      </div>

      {/* 浮动粒子效果 */}
      {mounted && (
        <div className="absolute inset-0">
          {[...Array(15)].map((_, i) => (
            <div 
              key={i}
              className="absolute rounded-full bg-blue-400/20 animate-pulse"
              style={{
                width: Math.random() * 4 + 2 + 'px',
                height: Math.random() * 4 + 2 + 'px',
                top: Math.random() * 100 + '%',
                left: Math.random() * 100 + '%',
                animationDelay: Math.random() * 3 + 's',
                animationDuration: Math.random() * 4 + 2 + 's',
              }}
            />
          ))}
        </div>
      )}
      
      {/* 主要内容 */}
      <div className="container mx-auto px-6 lg:px-8 z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* 左侧内容 */}
            <div className="space-y-8">
              {/* 标签 - 使用shadcn Badge组件替换Emoji */}
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="bg-blue-500/10 text-blue-300 border-blue-500/30 px-3 py-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                  LED设备云管理平台
                </Badge>
                <div className="h-px flex-1 bg-gradient-to-r from-blue-500/50 to-transparent" />
              </div>

              {/* 主标题 */}
              <div className="space-y-4">
                <h1 className="text-5xl lg:text-7xl font-bold tracking-tight">
                  <span className="block text-white">智能管控</span>
                  <span className="block bg-gradient-to-r from-blue-400 via-blue-500 to-cyan-400 bg-clip-text text-transparent">
                    LED显示设备
                  </span>
                </h1>
                <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full" />
              </div>

              {/* 描述文字 */}
              <p className="text-xl lg:text-2xl text-slate-300 leading-relaxed max-w-2xl">
                专业的LED显示设备云管理平台，提供
                <span className="text-blue-400 font-semibold"> 实时监控</span>、
                <span className="text-blue-400 font-semibold"> 远程控制</span>、
                <span className="text-blue-400 font-semibold"> 内容管理</span> 
                一站式解决方案
              </p>

              {/* 特性列表 - 使用shadcn Card和Avatar组件替换Emoji */}
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { icon: 'chart-bar', title: '实时监控', desc: '设备状态一目了然' },
                  { icon: 'sliders', title: '远程控制', desc: '随时随地管理设备' },
                  { icon: 'cloud', title: '云端管理', desc: '数据安全可靠' },
                  { icon: 'smartphone', title: '多端支持', desc: '手机电脑都能用' }
                ].map((feature, index) => (
                  <Card key={index} className="flex items-center gap-3 p-3 bg-slate-800/30 border border-slate-700/50">
                    <Avatar className="w-10 h-10 rounded-lg bg-blue-500/20 text-blue-400">
                      <AvatarFallback className="bg-transparent">
                        {feature.icon === 'chart-bar' && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="18" y="3" width="4" height="18"></rect>
                            <rect x="10" y="8" width="4" height="13"></rect>
                            <rect x="2" y="13" width="4" height="8"></rect>
                          </svg>
                        )}
                        {feature.icon === 'sliders' && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="4" y1="21" x2="4" y2="14"></line>
                            <line x1="4" y1="10" x2="4" y2="3"></line>
                            <line x1="12" y1="21" x2="12" y2="12"></line>
                            <line x1="12" y1="8" x2="12" y2="3"></line>
                            <line x1="20" y1="21" x2="20" y2="16"></line>
                            <line x1="20" y1="12" x2="20" y2="3"></line>
                            <line x1="1" y1="14" x2="7" y2="14"></line>
                            <line x1="9" y1="8" x2="15" y2="8"></line>
                            <line x1="17" y1="16" x2="23" y2="16"></line>
                          </svg>
                        )}
                        {feature.icon === 'cloud' && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path>
                          </svg>
                        )}
                        {feature.icon === 'smartphone' && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
                            <line x1="12" y1="18" x2="12.01" y2="18"></line>
                          </svg>
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-white">{feature.title}</h3>
                      <p className="text-sm text-slate-400">{feature.desc}</p>
                    </div>
                  </Card>
                ))}
              </div>

              {/* 操作按钮 */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild className="px-8 py-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 rounded-xl text-white font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-blue-500/25">
                  <Link href="/login" className="flex items-center gap-2">
                    立即登录
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                </Button>
                
                <Button variant="outline" className="px-8 py-6 border border-slate-600 hover:border-blue-500 rounded-xl text-slate-300 hover:text-white font-semibold transition-all duration-300 hover:bg-slate-800/50">
                  了解更多
                </Button>
              </div>

              {/* 统计数据 */}
              <div className="flex items-center gap-8 pt-8 border-t border-slate-700/50">
                {[
                  { number: '10K+', label: '设备接入' },
                  { number: '99.9%', label: '稳定运行' },
                  { number: '24/7', label: '技术支持' }
                ].map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-2xl font-bold text-blue-400">{stat.number}</div>
                    <div className="text-sm text-slate-400">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* 右侧视觉效果 */}
            <div className="relative flex justify-center lg:justify-end">
              <div className="relative w-96 h-96 lg:w-[500px] lg:h-[500px]">
                {/* 主要图形 - LED屏幕效果 */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative">
                    {/* 外圈光环 */}
                    <div className="absolute -inset-8 rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 animate-spin" style={{ animationDuration: '20s' }} />
                    <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-cyan-500/30 to-blue-500/30 animate-spin" style={{ animationDuration: '15s', animationDirection: 'reverse' }} />
                    
                    {/* LED屏幕模拟 */}
                    <div className="relative w-64 h-64 lg:w-80 lg:h-80 bg-slate-900 rounded-2xl border border-slate-700 overflow-hidden shadow-2xl">
                      {/* 屏幕边框 */}
                      <div className="absolute inset-2 bg-black rounded-xl overflow-hidden">
                        {/* LED点阵效果 */}
                        <div className="absolute inset-0 grid grid-cols-16 gap-px p-2">
                          {mounted && [...Array(256)].map((_, i) => (
                            <div 
                              key={i}
                              className="rounded-full transition-all duration-1000"
                              style={{
                                backgroundColor: Math.random() > 0.7 ? '#3b82f6' : Math.random() > 0.9 ? '#06b6d4' : '#1e293b',
                                animationDelay: Math.random() * 2 + 's'
                              }}
                            />
                          ))}
                        </div>
                        
                        {/* 屏幕内容 */}
                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-900/50 to-transparent">
                          <div className="text-center space-y-2">
                            <div className="text-blue-400 text-lg font-bold">LED DISPLAY</div>
                            <div className="text-cyan-300 text-sm">ONLINE</div>
                            <div className="flex justify-center gap-1">
                              {[...Array(3)].map((_, i) => (
                                <div key={i} className="w-2 h-2 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: i * 0.2 + 's' }} />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* 控制按钮 */}
                      <div className="absolute bottom-4 left-4 right-4 flex justify-between">
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                        <div className="w-3 h-3 bg-green-500 rounded-full" />
                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* 浮动元素 */}
                {mounted && (
                  <>
                    <div className="absolute top-10 -left-10 p-4 bg-slate-800/80 backdrop-blur-sm rounded-xl border border-slate-600 animate-float">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                        <span className="text-sm text-slate-300">设备在线</span>
                      </div>
                    </div>
                    
                    <div className="absolute bottom-10 -right-10 p-4 bg-slate-800/80 backdrop-blur-sm rounded-xl border border-slate-600 animate-float" style={{ animationDelay: '1s' }}>
                      <div className="text-center">
                        <div className="text-blue-400 font-bold">1,234</div>
                        <div className="text-xs text-slate-400">活跃设备</div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 底部滚动指示器 - 优化为更明显的按钮 */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs text-slate-400">探索更多</span>
          <Button 
            variant="ghost" 
            className="rounded-full p-2 bg-blue-500/10 hover:bg-blue-500/20 animate-bounce"
            style={{ animationDuration: '2s' }}
            onClick={() => {
              window.scrollTo({
                top: window.innerHeight,
                behavior: 'smooth'
              });
            }}
          >
            <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection; 