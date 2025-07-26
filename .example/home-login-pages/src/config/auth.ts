/**
 * 认证配置
 * 
 * 包含登录相关的环境配置，例如网关地址、认证端点等
 * 可以根据不同环境调整参数
 */
import { getDefaultSite, getSiteById, SITE_STORAGE_KEY } from './sites';

// 获取当前选择的网关URL
export const getCurrentGatewayUrl = (): string => {
  // 检查是否在浏览器环境
  if (typeof window !== 'undefined') {
    const storedSiteId = localStorage.getItem(SITE_STORAGE_KEY);
    if (storedSiteId) {
      const site = getSiteById(storedSiteId);
      return site.gatewayUrl;
    }
  }
  
  // 默认返回默认站点的网关URL
  return getDefaultSite().gatewayUrl;
};

// 动态获取网关地址
export const GATEWAY_URL = getCurrentGatewayUrl();

// 认证相关端点
export const getAuthEndpoints = (gatewayUrl = GATEWAY_URL) => ({
  // OAuth2授权端点
  authorize: `${gatewayUrl}/oauth2/authorization/gateway-server`,
  
  // 用户信息端点
  userInfo: `${gatewayUrl}/api/user/info`,
  
  // 登出端点
  logout: `${gatewayUrl}/logout`
});

// 登录功能
export const login = (redirectUri: string = "/dashboard") => {
  // 获取最新的网关URL
  const gatewayUrl = getCurrentGatewayUrl();
  const endpoints = getAuthEndpoints(gatewayUrl);
  
  // 默认重定向到仪表盘，除非指定其他地址
  const fullRedirectUri = window.location.origin + redirectUri;
  
  // 构建完整的认证URL
  const authUrl = `${endpoints.authorize}?redirect_uri=${encodeURIComponent(fullRedirectUri)}`;
  
  // 执行重定向
  window.location.href = authUrl;
};

// 登出功能
export const logout = () => {
  // 获取最新的网关URL
  const gatewayUrl = getCurrentGatewayUrl();
  const endpoints = getAuthEndpoints(gatewayUrl);
  
  // 重定向到登出端点
  window.location.href = endpoints.logout;
}; 