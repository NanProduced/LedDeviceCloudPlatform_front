import { 
  CreateUserRequest, 
  PageRequest, 
  PageResponse, 
  UserListItem, 
  UserListRequest 
} from "../types";
import { fetchApi, CORE_API_PREFIX } from "../api";

// 用户管理相关API
export const userManagementApi = {
  // 获取用户列表
  getUserList: async (
    request: PageRequest<UserListRequest>
  ): Promise<PageResponse<UserListItem>> => {
    try {
      return await fetchApi(`${CORE_API_PREFIX}/user-group/list`, {
        method: "POST",
        body: JSON.stringify(request),
      });
    } catch (error) {
      console.error("获取用户列表失败", error);
      // 返回模拟数据以便在API不可用时进行开发
      return getMockUserList(request);
    }
  },

  // 创建用户
  createUser: async (request: CreateUserRequest): Promise<void> => {
    return await fetchApi(`${CORE_API_PREFIX}/user/create`, {
      method: "POST",
      body: JSON.stringify(request),
    });
  },

  // 删除用户
  deleteUser: async (uid: number): Promise<void> => {
    return await fetchApi(`${CORE_API_PREFIX}/user/delete?uid=${uid}`, {
      method: "POST",
    });
  },

  // 封禁用户
  inactiveUser: async (uid: number): Promise<void> => {
    return await fetchApi(`${CORE_API_PREFIX}/user/inactive?uid=${uid}`, {
      method: "POST",
    });
  },

  // 解封用户
  activeUser: async (uid: number): Promise<void> => {
    return await fetchApi(`${CORE_API_PREFIX}/user/active?uid=${uid}`, {
      method: "POST",
    });
  },

  // 分配角色
  assignRolesToUser: async (targetUid: number, rids: number[]): Promise<void> => {
    return await fetchApi(`${CORE_API_PREFIX}/user/assign-roles`, {
      method: "POST",
      body: JSON.stringify({ targetUid, rids }),
    });
  },

  // 移动用户
  moveUser: async (uid: number, sourceUgid: number, targetUgid: number): Promise<void> => {
    return await fetchApi(`${CORE_API_PREFIX}/user/move`, {
      method: "POST",
      body: JSON.stringify({ uid, sourceUgid, targetUgid }),
    });
  },
};

// 模拟用户列表数据，用于开发测试
function getMockUserList(request: PageRequest<UserListRequest>): PageResponse<UserListItem> {
  const mockUsers: UserListItem[] = [
    {
      uid: 1,
      username: "张三",
      email: "zhangsan@googleled.com",
      ugid: 2,
      ugName: "Manager",
      roles: [{ rid: 1, oid: 1, roleName: "系统管理员", displayName: "系统管理员" }],
      active: 0,
      createTime: "2024-01-15T10:30:00",
      updateTime: "2024-01-15T10:30:00",
    },
    {
      uid: 2,
      username: "李四",
      email: "lisi@googleled.com",
      ugid: 2,
      ugName: "Manager",
      roles: [{ rid: 2, oid: 1, roleName: "设备操作员", displayName: "设备操作员" }],
      active: 0,
      createTime: "2024-01-20T14:20:00",
      updateTime: "2024-01-20T14:20:00",
    },
    {
      uid: 3,
      username: "王五",
      email: "wangwu@googleled.com",
      ugid: 4,
      ugName: "Support",
      roles: [{ rid: 3, oid: 1, roleName: "普通用户", displayName: "普通用户" }],
      active: 1,
      createTime: "2024-02-01T09:15:00",
      updateTime: "2024-02-01T09:15:00",
    },
    {
      uid: 4,
      username: "赵六",
      email: "zhaoliu@googleled.com",
      ugid: 3,
      ugName: "Manager Dept.1",
      roles: [{ rid: 2, oid: 1, roleName: "设备操作员", displayName: "设备操作员" }],
      active: 0,
      createTime: "2024-02-10T16:45:00",
      updateTime: "2024-02-10T16:45:00",
    },
  ];

  // 过滤用户组
  let filteredUsers = mockUsers;
  if (request.params.ugid) {
    filteredUsers = filteredUsers.filter(user => {
      if (!request.params.includeSubGroups) {
        return user.ugid === request.params.ugid;
      } else {
        // 在实际项目中，需要考虑子组的逻辑，这里简化处理
        return true;
      }
    });
  }

  // 搜索过滤
  if (request.params.userNameKeyword) {
    filteredUsers = filteredUsers.filter(user => 
      user.username.toLowerCase().includes(request.params.userNameKeyword!.toLowerCase())
    );
  }

  if (request.params.emailKeyword) {
    filteredUsers = filteredUsers.filter(user => 
      user.email.toLowerCase().includes(request.params.emailKeyword!.toLowerCase())
    );
  }

  // 状态过滤
  if (request.params.status !== undefined) {
    filteredUsers = filteredUsers.filter(user => user.active === request.params.status);
  }

  // 计算分页
  const pageNum = request.pageNum || 1;
  const pageSize = request.pageSize || 10;
  const total = filteredUsers.length;
  const totalPages = Math.ceil(total / pageSize);
  const startIndex = (pageNum - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, total);
  const records = filteredUsers.slice(startIndex, endIndex);

  return {
    pageNum,
    pageSize,
    total,
    totalPages,
    records,
    hasNext: pageNum < totalPages,
    hasPrevious: pageNum > 1,
  };
} 