import Link from 'next/link';
import React from 'react';

const Navbar: React.FC = () => {
  return (
    <nav className="w-full px-6 py-5 md:px-16 flex items-center justify-between bg-transparent absolute top-0 left-0 z-10">
      <div className="flex items-center">
        <Link href="/" className="text-2xl font-bold text-white hover:text-blue-400 transition-colors tracking-tight">
          LED云平台
        </Link>
      </div>
      <div className="hidden md:flex items-center space-x-8">
        <Link href="#solutions" className="text-gray-300 hover:text-blue-400 transition-colors text-sm font-medium">
          解决方案
        </Link>
        <Link href="#products" className="text-gray-300 hover:text-blue-400 transition-colors text-sm font-medium">
          产品
        </Link>
        <Link href="#cases" className="text-gray-300 hover:text-blue-400 transition-colors text-sm font-medium">
          案例
        </Link>
        <Link href="/login" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors text-sm font-medium tracking-wide">
          登录
        </Link>
      </div>
      <div className="md:hidden">
        <button className="text-white hover:text-blue-400 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </nav>
  );
};

export default Navbar; 