import { Role } from "../types";
import { fetchApi, CORE_API_PREFIX } from "../api";

// 角色相关API
export const roleApi = {
  // 获取当前用户可见的角色
  getVisibleRoles: async (): Promise<{ uid: number; visibleRoles: Role[] }> => {
    try {
      return await fetchApi(`${CORE_API_PREFIX}/role/get/visible`);
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
    return await fetchApi(`${CORE_API_PREFIX}/role/create`, {
      method: "POST",
      body: JSON.stringify({
        roleName,
        description,
        permissions,
      }),
    });
  },

  // 更新角色
  updateRole: async (
    rid: number,
    name?: string,
    description?: string,
    permissionIds?: number[]
  ): Promise<void> => {
    return await fetchApi(`${CORE_API_PREFIX}/role/update`, {
      method: "POST",
      body: JSON.stringify({
        rid,
        name,
        description,
        permissionIds,
      }),
    });
  },

  // 删除角色
  deleteRole: async (rid: number): Promise<void> => {
    return await fetchApi(`${CORE_API_PREFIX}/role/delete?rid=${rid}`, {
      method: "POST",
    });
  },
};

// 模拟可见角色数据，用于开发测试
function getMockVisibleRoles(): { uid: number; visibleRoles: Role[] } {
  return {
    uid: 1,
    visibleRoles: [
      { rid: 1, oid: 1, roleName: "system_admin", displayName: "系统管理员" },
      { rid: 2, oid: 1, roleName: "device_operator", displayName: "设备操作员" },
      { rid: 3, oid: 1, roleName: "content_manager", displayName: "内容管理员" },
      { rid: 4, oid: 1, roleName: "viewer", displayName: "普通用户" },
    ],
  };
} 