'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import {
  Monitor,
  Tv,
  Shield,
  Zap,
  Cloud,
  BarChart3,
  Settings,
  ArrowRight,
  Play,
  Cpu,
  Database,
  Lock,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Home() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    setMounted(true);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const features = [
    { icon: Monitor, title: "实时监控", desc: "设备实时状态监控" },
    { icon: BarChart3, title: "远程控制", desc: "移动端远程管理" },
    { icon: Cloud, title: "云端管理", desc: "云端数据存储" },
    { icon: Zap, title: "多端支持", desc: "支持多种终端设备" },
  ];

  const products = [
    { icon: Tv, name: "内容管理", desc: "高效的内容管理系统" },
    { icon: Settings, name: "设备控制", desc: "智能设备控制中心" },
    { icon: Database, name: "云存储", desc: "安全可靠的云端存储" },
    { icon: BarChart3, name: "数据分析", desc: "全方位数据分析平台" },
    { icon: Lock, name: "安全管理", desc: "企业级安全管理方案" },
  ];

  const solutions = [
    { title: "智能化管理", desc: "基于AI的智能管理系统，提供自动化运维解决方案" },
    { title: "数据驱动决策", desc: "通过大数据分析，为业务决策提供科学依据" },
    { title: "设备全生命周期管理", desc: "从设备部署到维护的全流程管理方案" },
    { title: "内容智能分发", desc: "智能内容分发网络，确保内容高效传输" },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white overflow-hidden">
      {/* 动态背景 */}
      <div className="fixed inset-0 opacity-30">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]" />
        <div
          className="absolute w-96 h-96 bg-blue-500/10 rounded-full blur-3xl transition-all duration-1000 ease-out"
          style={{
            left: mousePosition.x - 192,
            top: mousePosition.y - 192,
          }}
        />
      </div>

      <Navbar />

      {/* Hero Section */}
      <section className="relative z-10 min-h-screen flex items-center justify-center overflow-hidden">
        <div className="container mx-auto px-6 lg:px-8 z-10">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* 左侧内容 */}
              <div className="space-y-8">
                {/* 标签 */}
                <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 px-3 py-1">
                  <Zap className="h-4 w-4 mr-1" />
                  LED云端智能管理平台
                </Badge>

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
                <div className="grid grid-cols-2 gap-4">
              {features.slice(0, 4).map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 p-3 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center">
                    <feature.icon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">{feature.title}</div>
                    <div className="text-xs text-gray-400">{feature.desc}</div>
                  </div>
                </div>
              ))}
            </div>

                {/* 操作按钮 */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 rounded-xl text-white font-semibold"
                    asChild
                  >
                    <Link href="/login">
                      立即体验
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-white/20 text-white hover:bg-white/10 rounded-xl bg-transparent"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    观看演示
                  </Button>
                </div>

                {/* 统计数据 */}
                <div className="flex items-center gap-8 pt-8 border-t border-slate-700/50">
                  {[
                    { number: '10K+', label: '设备接入' },
                    { number: '99.9%', label: '系统稳定性' },
                    { number: '24/7', label: '技术支持' }
                  ].map((stat, index) => (
                    <div key={index} className="text-center">
                      <div className="text-2xl font-bold text-blue-400">{stat.number}</div>
                      <div className="text-sm text-slate-400">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* 右侧视觉效果 - 保留原有LED屏幕可视化 */}
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

      {/* Products Section */}
      <section className="relative z-10 py-20 bg-gradient-to-r from-slate-900/50 to-blue-900/20 backdrop-blur-sm">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <Badge variant="outline" className="bg-blue-500/10 text-blue-300 border-blue-500/30 px-3 py-1 mb-4">
              核心功能
            </Badge>
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              全方位LED屏幕管理解决方案
            </h2>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              我们提供全方位的LED显示设备管理产品，满足不同场景的需求
            </p>
          </div>

          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6">
            {products.map((product, index) => (
              <Card
                key={index}
                className="group bg-white/5 border-white/10 hover:bg-white/10 hover:border-blue-500/30 transition-all duration-300 backdrop-blur-sm"
              >
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <product.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold mb-2 text-white">{product.name}</h3>
                  <p className="text-sm text-gray-400">{product.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Solutions Section */}
      <section className="relative z-10 py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <Badge variant="outline" className="bg-blue-500/10 text-blue-300 border-blue-500/30 px-3 py-1 mb-4">
              解决方案
            </Badge>
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              量身定制的行业应用方案
            </h2>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">数字化转型时代的智能显示设备管理解决方案</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {solutions.map((solution, index) => (
              <Card
                key={index}
                className="group bg-gradient-to-br from-blue-900/20 to-slate-900/20 border-blue-500/20 hover:border-blue-400/40 transition-all duration-300 backdrop-blur-sm"
              >
                <CardContent className="p-8">
                  <div className="flex items-start space-x-4">
                    <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full mt-2 flex-shrink-0" />
                    <div>
                      <h3 className="text-xl font-semibold mb-3 text-white group-hover:text-blue-300 transition-colors">
                        {solution.title}
                      </h3>
                      <p className="text-gray-300 leading-relaxed">{solution.desc}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Separator className="my-8 bg-blue-500/20" />
      
      {/* 适用场景部分 */}
      <section className="relative z-10 py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <Badge variant="outline" className="bg-blue-500/10 text-blue-300 border-blue-500/30 px-3 py-1 mb-4">
              适用场景
            </Badge>
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              满足多样化应用需求
            </h2>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              我们的平台适用于各种行业和场景，为您提供专业的LED屏幕管理解决方案
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="group bg-gradient-to-br from-blue-900/20 to-slate-900/20 border-blue-500/20 hover:border-blue-400/40 transition-all duration-300 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Monitor className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-semibold mb-2 text-white">零售连锁</h4>
                <p className="text-sm text-gray-400">&ldquo;让每家门店展示同步更新&rdquo;</p>
              </CardContent>
            </Card>

            <Card className="group bg-gradient-to-br from-blue-900/20 to-slate-900/20 border-blue-500/20 hover:border-blue-400/40 transition-all duration-300 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Cpu className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-semibold mb-2 text-white">企业办公</h4>
                <p className="text-sm text-gray-400">&ldquo;打造智慧办公环境&rdquo;</p>
              </CardContent>
            </Card>

            <Card className="group bg-gradient-to-br from-blue-900/20 to-slate-900/20 border-blue-500/20 hover:border-blue-400/40 transition-all duration-300 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-semibold mb-2 text-white">教育机构</h4>
                <p className="text-sm text-gray-400">&ldquo;构建数字化校园&rdquo;</p>
              </CardContent>
            </Card>

            <Card className="group bg-gradient-to-br from-blue-900/20 to-slate-900/20 border-blue-500/20 hover:border-blue-400/40 transition-all duration-300 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-semibold mb-2 text-white">医疗机构</h4>
                <p className="text-sm text-gray-400">&ldquo;提升就医体验&rdquo;</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* 客户收益 */}
      <section className="relative z-10 py-20 bg-gradient-to-r from-slate-900/50 to-blue-900/20 backdrop-blur-sm">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <Badge variant="outline" className="bg-blue-500/10 text-blue-300 border-blue-500/30 px-3 py-1 mb-4">
              客户收益
            </Badge>
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              实现价值最大化
            </h2>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              使用我们的平台帮助企业降低成本、提升效率和增强效果
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-gradient-to-br from-green-900/20 to-slate-900/20 border-green-500/20 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <div className="text-3xl font-bold text-green-400 mb-2">80%</div>
                <h4 className="text-lg font-semibold text-white mb-2">成本节约</h4>
                <p className="text-gray-300 text-sm">人工成本减少，远程管理替代现场维护</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-900/20 to-slate-900/20 border-blue-500/20 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <div className="text-3xl font-bold text-blue-400 mb-2">10倍</div>
                <h4 className="text-lg font-semibold text-white mb-2">效率提升</h4>
                <p className="text-gray-300 text-sm">内容更新速度提升，一键发布到所有设备</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-900/20 to-slate-900/20 border-purple-500/20 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <div className="text-3xl font-bold text-purple-400 mb-2">300%</div>
                <h4 className="text-lg font-semibold text-white mb-2">效果提升</h4>
                <p className="text-gray-300 text-sm">营销活动转化率大幅提升</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA部分 */}
      <section className="relative z-10 py-20">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold mb-6">
              准备开始您的
              <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                智能化之旅
              </span>
              了吗？
            </h2>
            <p className="text-xl text-gray-300 mb-8">立即体验我们的LED云平台，开启智能显示设备管理新时代</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 border-0"
                asChild
              >
                <Link href="/login">免费试用</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 bg-transparent"
              >
                联系销售
              </Button>
            </div>
          </div>
        </div>
      </section>
      <footer className="relative z-10 border-t border-white/10 bg-slate-950/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center">
                  <Cpu className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                  LED云平台
                </span>
              </div>
              <p className="text-gray-400 text-sm">专业的LED显示设备云管理平台</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">产品</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    内容管理
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    设备控制
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    数据分析
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">解决方案</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    智能化管理
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    数据驱动
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    全生命周期
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">支持</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    帮助中心
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    技术支持
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    联系我们
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2025 LED云平台. 保留所有权利.</p>
          </div>
        </div>
      </footer>
      <Footer />
    </main>
  );
}