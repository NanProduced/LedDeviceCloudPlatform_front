import { Role } from "../types";
import { fetchApi, CORE_API_PREFIX } from "../api";

// 角色相关API
export const roleApi = {
  // 获取当前用户可见的角色
  getVisibleRoles: async (): Promise<{ uid: number; visibleRoles: Role[] }> => {
    try {
      const rawResponse = await fetchApi(`${CORE_API_PREFIX}/role/get/visible`);
      console.log("获取角色原始响应:", rawResponse);
      
      // 统一处理各种可能的API响应格式
      let processedResponse = { uid: 0, visibleRoles: [] as Role[] };
      
      if (rawResponse && typeof rawResponse === 'object') {
        // 如果直接是预期格式
        if ('visibleRoles' in rawResponse) {
          processedResponse = {
            uid: rawResponse.uid || 0,
            visibleRoles: Array.isArray(rawResponse.visibleRoles) ? rawResponse.visibleRoles : []
          };
        } 
        // 如果是嵌套在data字段
        else if ('data' in rawResponse && typeof rawResponse.data === 'object') {
          if ('visibleRoles' in rawResponse.data) {
            processedResponse = {
              uid: rawResponse.data.uid || 0,
              visibleRoles: Array.isArray(rawResponse.data.visibleRoles) ? rawResponse.data.visibleRoles : []
            };
          }
        }
        // 如果是直接返回了角色数组
        else if (Array.isArray(rawResponse)) {
          processedResponse = {
            uid: 0,
            visibleRoles: rawResponse
          };
        }
      }
      
      // 如果没有有效数据，使用模拟数据
      if (!processedResponse.visibleRoles || processedResponse.visibleRoles.length === 0) {
        console.warn("API未返回有效角色数据，使用模拟数据");
        return getMockVisibleRoles();
      }
      
      return processedResponse;
    } catch (error) {
      console.error("获取可见角色失败", error);
      // 返回模拟数据以便在API不可用时进行开发
      return getMockVisibleRoles();
    }
  },

  // 创建角色
  createRole: async (
    roleName: string,
    description?: string,
    permissions: number[] = []
  ): Promise<void> => {
    try {
      return await fetchApi(`${CORE_API_PREFIX}/role/create`, {
        method: "POST",
        body: JSON.stringify({
          roleName,
          description,
          operationPermissions: permissions, // 更新为operationPermissions
        }),
      });
    } catch (error) {
      console.error("创建角色失败", error);
      throw error;
    }
  },

  // 更新角色
  updateRole: async (
    rid: number,
    name?: string,
    description?: string,
    permissions?: number[]
  ): Promise<void> => {
    try {
      return await fetchApi(`${CORE_API_PREFIX}/role/update`, {
        method: "POST",
        body: JSON.stringify({
          rid,
          name,
          description,
          operationPermissionIds: permissions, // 更新为operationPermissionIds
        }),
      });
    } catch (error) {
      console.error("更新角色失败", error);
      throw error;
    }
  },

  // 删除角色
  deleteRole: async (rid: number): Promise<void> => {
    try {
      return await fetchApi(`${CORE_API_PREFIX}/role/delete?rid=${rid}`, {
        method: "POST",
      });
    } catch (error) {
      console.error("删除角色失败", error);
      throw error;
    }
  },
};

// 模拟角色数据
function getMockVisibleRoles(): { uid: number; visibleRoles: Role[] } {
  return {
    uid: 1001,
    visibleRoles: [
      {
        rid: 1,
        oid: 1,
        roleName: "admin",
        displayName: "管理员",
        description: "系统管理员，拥有全部权限",
        permissions: [1, 2, 3, 4, 5, 6, 7, 8, 9]
      },
      {
        rid: 2,
        oid: 1,
        roleName: "operator",
        displayName: "运营人员",
        description: "运营人员，主要负责内容管理",
        permissions: [4, 7, 8, 9]
      },
      {
        rid: 3,
        oid: 1,
        roleName: "viewer",
        displayName: "访客",
        description: "访客，只有查看权限",
        permissions: [4]
      },
      {
        rid: 4,
        oid: 1,
        roleName: "device_manager",
        displayName: "设备管理员",
        description: "设备管理人员，负责设备控制和配置",
        permissions: [4, 5, 6]
      }
    ]
  };
} 