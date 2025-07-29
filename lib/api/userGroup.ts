import { CreateUserGroupRequest, UserGroupTreeResponse } from "../types";
import { fetchApi, CORE_API_PREFIX } from "../api";

// 终端组树响应类型（从API文档推断）
interface TerminalGroupTreeResponse {
  organization: {
    oid: number;
    orgName: string;
    suffix: number;
  };
  accessibleTrees: TerminalGroupTreeNode[];
}

interface TerminalGroupTreeNode {
  tgid: number;
  tgName: string;
  parent: number | null;
  path: string;
  pathMap: Record<string, string>;
  children: TerminalGroupTreeNode[];
  childrenCount?: number;
  description?: string;
  hasPermission?: boolean;
}

// 用户组相关API
export const userGroupApi = {
  // 获取用户组树
  getUserGroupTree: async (): Promise<UserGroupTreeResponse> => {
    try {
      return await fetchApi(`${CORE_API_PREFIX}/user-group/tree/init`);
    } catch (error) {
      console.error("获取用户组树失败", error);
      // 返回模拟数据以便在API不可用时进行开发
      return getMockUserGroupTree();
    }
  },

  // 创建用户组
  createUserGroup: async (request: CreateUserGroupRequest): Promise<void> => {
    return await fetchApi(`${CORE_API_PREFIX}/user-group/create`, {
      method: "POST",
      body: JSON.stringify(request),
    });
  },

  // 删除用户组
  deleteUserGroup: async (ugid: number): Promise<void> => {
    return await fetchApi(`${CORE_API_PREFIX}/user-group/delete?ugid=${ugid}`, {
      method: "POST",
    });
  },

  // 获取终端组树
  getTerminalGroupTree: async (): Promise<TerminalGroupTreeResponse> => {
    try {
      return await fetchApi(`${CORE_API_PREFIX}/terminal-group/tree/init`);
    } catch (error) {
      console.error("获取终端组树失败", error);
      // 返回模拟数据以便在API不可用时进行开发
      return getMockTerminalGroupTree();
    }
  },
};

// 模拟用户组树数据，用于开发测试
function getMockUserGroupTree(): UserGroupTreeResponse {
  return {
    organization: {
      oid: 1,
      orgName: "Google LED",
      suffix: 101,
    },
    root: {
      ugid: 1,
      ugName: "Google LED",
      parent: null,
      path: "/Google LED",
      pathMap: {
        "1": "Google LED",
      },
      children: [
        {
          ugid: 2,
          ugName: "Manager",
          parent: 1,
          path: "/Google LED/Manager",
          pathMap: {
            "1": "Google LED",
            "2": "Manager",
          },
          children: [
            {
              ugid: 3,
              ugName: "Manager Dept.1",
              parent: 2,
              path: "/Google LED/Manager/Manager Dept.1",
              pathMap: {
                "1": "Google LED",
                "2": "Manager",
                "3": "Manager Dept.1",
              },
              children: [],
            },
          ],
        },
        {
          ugid: 4,
          ugName: "Support",
          parent: 1,
          path: "/Google LED/Support",
          pathMap: {
            "1": "Google LED",
            "4": "Support",
          },
          children: [],
        },
      ],
    },
  };
}

// 模拟终端组树数据，用于开发测试
function getMockTerminalGroupTree(): TerminalGroupTreeResponse {
  return {
    organization: {
      oid: 1,
      orgName: "Google LED",
      suffix: 101,
    },
    accessibleTrees: [
      {
        tgid: 2001,
        tgName: "组织根目录",
        parent: null,
        path: "/root",
        pathMap: {
          "2001": "组织根目录",
        },
        children: [
          {
            tgid: 2002,
            tgName: "设备管理",
            parent: 2001,
            path: "/root/device",
            pathMap: {
              "2001": "组织根目录",
              "2002": "设备管理",
            },
            children: [
              {
                tgid: 2003,
                tgName: "LED设备组",
                parent: 2002,
                path: "/root/device/led",
                pathMap: {
                  "2001": "组织根目录",
                  "2002": "设备管理",
                  "2003": "LED设备组",
                },
                children: [
                  {
                    tgid: 2004,
                    tgName: "室内LED",
                    parent: 2003,
                    path: "/root/device/led/indoor",
                    pathMap: {
                      "2001": "组织根目录",
                      "2002": "设备管理",
                      "2003": "LED设备组",
                      "2004": "室内LED",
                    },
                    children: [],
                    description: "室内LED显示设备",
                  },
                  {
                    tgid: 2005,
                    tgName: "户外LED",
                    parent: 2003,
                    path: "/root/device/led/outdoor",
                    pathMap: {
                      "2001": "组织根目录",
                      "2002": "设备管理",
                      "2003": "LED设备组",
                      "2005": "户外LED",
                    },
                    children: [],
                    description: "户外LED显示设备",
                  },
                ],
                description: "LED显示设备管理",
              },
              {
                tgid: 2006,
                tgName: "显示器组",
                parent: 2002,
                path: "/root/device/monitor",
                pathMap: {
                  "2001": "组织根目录",
                  "2002": "设备管理",
                  "2006": "显示器组",
                },
                children: [],
                description: "普通显示器设备",
              },
            ],
            description: "设备管理中心",
          },
          {
            tgid: 2007,
            tgName: "内容管理",
            parent: 2001,
            path: "/root/content",
            pathMap: {
              "2001": "组织根目录",
              "2007": "内容管理",
            },
            children: [
              {
                tgid: 2008,
                tgName: "节目管理",
                parent: 2007,
                path: "/root/content/program",
                pathMap: {
                  "2001": "组织根目录",
                  "2007": "内容管理",
                  "2008": "节目管理",
                },
                children: [],
                description: "节目内容管理",
              },
            ],
            description: "内容管理中心",
          },
        ],
        description: "组织根目录",
      },
    ],
  };
} 