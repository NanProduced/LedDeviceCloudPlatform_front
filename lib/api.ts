// API请求基础路径配置 - 现在使用相对路径
export const API_BASE_URL = ''; // 不再需要完整URL，改用相对路径

// 核心服务API前缀 - 确保与网关规范一致
export const CORE_API_PREFIX = '/core/api';

// 是否开启开发环境模式（用于控制日志等）
export const isDev = process.env.NODE_ENV === 'development';

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
    if (isDev) {
      console.log('发送API请求:', path, {
        method: mergedOptions.method || 'GET',
        hasBody: !!mergedOptions.body
      });
    }
    
    // 开发环境下添加延迟，便于测试加载状态
    if (isDev && process.env.NEXT_PUBLIC_API_DELAY) {
      await new Promise(resolve => setTimeout(resolve, parseInt(process.env.NEXT_PUBLIC_API_DELAY || '300')));
    }
    
    const response = await fetch(path, mergedOptions);
    
    // 开发环境网络错误处理
    if (!response.ok) {
      console.error(`API请求失败: ${response.status}`, response);
      throw new Error(`API请求失败: ${response.status} - ${response.statusText}`);
    }
    
    // 解析响应数据
    let responseData;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json();
      if (isDev) {
        console.log('API响应数据:', responseData);
      }
    } else {
      // 处理非JSON响应
      const text = await response.text();
      try {
        // 尝试解析为JSON
        responseData = JSON.parse(text);
      } catch {
        // 不是有效的JSON，返回文本
        return text;
      }
    }
    
    // 处理统一的API响应结构
    if (responseData && typeof responseData === 'object') {
      // 成功标识检查 - 如果存在code字段
      if ('code' in responseData) {
        if (responseData.code !== 0 && responseData.code !== 200) {
          throw new Error(responseData.msg || `API错误: 代码 ${responseData.code}`);
        }
      }
      
      // 如果有data字段，返回data内容
      if ('data' in responseData) {
        if (isDev) {
          console.log('提取data字段:', responseData.data);
        }
        return responseData.data;
      }
      // 如果有result字段，返回result内容
      if ('result' in responseData) {
        if (isDev) {
          console.log('提取result字段:', responseData.result);
        }
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
    try {
      return await fetchApi(`${CORE_API_PREFIX}/user/current`);
    } catch (error) {
      console.error('获取当前用户信息失败', error);
      throw error;
    }
  },
  
  // 修改密码
  modifyPassword: async (oldPassword: string, newPassword: string) => {
    try {
      return await fetchApi(`${CORE_API_PREFIX}/user/modify/pwd`, {
        method: 'POST',
        body: JSON.stringify({ oldPassword, newPassword }),
      });
    } catch (error) {
      console.error('修改密码失败', error);
      throw error;
    }
  }
}; 