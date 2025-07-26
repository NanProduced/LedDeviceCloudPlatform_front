"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { login } from "@/config/auth";
import SiteSelector from "@/components/SiteSelector";
import { SiteConfig, getDefaultSite, SITES } from "@/config/sites";

// 创建一个客户端专用的装饰组件
const BackgroundDecoration = () => {
  const [particles, setParticles] = useState([]);
  
  useEffect(() => {
    // 只在客户端生成随机粒子
    const newParticles = Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      width: Math.random() * 3 + 1,
      height: Math.random() * 3 + 1,
      top: Math.random() * 100,
      left: Math.random() * 100,
      opacity: Math.random() * 0.5 + 0.3,
      animationDuration: Math.random() * 5 + 3
    }));
    setParticles(newParticles);
  }, []);
  
  return (
    <div className="absolute inset-0">
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute rounded-full bg-blue-500/20"
          style={{
            width: `${particle.width}px`,
            height: `${particle.height}px`,
            top: `${particle.top}%`,
            left: `${particle.left}%`,
            opacity: particle.opacity,
            animationDuration: `${particle.animationDuration}s`,
          }}
        />
      ))}
    </div>
  );
};

const Login = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSite, setSelectedSite] = useState<SiteConfig>(getDefaultSite());
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // 标记为客户端渲染
    setIsClient(true);

    // 检查是否有认证相关的Cookie
    const checkCookies = () => {
      if (document.cookie) {
        // 检查是否有认证相关的cookie
        const hasCookies = document.cookie.split(';').some(c => {
          const name = c.trim().split('=')[0].toLowerCase();
          return name.includes('auth') || 
                 name.includes('token') || 
                 name.includes('session') ||
                 name === 'jsessionid';
        });

        if (hasCookies) {
          // 已认证，尝试重定向到仪表盘
          console.log('检测到认证Cookie，尝试重定向到仪表盘');
          setTimeout(() => {
            router.push('/dashboard');
          }, 1000);
        }
      }
    };

    checkCookies();
  }, [router]);

  // 处理站点变化
  const handleSiteChange = (site: SiteConfig) => {
    setSelectedSite(site);
  };

  const handleLogin = () => {
    setIsLoading(true);
    // 使用配置中的登录函数
    login("/dashboard");
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* 左侧信息面板 */}
      <div className="w-full md:w-1/2 bg-gradient-to-br from-[#050b1f] to-[#0f172a] p-8 md:p-16 flex flex-col justify-center">
        <div className="flex items-center justify-between mb-16">
          <Link href="/" className="text-2xl font-bold text-white">
            LED云平台
          </Link>
          <SiteSelector onChange={handleSiteChange} />
        </div>

        <h1 className="text-4xl font-bold mb-6 text-white">
          欢迎回到 <span className="text-blue-400">云平台</span>
        </h1>
        <p className="text-gray-300 mb-8">
          登录您的账户以访问完整的设备管理功能和数据分析
        </p>
        
        <div className="mb-8">
          <button
            onClick={handleLogin}
            disabled={isLoading || selectedSite.gatewayUrl === '#'}
            className={`
              w-full py-3 rounded-md font-medium transition-all duration-300 flex justify-center items-center
              ${selectedSite.gatewayUrl === '#' 
                ? 'bg-gray-600 cursor-not-allowed text-gray-300' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'}
            `}
          >
            {isLoading ? (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : selectedSite.gatewayUrl === '#' ? "该站点即将上线" : `登录${selectedSite.name}站点`}
          </button>
        </div>

        <div className="flex justify-between items-center">
          <p className="text-gray-400 text-sm">
            首次使用? <Link href="/register" className="text-blue-400 hover:underline">联系管理员创建账号</Link>
          </p>
        </div>

        {/* 当前选择的站点信息 */}
        {selectedSite.id !== 'cn-shenzhen' && selectedSite.gatewayUrl !== '#' && (
          <div className="mt-8 p-3 bg-blue-900/20 rounded-md border border-blue-800">
            <div className="flex items-center text-sm text-blue-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              您当前选择的是{selectedSite.name}站点
            </div>
          </div>
        )}
      </div>

      {/* 右侧装饰图形 */}
      <div className="hidden md:flex w-1/2 bg-[#050b1f] items-center justify-center relative overflow-hidden">
        {isClient && <BackgroundDecoration />}
        
        <div className="relative z-10 p-12 flex flex-col items-center">
          <div className="w-56 h-56 relative mb-8 animate-float">
            <div className="absolute w-full h-full rounded-full bg-blue-500/5"></div>
            <div className="absolute w-full h-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-32 w-32 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
              </svg>
            </div>
          </div>
          
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-3">全球服务，一键操控</h2>
            <p className="text-gray-400 max-w-md mb-6">
              云平台为您提供覆盖全球的设备管理、内容发布和数据分析的一站式解决方案
            </p>
            
            {/* 简洁的节点状态展示 */}
            <div className="mt-4 p-4 bg-blue-900/10 rounded-lg border border-blue-900/30">
              <h3 className="text-sm font-medium text-gray-400 mb-3">全球节点状态</h3>
              <div className="grid grid-cols-4 gap-2">
                {SITES.map((site) => (
                  <div 
                    key={site.id} 
                    className="flex flex-col items-center p-2 rounded-md"
                    title={site.name}
                  >
                    <div className="flex items-center justify-center">
                      <span className="text-xs font-medium text-gray-300 mr-1.5">{site.region}</span>
                      <span 
                        className={`w-2 h-2 rounded-full ${site.gatewayUrl !== '#' ? 'bg-green-500' : 'bg-gray-600'}`} 
                        title={site.gatewayUrl !== '#' ? '可用' : '即将上线'}
                      ></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 