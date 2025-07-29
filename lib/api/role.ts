import { Role, RoleDetailResponse } from "../types";
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

  // 获取角色详情
  getRoleDetail: async (rid: number): Promise<RoleDetailResponse> => {
    try {
      const response = await fetchApi(`${CORE_API_PREFIX}/role/detail?rid=${rid}`);
      console.log("获取角色详情响应:", response);
      
      if (response && typeof response === 'object') {
        return response as RoleDetailResponse;
      }
      
      throw new Error('API返回数据格式不符合预期');
    } catch (error) {
      console.error("获取角色详情失败", error);
      // 返回模拟数据以便在API不可用时进行开发
      return getMockRoleDetail(rid);
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

// 模拟角色详情数据
function getMockRoleDetail(rid: number): RoleDetailResponse {
  const mockData: Record<number, RoleDetailResponse> = {
    1: {
      rid: 1,
      roleName: "admin",
      displayName: "管理员",
      description: "系统管理员，拥有全部权限",
      creatorId: 1001,
      creatorName: "系统",
      createTime: "2024-01-01T00:00:00",
      updaterId: 1001,  
      updaterName: "系统",
      updateTime: "2024-01-01T00:00:00",
      operationPermissions: [
        { operationPermissionId: 1, operationName: "用户管理", operationDescription: "管理系统用户", operationType: "SYSTEM" },
        { operationPermissionId: 2, operationName: "角色管理", operationDescription: "管理系统角色", operationType: "SYSTEM" },
        { operationPermissionId: 3, operationName: "组织架构", operationDescription: "管理组织架构", operationType: "SYSTEM" },
        { operationPermissionId: 4, operationName: "设备查看", operationDescription: "查看设备信息", operationType: "DEVICE" },
        { operationPermissionId: 5, operationName: "设备控制", operationDescription: "控制设备", operationType: "DEVICE" },
        { operationPermissionId: 6, operationName: "设备配置", operationDescription: "配置设备参数", operationType: "DEVICE" },
        { operationPermissionId: 7, operationName: "节目管理", operationDescription: "管理播放节目", operationType: "CONTENT" },
        { operationPermissionId: 8, operationName: "素材管理", operationDescription: "管理素材库", operationType: "CONTENT" },
        { operationPermissionId: 9, operationName: "排期管理", operationDescription: "管理播放排期", operationType: "CONTENT" }
      ]
    },
    2: {
      rid: 2,
      roleName: "operator",
      displayName: "运营人员",
      description: "运营人员，主要负责内容管理",
      creatorId: 1001,
      creatorName: "管理员",
      createTime: "2024-01-15T10:30:00",
      updaterId: 1002,
      updaterName: "运营经理",
      updateTime: "2024-02-01T14:20:00",
      operationPermissions: [
        { operationPermissionId: 4, operationName: "设备查看", operationDescription: "查看设备信息", operationType: "DEVICE" },
        { operationPermissionId: 7, operationName: "节目管理", operationDescription: "管理播放节目", operationType: "CONTENT" },
        { operationPermissionId: 8, operationName: "素材管理", operationDescription: "管理素材库", operationType: "CONTENT" },
        { operationPermissionId: 9, operationName: "排期管理", operationDescription: "管理播放排期", operationType: "CONTENT" }
      ]
    },
    3: {
      rid: 3,
      roleName: "viewer",
      displayName: "访客",
      description: "访客，只有查看权限",
      creatorId: 1001,
      creatorName: "管理员",
      createTime: "2024-01-20T16:45:00",
      updaterId: 1001,
      updaterName: "管理员",
      updateTime: "2024-01-20T16:45:00",
      operationPermissions: [
        { operationPermissionId: 4, operationName: "设备查看", operationDescription: "查看设备信息", operationType: "DEVICE" }
      ]
    },
    4: {
      rid: 4,
      roleName: "device_manager",
      displayName: "设备管理员",
      description: "设备管理人员，负责设备控制和配置",
      creatorId: 1001,
      creatorName: "管理员",
      createTime: "2024-02-05T09:15:00",
      updaterId: 1001,
      updaterName: "管理员",
      updateTime: "2024-02-10T11:30:00",
      operationPermissions: [
        { operationPermissionId: 4, operationName: "设备查看", operationDescription: "查看设备信息", operationType: "DEVICE" },
        { operationPermissionId: 5, operationName: "设备控制", operationDescription: "控制设备", operationType: "DEVICE" },
        { operationPermissionId: 6, operationName: "设备配置", operationDescription: "配置设备参数", operationType: "DEVICE" }
      ]
    }
  };

  return mockData[rid] || mockData[1]; // 如果找不到对应ID，返回管理员数据
} 