import React from 'react';

const SolutionsSection: React.FC = () => {
  const solutions = [
    {
      title: '智能化管理',
      description: '基于云技术的智能管理系统，支持远程控制和自动化运维',
    },
    {
      title: '数据驱动决策',
      description: '全面数据分析，帮助您做出更明智的业务决策',
    },
    {
      title: '设备全生命周期管理',
      description: '从安装部署到日常维护，提供完整的设备管理方案',
    },
    {
      title: '内容智能分发',
      description: '根据不同场景和时间智能分发内容，提高宣传效果',
    },
  ];

  return (
    <section id="solutions" className="py-16 bg-gradient-to-b from-[#050b1f] to-[#030a1c]">
      <div className="container mx-auto px-6 md:px-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 text-white">
            <span className="text-blue-400">
              Solutions
            </span>
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto text-sm">
            我们提供满足各种场景需求的整体解决方案
          </p>
        </div>

        {/* 解决方案列表 */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {solutions.map((solution, index) => (
            <div 
              key={index} 
              className="border border-blue-500/20 bg-[#0a1c4e]/20 rounded-lg p-6 hover:bg-[#0a1c4e]/40 transition-all duration-300"
            >
              <h3 className="text-lg font-medium text-white mb-3 flex items-center">
                <span className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 mr-3 text-xs">
                  {index + 1}
                </span>
                {solution.title}
              </h3>
              <p className="text-gray-400 text-sm">{solution.description}</p>
            </div>
          ))}
        </div>

        {/* 发光圆环效果 - 简化版 */}
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