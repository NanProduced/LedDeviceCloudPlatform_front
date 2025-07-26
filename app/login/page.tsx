"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { login } from "@/config/auth";
import { SiteConfig, getDefaultSite, SITES } from "@/config/sites";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Cloud, Globe, Server, Wifi } from "lucide-react";

// 文本国际化配置
const translations = {
  zh: {
    welcome: "欢迎回到",
    platform: "云平台",
    loginDesc: "登录您的账户以访问完整的设备管理功能和数据分析",
    loginBtn: "登录",
    loginLoading: "登录中...",
    comingSoon: "该站点即将上线",
    needHelp: "需要帮助？",
    contactAdmin: "联系管理员获取账号信息",
    globalService: "全球服务，一键接入",
    serviceDesc: "云平台为您提供覆盖全球的设备管理、内容发布和数据统计分析的一站式解决方案",
    globalNodes: "全球节点状态",
    online: "在线"
  },
  en: {
    welcome: "Welcome back to",
    platform: "Cloud Platform",
    loginDesc: "Login to your account to access complete device management and data analysis",
    loginBtn: "Login",
    loginLoading: "Loading...",
    comingSoon: "Coming Soon",
    needHelp: "Need help?",
    contactAdmin: "Contact admin for account information",
    globalService: "Global Service, One-click Access",
    serviceDesc: "The cloud platform provides one-stop solutions for global device management, content delivery, and data analytics",
    globalNodes: "Global Node Status",
    online: "Online"
  }
};

const Login = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSite, setSelectedSite] = useState<SiteConfig>(getDefaultSite());
  const [selectedRegion, setSelectedRegion] = useState("CN");
  const [language, setLanguage] = useState<"zh" | "en">("zh"); // 添加语言状态
  const t = translations[language]; // 获取当前语言的文本

  useEffect(() => {
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

  // 删除未使用的函数 handleSiteChange

  const handleLogin = () => {
    setIsLoading(true);
    // 使用配置中的登录函数
    login("/dashboard");
  };

  // 格式化站点数据为区域显示数据
  const regions = SITES.map(site => ({
    code: site.region,
    name: language === "zh" ? site.name : site.id.toUpperCase(),
    status: site.gatewayUrl !== '#' ? "online" : "offline",
    ping: site.gatewayUrl !== '#' ? `${Math.floor(Math.random() * 100) + 20}ms` : "-"
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left Section */}
        <div className="space-y-8 text-white">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <Server className="w-6 h-6 text-white" />
              </div>
              <Link href="/" className="text-2xl font-bold">LED{language === "zh" ? "云平台" : " Cloud"}</Link>
            </div>

            <div className="space-y-2">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                {t.welcome}
              </h2>
              <h2 className="text-4xl font-bold text-blue-400">{t.platform}</h2>
            </div>

            <p className="text-slate-300 text-lg leading-relaxed max-w-md">
              {t.loginDesc}
            </p>
          </div>

          <div className="space-y-4">
            <Button
              size="lg"
              className={`w-full max-w-sm bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-blue-500/25 ${isLoading || selectedSite.gatewayUrl === '#' ? 'opacity-70 cursor-not-allowed' : ''}`}
              onClick={handleLogin}
              disabled={isLoading || selectedSite.gatewayUrl === '#'}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t.loginLoading}
                </>
              ) : selectedSite.gatewayUrl === '#' ? t.comingSoon : `${t.loginBtn} ${language === "zh" ? selectedSite.name : selectedSite.id.toUpperCase()}`}
            </Button>

            <p className="text-sm text-slate-400">
              {t.needHelp}
              <Link href="/register" className="text-blue-400 hover:text-blue-300 ml-1 underline underline-offset-2">
                {t.contactAdmin}
              </Link>
            </p>
          </div>
        </div>

        {/* Right Section */}
        <div className="space-y-6">
          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
            <CardContent className="p-6 space-y-6">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto">
                  <Cloud className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white">{t.globalService}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {t.serviceDesc}
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-white font-medium flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    {t.globalNodes}
                  </h4>
                  <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
                    <Wifi className="w-3 h-3 mr-1" />
                    {SITES.filter(site => site.gatewayUrl !== '#').length}/{SITES.length} {t.online}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {regions.map((region) => (
                    <button
                      key={region.code}
                      onClick={() => {
                        setSelectedRegion(region.code);
                        const site = SITES.find(s => s.region === region.code);
                        if (site) setSelectedSite(site);
                      }}
                      className={`p-3 rounded-lg border transition-all duration-200 text-left ${
                        selectedRegion === region.code
                          ? "bg-blue-500/20 border-blue-500/50 text-blue-400"
                          : "bg-slate-700/30 border-slate-600/50 text-slate-300 hover:bg-slate-700/50"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm">{region.code}</span>
                        <div
                          className={`w-2 h-2 rounded-full ${
                            region.status === "online" ? "bg-green-400" : "bg-red-400"
                          }`}
                        ></div>
                      </div>
                      <div className="text-xs text-slate-400">{region.name}</div>
                      <div className="text-xs text-slate-500 mt-1">{region.ping}</div>
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Language Selector */}
          <div className="flex justify-center">
            <div className="flex items-center space-x-2 bg-slate-800/30 rounded-lg p-1">
              <button 
                className={`px-3 py-1 text-sm ${language === "zh" ? "text-blue-400 bg-blue-500/20" : "text-slate-400 hover:text-white"} rounded-md transition-colors`}
                onClick={() => setLanguage("zh")}
              >
                CN 简体
              </button>
              <button 
                className={`px-3 py-1 text-sm ${language === "en" ? "text-blue-400 bg-blue-500/20" : "text-slate-400 hover:text-white"} rounded-md transition-colors`}
                onClick={() => setLanguage("en")}
              >
                EN
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;