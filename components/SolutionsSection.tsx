'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const SolutionsSection: React.FC = () => {
  const solutions = [
    {
      title: '智能化管理',
      description: '基于云技术的智能管理系统，支持远程控制和自动化运维',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
        </svg>
      )
    },
    {
      title: '数据驱动决策',
      description: '全面数据分析，帮助您做出更明智的业务决策',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      title: '设备全生命周期管理',
      description: '从安装部署到日常维护，提供完整的设备管理方案',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      )
    },
    {
      title: '内容智能分发',
      description: '根据不同场景和时间智能分发内容，提高宣传效果',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
        </svg>
      )
    },
  ];

  const scenarios = [
    {
      title: '零售连锁',
      description: '让每家门店展示同步更新',
      features: [
        '新品推广信息同步发布到全国门店',
        '促销活动倒计时实时显示',
        '根据不同地区定制化展示内容',
        '总部统一管控，门店无需人工操作'
      ],
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      )
    },
    {
      title: '企业办公',
      description: '打造智慧办公环境',
      features: [
        '会议室预约信息实时显示',
        '公司通知公告及时发布',
        '企业文化宣传内容轮播',
        '访客欢迎信息个性化展示'
      ],
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      )
    },
    {
      title: '教育机构',
      description: '构建数字化校园',
      features: [
        '课程安排、考试通知及时发布',
        '校园活动宣传图片展示',
        '紧急通知快速全校推送',
        '班级信息、荣誉榜动态更新'
      ],
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path d="M12 14l9-5-9-5-9 5 9 5z" />
          <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
        </svg>
      )
    },
    {
      title: '医疗机构',
      description: '提升就医体验',
      features: [
        '科室导航、专家介绍清晰展示',
        '排队叫号信息实时更新',
        '健康知识、防疫信息宣传',
        '医院通知、活动信息发布'
      ],
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      )
    }
  ];

  return (
    <section id="solutions" className="py-16 bg-gradient-to-b from-[#050b1f] to-[#030a1c]">
      <div className="container mx-auto px-6 md:px-16">
        <div className="text-center mb-12">
          <Badge variant="outline" className="bg-blue-500/10 text-blue-300 border-blue-500/30 px-3 py-1 mb-4">
            解决方案
          </Badge>
          <h2 className="text-3xl font-bold mb-4 text-white">
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              量身定制的行业应用方案
            </span>
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto text-sm">
            我们提供满足各种场景需求的整体解决方案，让LED屏幕管理变得简单
          </p>
        </div>

        {/* 解决方案列表 */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {solutions.map((solution, index) => (
            <Card 
              key={index} 
              className="border-blue-500/20 bg-[#0a1c4e]/20 hover:bg-[#0a1c4e]/40 transition-all duration-300"
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                    {solution.icon}
                  </div>
                  <h3 className="text-lg font-medium text-white">{solution.title}</h3>
                </div>
                <p className="text-gray-400 text-sm">{solution.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Separator className="my-16 bg-blue-500/20" />

        {/* 适用场景部分 */}
        <div className="text-center mb-12">
          <Badge variant="outline" className="bg-blue-500/10 text-blue-300 border-blue-500/30 px-3 py-1 mb-4">
            适用场景
          </Badge>
          <h2 className="text-3xl font-bold mb-4 text-white">
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              满足多样化应用需求
            </span>
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto text-sm">
            我们的平台适用于各种行业和场景，为您提供专业的LED屏幕管理解决方案
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
          {scenarios.map((scenario, idx) => (
            <Card key={idx} className="border-blue-500/20 bg-[#0a1c4e]/20 overflow-hidden">
              <CardContent className="p-6">
                <div className="w-16 h-16 mb-4 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                  {scenario.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{scenario.title}</h3>
                <p className="text-blue-300 font-medium text-sm mb-4">&ldquo;{scenario.description}&rdquo;</p>
                <ul className="space-y-2">
                  {scenario.features.map((feature, fidx) => (
                    <li key={fidx} className="text-xs text-gray-300 flex items-start gap-2">
                      <svg className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 发光圆环效果 */}
        <div className="mt-16 flex justify-center">
          <div className="relative w-64 h-64">
            <div className="absolute inset-0 rounded-full border border-blue-400/20 animate-pulse"></div>
            <div className="absolute inset-2 rounded-full border border-blue-400/30"></div>
            <div className="absolute inset-4 rounded-full border border-blue-400/20"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-blue-400/20 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SolutionsSection; 