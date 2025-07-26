import React from "react";
import Link from "next/link";

interface FooterProps {
  className?: string;
  showFullFooter?: boolean;
}

const Footer = ({ className = "", showFullFooter = false }: FooterProps) => {
  return (
    <footer className={`bg-[#0c1424] px-6 py-3 border-t border-gray-800 ${className}`}>
      {showFullFooter ? (
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 py-8">
            <div>
              <h3 className="text-white font-medium mb-4">LED云平台</h3>
              <p className="text-gray-400 text-sm">
                企业级LED显示设备管理解决方案，提供全球化部署、多租户管理、实时监控和内容发布服务。
              </p>
              <div className="flex items-center mt-4 space-x-3">
                <a href="#" className="text-gray-400 hover:text-white">
                  <span className="sr-only">微信</span>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.807 6.337c-1.162 0-2.32.282-3.453.84C3.239 8.117 2 9.97 2 11.997c0 1.104.313 2.094.936 2.97.602.851 1.497 1.527 2.602 1.996l-.417 1.238-.051.15 1.44-.806c.353.11.711.196 1.075.257.363.06.733.09 1.106.09.065 0 .134-.001.199-.004a5.52 5.52 0 01-.146-1.265c0-1.856 1.187-3.482 2.983-4.379.421-.209.865-.365 1.325-.465a5.419 5.419 0 00-.963-2.59C10.933 7.168 9.906 6.51 8.807 6.337zM14.94 2c-2.37 0-4.405.96-5.726 2.476a6.794 6.794 0 00-1.865 4.274c0 1.314.44 2.56 1.278 3.605.837 1.046 2.009 1.85 3.361 2.305.403.136.82.23 1.247.282.427.051.864.047 1.295-.012.961-.131 1.892-.446 2.751-.944L20 15l-.678-2.027a6.787 6.787 0 001.831-2.07A6.759 6.759 0 0022 7.207c0-1.45-.513-2.828-1.422-3.898-.91-1.07-2.16-1.867-3.573-2.21A8.064 8.064 0 0014.94 2z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <span className="sr-only">QQ</span>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.656 3.333c.15 1.167.303 2.335.439 3.502.568 3.971.751 7.044-1.85 10.194a20.03 20.03 0 01-1.852 1.983c.078.153.139.267.181.341.45.784 1.003 1.184 1.816 1.283.734.09 1.384-.094 1.863-.542a1.85 1.85 0 00.647-1.355c0-.398-.114-.81-.341-1.231-.227-.421-.479-.733-.758-.936l-.1-.073c-.227-.165-.303-.322-.227-.469.075-.147.213-.22.41-.22.288 0 .593.11.919.33.325.22.612.515.862.886.249.37.445.799.586 1.285.14.486.21.991.21 1.516 0 .717-.14 1.334-.42 1.85a3.497 3.497 0 01-1.155 1.219 4.947 4.947 0 01-1.69.677 8.407 8.407 0 01-2.023.21c-.922 0-1.804-.11-2.646-.331-.842-.221-1.435-.513-1.779-.873-.075-.074-.167-.11-.276-.11-.11 0-.22.036-.33.11-.111.073-.166.155-.166.245 0 .128.037.22.111.275.422.447.942.805 1.56 1.073.617.269 1.254.466 1.91.59.657.126 1.296.209 1.92.25.622.043 1.155.065 1.599.065 1.007 0 1.932-.121 2.774-.362a6.402 6.402 0 002.238-1.03 4.848 4.848 0 001.486-1.58c.363-.622.544-1.306.544-2.053 0-.446-.064-.879-.193-1.3a5.222 5.222 0 00-.536-1.194 7.608 7.608 0 01-.739-.91c-1.254.797-2.698 1.184-4.33 1.159-1.48-.024-2.49-.524-3.031-1.5-.025-.05-.085-.147-.183-.293-1.32.834-2.93 1.26-4.828 1.279.597.844 1.304 1.575 2.123 2.193-2.927.201-5.462-1.562-7.604-5.287-.113-.198-.257-.508-.433-.93-.177-.423-.34-.845-.491-1.267-.151-.423-.25-.782-.295-1.078-.326-1.984-.273-3.618.158-4.901.432-1.283 1.065-2.407 1.9-3.372.834-.965 1.807-1.713 2.918-2.244 1.111-.532 2.16-.797 3.145-.797h.492c1.509.05 2.871.462 4.087 1.237 1.216.774 2.272 1.845 3.17 3.211.094.15.204.227.33.227h.075c.125 0 .234-.076.328-.227.35-.522.77-1.034 1.26-1.538.49-.503 1.022-.94 1.6-1.31a7.121 7.121 0 011.861-.879c.654-.21 1.333-.326 2.035-.349h.057c1.445 0 2.775.452 3.99 1.355 1.216.904 2.122 2.022 2.719 3.355.596 1.333.894 2.748.894 4.245 0 1.333-.26 2.58-.783 3.74a8.903 8.903 0 01-2.115 2.974l.062-.036.087-.056c.033-.025.064-.043.093-.055.029-.013.052-.019.069-.019.302 0 .616.32.941.098.326.065.652.167.978.305.326.138.62.314.882.531.263.215.47.465.624.748.15.284.225.591.225.923 0 .347-.1.653-.3.918-.201.264-.446.397-.736.397-.14 0-.276-.037-.41-.11a.558.558 0 01-.246-.33c-.025-.099-.085-.203-.178-.312a1.325 1.325 0 00-.337-.288 2.38 2.38 0 00-.511-.223 2.304 2.304 0 00-.67-.092c-.212 0-.417.03-.615.092-.037.029-.075.03-.112.008-.037-.024-.056-.067-.056-.13 0-.043.013-.08.038-.11.075-.099.163-.246.262-.44a1.09 1.09 0 01-.53-.157.986.986 0 01-.342-.387 1.4 1.4 0 01-.131-.642c0-.297.075-.558.225-.784.15-.227.352-.408.604-.542-.402-.546-.779-1.166-1.13-1.86-.352-.692-.678-1.427-.978-2.202A24.834 24.834 0 0117.656 3.333z" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <span className="sr-only">GitHub</span>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-white font-medium mb-4">产品服务</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/features" className="text-gray-400 hover:text-white">功能特性</Link>
                </li>
                <li>
                  <Link href="/pricing" className="text-gray-400 hover:text-white">价格方案</Link>
                </li>
                <li>
                  <Link href="/resources" className="text-gray-400 hover:text-white">资源中心</Link>
                </li>
                <li>
                  <Link href="/case-studies" className="text-gray-400 hover:text-white">客户案例</Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-medium mb-4">支持中心</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/help" className="text-gray-400 hover:text-white">帮助文档</Link>
                </li>
                <li>
                  <Link href="/faq" className="text-gray-400 hover:text-white">常见问题</Link>
                </li>
                <li>
                  <Link href="/developers" className="text-gray-400 hover:text-white">开发者中心</Link>
                </li>
                <li>
                  <Link href="/contact" className="text-gray-400 hover:text-white">联系我们</Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-medium mb-4">公司信息</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/about" className="text-gray-400 hover:text-white">关于我们</Link>
                </li>
                <li>
                  <Link href="/news" className="text-gray-400 hover:text-white">公司动态</Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-gray-400 hover:text-white">隐私政策</Link>
                </li>
                <li>
                  <Link href="/terms" className="text-gray-400 hover:text-white">使用条款</Link>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-6 pb-2">
            <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
              <div className="mb-4 md:mb-0">
                © 2023 LED云平台 版权所有
              </div>
              <div className="flex space-x-4">
                <Link href="/help" className="hover:text-blue-400">帮助中心</Link>
                <Link href="/contact" className="hover:text-blue-400">联系我们</Link>
                <Link href="/privacy" className="hover:text-blue-400">隐私政策</Link>
                <Link href="/terms" className="hover:text-blue-400">使用条款</Link>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
          <div className="mb-2 md:mb-0">
            © 2023 LED云平台 版权所有
          </div>
          <div className="flex space-x-4">
            <Link href="/help" className="hover:text-blue-400">帮助中心</Link>
            <Link href="/contact" className="hover:text-blue-400">联系我们</Link>
            <Link href="/privacy" className="hover:text-blue-400">隐私政策</Link>
            <Link href="/terms" className="hover:text-blue-400">使用条款</Link>
          </div>
        </div>
      )}
    </footer>
  );
};

export default Footer; 