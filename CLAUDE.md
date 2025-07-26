# CLAUDE.md

此文件为 Claude Code (claude.ai/code) 在此代码库中工作时提供指导。

## 项目概述

这是一个专注于 LED 显示屏内容管理的 **云平台** Next.js 应用程序。应用包括节目管理、文件管理（上传/存储/转码）、用户管理和调度功能。项目内置中文语言支持，采用云平台架构服务于 LED 显示屏内容管理。

## 关键开发命令

- **开发环境**: `npm run dev --turbopack` (使用 Turbo 提升构建速度)
- **构建**: `npm run build`
- **生产环境**: `npm start`
- **代码检查**: `npm run lint`

## 架构与技术栈

### 核心框架
- **Next.js 15.2.4** 使用 App Router 架构
- **React 19** 支持 TypeScript
- **Tailwind CSS v4** 样式框架，支持自定义 CSS 变量

### UI 组件库
- **shadcn/ui** 组件，基于 Radix UI 原语
- **Lucide React** 图标库
- `components.json` 组件配置：
  - New York 风格主题
  - 启用 RSC (React Server Components)
  - 路径别名: `@/components`, `@/lib`, `@/hooks`, `@/ui`

### 项目结构
```
app/
├── file-management/        # 文件上传、存储、转码
│   ├── storage/
│   ├── transcode/
│   └── upload/
├── program-management/     # LED 节目创建和发布
│   ├── create/
│   ├── publish/
│   └── schedule/
└── user-management/        # 用户管理

components/
├── ui/                     # shadcn/ui 组件
└── [feature]-content.tsx   # 页面特定内容组件
```

## 开发指南

### Next.js 约定 (来自 .cursor/rules)
- 使用 **App Router**，在路由目录中使用 `page.tsx` 文件
- 客户端组件必须在文件顶部明确标记 `'use client'`
- **优先使用服务端组件**: 最小化 `'use client'` 的使用
- 目录名使用 kebab-case，组件文件使用 PascalCase
- **优先使用命名导出**而非默认导出
- 用 `Suspense` 和 fallback UI 包装客户端组件
- 使用 React Server Actions 处理表单
- 使用 URL 搜索参数配合 `nuqs` 库管理可共享状态

### shadcn/ui 集成
- 组件已预配置 Tailwind CSS 变量
- 使用 MCP 服务器进行 shadcn 组件规划和实现
- 尽可能使用完整的组件块（如登录页面、日历）
- 实现新组件前务必查看演示工具用法

### 代码模式
- **状态管理**: 组件使用本地 useState，URL 参数用于可共享状态
- **样式**: 工具优先，使用 `lib/utils.ts` 中的 `cn()` 辅助函数 (clsx + tailwind-merge)
- **模拟数据**: 目前使用模拟数据数组进行开发（见组件文件）
- **图标**: 全应用使用 Lucide React 图标
- **国际化**: 中文语言支持（UI 文本为中文）

### 文件组织
- 路由特定内容组件位于 `/components/[feature]-content.tsx`
- 共享 UI 组件位于 `/components/ui/`
- 工具函数位于 `/lib/utils.ts`
- 自定义 hooks 位于 `/hooks/`
- 全局样式位于 `app/globals.css`

## 测试与质量
- ESLint 配置使用 Next.js 推荐规则
- 启用 TypeScript 严格模式
- 当前未配置测试框架 - 添加测试前请咨询用户