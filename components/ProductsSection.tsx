'use client';

import React from 'react';
import { Card, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// 创建产品组件
const ProductCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description?: string;
  features?: string[];
}> = ({ icon, title, description, features }) => {
  return (
    <Card className="flex flex-col items-center p-4 bg-[#0a1c4e]/20 border-blue-500/20 hover:bg-[#0a1c4e]/40 transition-all duration-300 group">
      <div className="w-12 h-12 flex items-center justify-center text-blue-400 mb-3 group-hover:text-blue-300 transition-colors">
        {icon}
      </div>
      <CardTitle className="text-base font-medium text-white mb-1">{title}</CardTitle>
      {description && <CardDescription className="text-xs text-gray-400 text-center">{description}</CardDescription>}
      {features && (
        <div className="mt-3 w-full">
          {features.map((feature, idx) => (
            <div key={idx} className="flex items-center gap-2 text-xs text-gray-300 mt-1">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500/50" />
              <span>{feature}</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

const ProductsSection: React.FC = () => {
  const products = [
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      title: '智能设备管理',
      description: '高效便捷的设备接入与管理体系',
      features: ['设备一键添加', '实时状态监控', '远程控制', '批量操作']
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
      title: '内容发布系统',
      description: '轻松创建与发布各类多媒体内容',
      features: ['拖拽式上传', '智能转换', '定时播放', '实时预览']
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      ),
      title: '消息通知中心',
      description: '重要信息不错过，设备异常及时知',
      features: ['即时通知', '群发消息', '移动推送', '历史记录']
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      title: '团队协作管理',
      description: '多角色协同工作，规范流程权限',
      features: ['权限分配', '多人协作', '操作审批', '数据统计']
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      title: '数据分析报表',
      description: '直观数据洞察，优化运营决策',
      features: ['实时监控数据', '趋势分析', '自定义报表', '数据导出']
    },
  ];

  const advantages = [
    { label: '高效管理', description: '10分钟完成设备接入' },
    { label: '安全可靠', description: '银行级安全防护' },
    { label: '7×24小时', description: '全天候技术支持' },
  ];

  return (
    <section id="products" className="py-16 bg-[#030a1c]">
      <div className="container mx-auto px-6 md:px-16">
        <div className="text-center mb-12">
          <Badge variant="outline" className="bg-blue-500/10 text-blue-300 border-blue-500/30 px-3 py-1 mb-4">
            核心功能
          </Badge>
          <h2 className="text-3xl font-bold mb-4 text-white">
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              全方位LED屏幕管理解决方案
            </span>
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto text-sm">
            我们的LED管理平台提供专业、高效的解决方案，满足您的所有业务需求
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {products.map((product, index) => (
            <ProductCard
              key={index}
              icon={product.icon}
              title={product.title}
              description={product.description}
              features={product.features}
            />
          ))}
        </div>

        {/* 优势展示 */}
        <div className="mt-16 max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {advantages.map((adv, idx) => (
              <Card key={idx} className="border-blue-500/20 bg-slate-900/50 overflow-hidden relative">
                <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-blue-500/10" />
                <CardContent className="p-6">
                  <div className="text-3xl font-bold text-blue-400 mb-2">{adv.label}</div>
                  <p className="text-gray-300 text-sm">{adv.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* 3D效果图 */}
        <div className="mt-16 flex justify-center">
          <div className="w-64 h-64 relative">
            <svg className="w-full h-full text-blue-500/20" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
              <g transform="rotate(45, 100, 100)">
                <rect x="25" y="25" width="150" height="150" fill="none" stroke="currentColor" strokeWidth="1" />
                <rect x="50" y="50" width="100" height="100" fill="none" stroke="currentColor" strokeWidth="1" />
                <rect x="75" y="75" width="50" height="50" fill="none" stroke="currentColor" strokeWidth="1" />
                <line x1="25" y1="25" x2="75" y2="75" stroke="currentColor" strokeWidth="1" />
                <line x1="175" y1="25" x2="125" y2="75" stroke="currentColor" strokeWidth="1" />
                <line x1="25" y1="175" x2="75" y2="125" stroke="currentColor" strokeWidth="1" />
                <line x1="175" y1="175" x2="125" y2="125" stroke="currentColor" strokeWidth="1" />
              </g>
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductsSection; 