import React from 'react';

// 创建产品组件
const ProductCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description?: string;
}> = ({ icon, title, description }) => {
  return (
    <div className="flex flex-col items-center p-4 border border-blue-500/20 bg-[#0a1c4e]/20 rounded-lg hover:bg-[#0a1c4e]/40 transition-all duration-300 group">
      <div className="w-12 h-12 flex items-center justify-center text-blue-400 mb-3 group-hover:text-blue-300 transition-colors">
        {icon}
      </div>
      <h3 className="text-base font-medium text-white mb-1">{title}</h3>
      {description && <p className="text-xs text-gray-400 text-center">{description}</p>}
    </div>
  );
};

const ProductsSection: React.FC = () => {
  const products = [
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      title: '内容管理',
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
      title: '设备控制',
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
      title: '实时预览',
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      title: '数据分析',
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      title: '安全管理',
    },
  ];

  return (
    <section id="products" className="py-16 bg-[#030a1c]">
      <div className="container mx-auto px-6 md:px-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 text-white">
            <span className="text-blue-400">
              Products
            </span>
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto text-sm">
            我们的LED管理平台提供全方位的解决方案，满足您的所有需求
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {products.map((product, index) => (
            <ProductCard
              key={index}
              icon={product.icon}
              title={product.title}
            />
          ))}
        </div>

        {/* 3D效果图 - 简化版 */}
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

        {/* 功能点列表 - 更整洁的排版 */}
        <div className="mt-8 max-w-3xl mx-auto">
          <ul className="text-gray-300 flex flex-col md:flex-row justify-between md:space-x-8 space-y-2 md:space-y-0">
            <li className="flex items-center gap-2">
              <span className="text-blue-400">•</span> 高效管理模式
            </li>
            <li className="flex items-center gap-2">
              <span className="text-blue-400">•</span> 城市安全防护解决方案
            </li>
            <li className="flex items-center gap-2">
              <span className="text-blue-400">•</span> 全天候实时监控模式
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
};

export default ProductsSection; 