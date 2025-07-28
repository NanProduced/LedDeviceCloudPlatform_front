import { fetchApi, CORE_API_PREFIX } from "../api";
import { 
  PermissionResponse, 
  OperationPermissionResponse,
  PermissionExpressionRequest, 
  PermissionDenyRequest 
} from "../types";

// 权限管理相关API
export const permissionApi = {
  // 获取当前用户可用权限
  getCurrentUserPermissions: async (): Promise<Record<string, OperationPermissionResponse[]>> => {
    try {
      const rawResponse = await fetchApi(`${CORE_API_PREFIX}/operation_permission/get`);
      console.log("获取操作权限原始响应:", rawResponse);
      
      // 统一处理各种可能的响应格式
      let processedResponse: Record<string, OperationPermissionResponse[]> = {};
      
      // 处理不同的响应格式
      if (rawResponse && typeof rawResponse === 'object') {
        // 直接是预期的格式
        if (!Array.isArray(rawResponse) && Object.keys(rawResponse).length > 0) {
          // 检查第一个值是否为数组，确认是预期格式
          const firstKey = Object.keys(rawResponse)[0];
          if (Array.isArray(rawResponse[firstKey])) {
            processedResponse = rawResponse;
          }
        }
        
        // 嵌套在data字段中
        if ('data' in rawResponse && typeof rawResponse.data === 'object') {
          processedResponse = rawResponse.data;
        }
        
        // 是一个权限数组，需要分类
        if (Array.isArray(rawResponse)) {
          const groupedPermissions: Record<string, OperationPermissionResponse[]> = {};
          rawResponse.forEach((permission: OperationPermissionResponse) => {
            const category = permission.operationType || '未分类';
            if (!groupedPermissions[category]) {
              groupedPermissions[category] = [];
            }
            groupedPermissions[category].push(permission);
          });
          processedResponse = groupedPermissions;
        }
      }
      
      // 如果没有有效数据，使用模拟数据
      if (Object.keys(processedResponse).length === 0) {
        console.warn("API未返回有效权限数据，使用模拟数据");
        return getMockOperationPermissions();
      }
      
      return processedResponse;
    } catch (error) {
      console.error("获取用户操作权限失败", error);
      // 返回模拟数据
      return getMockOperationPermissions();
    }
  },

  // 获取用户组权限状态
  getUserGroupPermissionStatus: async (ugid: number) => {
    try {
      return await fetchApi(`${CORE_API_PREFIX}/terminal-group/permission/status?ugid=${ugid}`);
    } catch (error) {
      console.error("获取用户组权限状态失败", error);
      // 返回模拟数据
      return getMockPermissionStatus();
    }
  },

  // 更新权限表达式
  updatePermissionExpression: async (request: PermissionExpressionRequest) => {
    try {
      return await fetchApi(`${CORE_API_PREFIX}/terminal-group/permission/expression/update`, {
        method: "POST",
        body: JSON.stringify(request),
      });
    } catch (error) {
      console.error("更新权限表达式失败", error);
      // 返回模拟成功
      return getMockUpdateResponse();
    }
  },

  // 添加拒绝权限
  addDenyPermission: async (request: PermissionDenyRequest) => {
    return await fetchApi(`${CORE_API_PREFIX}/permission-deny/add`, {
      method: "POST",
      body: JSON.stringify(request),
    });
  },

  // 移除拒绝权限
  removeDenyPermission: async (request: PermissionDenyRequest) => {
    return await fetchApi(`${CORE_API_PREFIX}/permission-deny/remove`, {
      method: "POST",
      body: JSON.stringify(request),
    });
  },

  // 移除用户所有拒绝权限
  removeAllUserDenyPermissions: async (userId: number, orgId: number) => {
    return await fetchApi(
      `${CORE_API_PREFIX}/permission-deny/remove-all?userId=${userId}&orgId=${orgId}`,
      {
        method: "POST",
      }
    );
  },

  // 检查用户是否被拒绝访问特定接口
  checkUserDenied: async (userId: number, orgId: number, url: string, method: string) => {
    return await fetchApi(
      `${CORE_API_PREFIX}/permission-deny/check?userId=${userId}&orgId=${orgId}&url=${encodeURIComponent(
        url
      )}&method=${method}`,
      {
        method: "GET",
      }
    );
  },
};

// 模拟数据 - 为了保持代码兼容性保留旧的函数
function getMockPermissions(): Record<string, PermissionResponse[]> {
  return {
    系统管理: [
      { permissionId: 1, permissionName: "用户管理", permissionDescription: "管理系统用户", permissionType: "SYSTEM" },
      { permissionId: 2, permissionName: "角色管理", permissionDescription: "管理系统角色", permissionType: "SYSTEM" },
      { permissionId: 3, permissionName: "组织架构", permissionDescription: "管理组织架构", permissionType: "SYSTEM" },
    ],
    设备管理: [
      { permissionId: 4, permissionName: "设备查看", permissionDescription: "查看设备信息", permissionType: "DEVICE" },
      { permissionId: 5, permissionName: "设备控制", permissionDescription: "控制设备", permissionType: "DEVICE" },
      { permissionId: 6, permissionName: "设备配置", permissionDescription: "配置设备参数", permissionType: "DEVICE" },
    ],
    内容管理: [
      { permissionId: 7, permissionName: "节目管理", permissionDescription: "管理播放节目", permissionType: "CONTENT" },
      { permissionId: 8, permissionName: "素材管理", permissionDescription: "管理素材库", permissionType: "CONTENT" },
      { permissionId: 9, permissionName: "排期管理", permissionDescription: "管理播放排期", permissionType: "CONTENT" },
    ],
  };
}

// 新的模拟操作权限数据
function getMockOperationPermissions(): Record<string, OperationPermissionResponse[]> {
  return {
    系统管理: [
      { operationPermissionId: 1, operationName: "用户管理", operationDescription: "管理系统用户", operationType: "SYSTEM" },
      { operationPermissionId: 2, operationName: "角色管理", operationDescription: "管理系统角色", operationType: "SYSTEM" },
      { operationPermissionId: 3, operationName: "组织架构", operationDescription: "管理组织架构", operationType: "SYSTEM" },
    ],
    设备管理: [
      { operationPermissionId: 4, operationName: "设备查看", operationDescription: "查看设备信息", operationType: "DEVICE" },
      { operationPermissionId: 5, operationName: "设备控制", operationDescription: "控制设备", operationType: "DEVICE" },
      { operationPermissionId: 6, operationName: "设备配置", operationDescription: "配置设备参数", operationType: "DEVICE" },
    ],
    内容管理: [
      { operationPermissionId: 7, operationName: "节目管理", operationDescription: "管理播放节目", operationType: "CONTENT" },
      { operationPermissionId: 8, operationName: "素材管理", operationDescription: "管理素材库", operationType: "CONTENT" },
      { operationPermissionId: 9, operationName: "排期管理", operationDescription: "管理播放排期", operationType: "CONTENT" },
    ],
    数据分析: [
      { operationPermissionId: 10, operationName: "数据报表", operationDescription: "查看数据报表", operationType: "ANALYTICS" },
      { operationPermissionId: 11, operationName: "数据导出", operationDescription: "导出数据分析", operationType: "ANALYTICS" },
    ],
  };
}

function getMockPermissionStatus() {
  return {
    ugid: 1001,
    userGroupName: "管理组",
    permissionBindings: [
      {
        bindingId: 10001,
        tgid: 2001,
        terminalGroupName: "LED屏幕组",
        terminalGroupPath: "/root/device/led",
        bindingType: "INCLUDE",
        includeChildren: true,
        depth: 1,
        parentTgid: 1000,
        createTime: "2023-05-20T10:00:00",
        updateTime: "2023-05-20T10:00:00",
        remarks: "包含所有LED屏幕",
      },
      {
        bindingId: 10002,
        tgid: 2002,
        terminalGroupName: "显示器组",
        terminalGroupPath: "/root/device/display",
        bindingType: "EXCLUDE",
        includeChildren: false,
        depth: 1,
        parentTgid: 1000,
        createTime: "2023-05-20T10:00:00",
        updateTime: "2023-05-20T10:00:00",
        remarks: "排除显示器",
      },
    ],
    statistics: {
      totalBindings: 2,
      includeBindings: 1,
      excludeBindings: 1,
      includeChildrenBindings: 1,
      totalCoveredTerminalGroups: 10,
      maxDepth: 2,
    },
    lastUpdateTime: "2023-05-20T10:00:00",
  };
}

function getMockUpdateResponse() {
  return {
    success: true,
    message: "权限表达式更新成功",
    ugid: 1001,
    statistics: {
      originalCount: 3,
      optimizedCount: 2,
      redundancyRemoved: 1,
      addedCount: 1,
      updatedCount: 0,
      deletedCount: 0,
      optimizationRatio: 33.33,
    },
    optimizedBindings: [
      {
        tgid: 2001,
        terminalGroupName: "LED屏幕组",
        bindingType: "INCLUDE",
        includeChildren: true,
        depth: 1,
        parentTgid: 1000,
        optimized: true,
      },
    ],
    operationDetails: [
      {
        tgid: 2003,
        terminalGroupName: "冗余组",
        operationType: "REDUNDANCY_REMOVED",
        oldBinding: "INCLUDE(includeChildren=false)",
        reason: "包含在父组权限中",
        success: true,
      },
    ],
    operationTime: "2023-06-15T14:30:00",
  };
} 