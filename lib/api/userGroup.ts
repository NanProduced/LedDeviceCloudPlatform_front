import { CreateUserGroupRequest, UserGroupTreeResponse } from "../types";
import { fetchApi, CORE_API_PREFIX } from "../api";

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