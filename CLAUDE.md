# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个基于Next.js构建的LED云平台管理系统，用于管理LED设备、用户、节目内容和组织架构。项目采用现代化的技术栈，支持多站点配置和国际化。

## 开发命令

### 核心命令
```bash
# 启动开发服务器（使用Turbopack加速）
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm start

# 代码检查和格式化
npm run lint
```

## 技术架构

### 核心技术栈
- **框架**: Next.js 15.2.4 (App Router)
- **语言**: TypeScript
- **样式**: TailwindCSS v4
- **UI组件**: shadcn/ui + Radix UI
- **图标**: Lucide React
- **状态管理**: React本地状态 (useState)

### 项目结构
```
app/                    # Next.js App Router页面
├── dashboard/          # 仪表板主页面
├── login/              # 登录页面
├── file-management/    # 文件管理相关页面
├── program-management/ # 节目管理相关页面
├── user-management/    # 用户管理页面
├── layout.tsx          # 根布局
└── page.tsx           # 首页

components/
├── ui/                # shadcn/ui基础组件
├── *-content.tsx      # 各功能模块的内容组件
├── Footer.tsx         # 页脚组件
├── Navbar.tsx         # 导航栏组件
└── SiteSelector.tsx   # 站点选择器

config/
├── auth.ts            # 认证配置
└── sites.ts           # 多站点配置

hooks/
└── use-mobile.ts      # 移动端检测Hook

lib/
└── utils.ts           # 通用工具函数
```

### 关键架构特点

1. **App Router架构**: 使用Next.js最新的App Router，所有页面都在`app/`目录下，路由结构清晰
2. **组件化设计**: UI组件分为基础组件(`components/ui/`)和业务组件(`components/*-content.tsx`)
3. **多站点支持**: 通过`config/sites.ts`配置全球不同地区的服务站点
4. **模块化内容**: 仪表板使用动态内容切换，不同功能模块作为独立组件

### 状态管理模式
- 主要使用React的`useState`进行本地状态管理
- 仪表板通过`activeContent`状态控制不同功能模块的显示
- 站点配置通过localStorage持久化

### 样式系统
- 使用TailwindCSS v4作为主要样式框架
- 采用shadcn/ui的组件样式系统
- 支持深色模式 (`dark:` 前缀)
- 使用CSS变量进行主题定制

## 开发规范

### 代码风格 (基于Cursor规则)
- **语言**: 所有界面文字和注释使用中文
- **组件命名**: 使用PascalCase，优先使用命名导出
- **目录命名**: 使用kebab-case
- **TypeScript**: 严格类型检查，所有组件都有类型定义

### Next.js最佳实践
- 优先使用React Server Components (RSC)
- 仅在需要交互时使用`'use client'`指令
- 避免不必要的`useState`和`useEffect`
- 使用App Router的文件结构约定

### 组件开发模式
- 业务逻辑组件放在`components/`根目录
- UI基础组件放在`components/ui/`
- 每个功能模块有对应的`*-content.tsx`组件
- 组件内部使用一致的导入顺序：React -> UI组件 -> 图标 -> 业务组件

### 数据管理
- 站点配置通过`config/sites.ts`集中管理
- 模拟数据直接在组件内定义（如deviceStats, recentActivities）
- 使用TypeScript接口定义数据结构

## 常见开发任务

### 添加新的功能模块
1. 在`components/`下创建对应的`*-content.tsx`组件
2. 在`app/dashboard/page.tsx`的`navigationItems`中添加菜单项
3. 在`renderContent()`函数中添加对应的路由逻辑

### 修改站点配置
- 编辑`config/sites.ts`文件
- 更新`SITES`数组添加新站点
- 确保每个站点都有唯一的`id`和正确的`gatewayUrl`

### 样式定制
- 主题变量在`app/globals.css`中定义
- 使用shadcn/ui的组件变体系统
- 遵循TailwindCSS的实用类优先原则

### 添加新页面
1. 在`app/`对应目录下创建`page.tsx`
2. 如需要加载状态，创建`loading.tsx`
3. 确保页面支持服务端渲染(SSR)

## 项目特色功能

### 多站点架构
- 支持全球多个地区的站点配置
- 每个站点有独立的网关URL和区域信息
- 用户可以通过`SiteSelector`组件切换站点

### 仪表板系统
- 集成式仪表板，包含设备状态、用户管理、文件管理等模块
- 使用侧边栏导航进行模块切换
- 实时状态监控和活动记录

## 核心业务API参考

### 用户管理API
```typescript
// 获取当前用户信息
GET /user/current

// 用户CRUD操作
POST /user/add        // 创建用户
PUT /user/update      // 更新用户
DELETE /user/delete   // 删除用户
POST /user/move       // 移动用户组
```

### 组织架构API
```typescript
// 组织管理
GET /organization/list     // 组织列表
POST /organization/create  // 创建组织

// 用户组管理
GET /user-group/tree      // 用户组树形结构
POST /user-group/create   // 创建用户组

// 终端组管理
GET /terminal-group/tree  // 终端组树形结构
POST /terminal-group/create // 创建终端组
```

### 权限管理API
```typescript
// 角色管理
GET /role/list           // 角色列表
POST /role/assign        // 分配角色

// 权限管理
GET /permission/list     // 权限列表
POST /permission/grant   // 授予权限
DELETE /permission/revoke // 撤销权限
```

## 开发注意事项

### 安全注意事项
- 所有API请求都必须通过Gateway转发，不能直接访问微服务
- 前端不存储敏感信息，如Token、密码等
- 所有用户输入都必须进行校验和转义
- 遵循最小权限原则，只显示用户有权限的功能

### 性能优化
- 使用Next.js的SSR能力提升首屏加载速度
- 合理使用React Server Components减少客户端代码
- 使用虚拟列表处理大量数据展示
- 合理使用缓存机制减少不必要的API请求

### 用户体验
- 保持界面的一致性和简洁性
- 提供明确的加载状态和错误提示
- 优化移动端体验，确保触摸操作友好
- 支持键盘快捷键和无障碍访问

### 处理认证相关功能
- **登录功能**: 直接重定向到 `/oauth2/authorization/gateway-server`
- **登出功能**: 清理本地存储后重定向到登录页
- **权限检查**: 通过`/user/current`接口获取当前用户信息和权限
- **Token管理**: 由Gateway自动处理，前端无需关心

## MVP产品开发指导

根据.doc文件夹中的设计要点，MVP产品应该包含以下核心页面：

### 1. 🏢 组织管理控制台（管理员视角）
- 组织概览卡片（设备总数、在线设备、用户总数、告警数量）
- 组织架构管理（基于user_group和terminal_group的树形结构）
- 快速操作区（添加用户/部门、批量设备导入、权限模板配置）

### 2. 👥 用户权限管理页面
- 用户列表（基于current user API）
- 角色管理区域（系统预定义角色 + 自定义角色）
- 权限绑定控制台（UserGroup ↔ TerminalGroup绑定关系）

### 3. 📱 设备管理中心（核心业务页面）
- 设备总览dashboard（设备状态分布、地理位置分布、实时告警流）
- 设备组织架构（复用terminal_group的树形结构）
- 实时控制面板（单设备/批量控制、定时任务、场景模式）

### 4. 💬 消息通知中心
- 实时消息流（设备告警、任务通知、系统公告）
- 消息管理（消息模板、通知规则、推送渠道）
- 在线用户状态（用户在线状态、消息到达率）

### 5. 📁 素材管理
- 文件上传（拖拽式上传、批量上传）
- 文件浏览（文件夹树形结构）
- 转码管理（视频转码任务）
- 存储统计（存储使用情况）