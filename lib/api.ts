// API请求基础路径配置 - 现在使用相对路径
export const API_BASE_URL = ''; // 不再需要完整URL，改用相对路径

// 核心服务API前缀
export const CORE_API_PREFIX = '/core/api';

// API请求方法
export async function fetchApi(path: string, options: RequestInit = {}) {
  // 默认添加凭据，确保发送Cookie
  const defaultOptions: RequestInit = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  const mergedOptions = { ...defaultOptions, ...options };
  
  try {
    console.log('发送API请求:', path);
    const response = await fetch(path, mergedOptions);
    
    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status}`);
    }
    
    const responseData = await response.json();
    console.log('API响应数据:', responseData);
    
    // 检查响应数据结构，可能需要提取data字段
    if (responseData && typeof responseData === 'object') {
      // 如果有data字段，返回data内容
      if ('data' in responseData) {
        console.log('提取data字段:', responseData.data);
        return responseData.data;
      }
      // 如果有result字段，返回result内容
      if ('result' in responseData) {
        console.log('提取result字段:', responseData.result);
        return responseData.result;
      }
    }
    
    return responseData;
  } catch (error) {
    console.error('API请求错误:', error);
    throw error;
  }
}

// 用户相关API
export const userApi = {
  // 获取当前登录用户信息
  getCurrentUser: async () => {
    return await fetchApi(`${CORE_API_PREFIX}/user/current`);
  },
  
  // 修改密码
  modifyPassword: async (oldPassword: string, newPassword: string) => {
    return await fetchApi(`${CORE_API_PREFIX}/user/modify/pwd`, {
      method: 'POST',
      body: JSON.stringify({ oldPassword, newPassword }),
    });
  }
}; 