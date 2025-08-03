import { fetchApi, CORE_API_PREFIX } from '../api';

// 终端相关类型定义
export interface TerminalListParams {
  tgid: number; // 终端组ID
  pageNum?: number;
  pageSize?: number;
  includeSubGroups?: boolean; // 是否包含子组
  keyword?: string; // 终端名称或描述关键字
  terminalModel?: string; // 终端型号筛选
  onlineStatus?: number; // 在线状态筛选, 0:离线;1:在线
}

export interface Terminal {
  tid: number;
  terminalName: string;
  description: string;
  terminalModel: string;
  tgid: number;
  tgName: string;
  firmwareVersion: string;
  serialNumber: string;
  onlineStatus: number; // 0:离线;1:在线
  createdAt: string;
  updatedAt: string;
  createdBy: number;
}

export interface TerminalListResponse {
  pageNum: number;
  pageSize: number;
  total: number;
  totalPages: number;
  records: Terminal[];
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface TerminalGroupTreeNode {
  tgid: number;
  tgName: string;
  parent: number;
  path: string;
  pathMap: Record<string, string>;
  children: TerminalGroupTreeNode[];
  childrenCount: number;
  description: string;
  hasPermission: boolean;
}

export interface TerminalGroupTreeResponse {
  organization: {
    oid: number;
    orgName: string;
    suffix: number;
  };
  accessibleTrees: TerminalGroupTreeNode[];
}

export interface CreateTerminalRequest {
  terminalName: string;
  description?: string;
  terminalAccount: string;
  terminalPassword: string;
  tgid: number;
}

// 终端API
export const terminalApi = {
  // 获取终端列表
  getTerminalList: async (params: TerminalListParams): Promise<TerminalListResponse> => {
    try {
      // 构建分页请求对象
      const requestBody = {
        pageNum: params.pageNum || 1,
        pageSize: params.pageSize || 20,
        params: {
          tgid: params.tgid,
          includeSubGroups: params.includeSubGroups || false,
          keyword: params.keyword || undefined,
          terminalModel: params.terminalModel || undefined,
          onlineStatus: params.onlineStatus !== undefined ? params.onlineStatus : undefined,
        }
      };

      return await fetchApi(`${CORE_API_PREFIX}/terminal/list`, {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });
    } catch (error) {
      console.error('获取终端列表失败', error);
      throw error;
    }
  },

  // 获取终端组树
  getTerminalGroupTree: async (): Promise<TerminalGroupTreeResponse> => {
    try {
      return await fetchApi(`${CORE_API_PREFIX}/terminal-group/tree/init`);
    } catch (error) {
      console.error('获取终端组树失败', error);
      throw error;
    }
  },

  // 创建终端
  createTerminal: async (data: CreateTerminalRequest): Promise<void> => {
    try {
      return await fetchApi(`${CORE_API_PREFIX}/terminal/create`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error('创建终端失败', error);
      throw error;
    }
  },

  // 删除终端（虽然API文档中没有，但通常会有这个接口）
  deleteTerminal: async (tid: number): Promise<void> => {
    try {
      return await fetchApi(`${CORE_API_PREFIX}/terminal/delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ tid: tid.toString() }).toString(),
      });
    } catch (error) {
      console.error('删除终端失败', error);
      throw error;
    }
  },

  // 激活终端（如果有这个接口的话）
  activeTerminal: async (tid: number): Promise<void> => {
    try {
      return await fetchApi(`${CORE_API_PREFIX}/terminal/active`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ tid: tid.toString() }).toString(),
      });
    } catch (error) {
      console.error('激活终端失败', error);
      throw error;
    }
  },

  // 停用终端（如果有这个接口的话）
  inactiveTerminal: async (tid: number): Promise<void> => {
    try {
      return await fetchApi(`${CORE_API_PREFIX}/terminal/inactive`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ tid: tid.toString() }).toString(),
      });
    } catch (error) {
      console.error('停用终端失败', error);
      throw error;
    }
  },
};