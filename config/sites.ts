/**
 * 站点配置
 * 
 * 包含全球不同地区的服务站点配置
 * 每个站点包含区域代码、名称、网关URL等信息
 */

export interface SiteConfig {
  id: string;         // 站点唯一标识
  name: string;       // 站点名称
  region: string;     // 区域名称
  flag: string;       // 国旗图标代码
  gatewayUrl: string; // 网关URL
  isDefault?: boolean; // 是否为默认站点
}

// 全球站点配置
export const SITES: SiteConfig[] = [
  {
    id: 'cn-shenzhen',
    name: '深圳',
    region: 'CN',
    flag: '🇨🇳',
    gatewayUrl: 'http://192.168.1.222:8082',
    isDefault: true
  },
  {
    id: 'cn-hongkong',
    name: '香港',
    region: 'CN-HK',
    flag: '🇭🇰',
    gatewayUrl: '#', // 将来替换为实际地址
  },
  {
    id: 'uk-london',
    name: '伦敦',
    region: 'UK',
    flag: '🇬🇧',
    gatewayUrl: '#', // 将来替换为实际地址
  },
  {
    id: 'us-sanfrancisco',
    name: '旧金山',
    region: 'US',
    flag: '🇺🇸',
    gatewayUrl: '#', // 将来替换为实际地址
  },
  {
    id: 'sg-singapore',
    name: '新加坡',
    region: 'SG',
    flag: '🇸🇬',
    gatewayUrl: '#', // 将来替换为实际地址
  }
];

// 获取默认站点
export const getDefaultSite = (): SiteConfig => {
  return SITES.find(site => site.isDefault) || SITES[0];
};

// 根据ID获取站点
export const getSiteById = (id: string): SiteConfig => {
  return SITES.find(site => site.id === id) || getDefaultSite();
};

// 站点存储键
export const SITE_STORAGE_KEY = 'led_platform_selected_site'; 