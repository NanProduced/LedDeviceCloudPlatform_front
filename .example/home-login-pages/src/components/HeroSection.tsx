'use client';

import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';

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
              {/* 标签 */}
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="bg-blue-500/10 text-blue-300 border-blue-500/30 px-3 py-1">
                  🚀 LED设备云管理平台
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

              {/* 特性列表 */}
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { icon: '📊', title: '实时监控', desc: '设备状态一目了然' },
                  { icon: '🎛️', title: '远程控制', desc: '随时随地管理设备' },
                  { icon: '☁️', title: '云端管理', desc: '数据安全可靠' },
                  { icon: '📱', title: '多端支持', desc: '手机电脑都能用' }
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/30 border border-slate-700/50">
                    <span className="text-2xl">{feature.icon}</span>
                    <div>
                      <h3 className="font-semibold text-white">{feature.title}</h3>
                      <p className="text-sm text-slate-400">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* 操作按钮 */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  href="/login" 
                  className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 rounded-xl text-white font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-blue-500/25"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    立即登录
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400 to-cyan-400 opacity-0 group-hover:opacity-20 transition-opacity" />
                </Link>
                
                <button className="px-8 py-4 border border-slate-600 hover:border-blue-500 rounded-xl text-slate-300 hover:text-white font-semibold transition-all duration-300 hover:bg-slate-800/50">
                  了解更多
                </button>
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

      {/* 底部滚动指示器 */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs text-slate-400">探索更多</span>
          <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>
    </section>
  );
};

export default HeroSection; 