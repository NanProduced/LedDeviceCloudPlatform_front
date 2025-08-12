## 前端项目介绍（cloudplatform）

> 本文面向本项目前端开发与测试同学，概述技术栈、目录结构、运行方式、环境与代理、认证机制、API 调用规范、WebSocket、UI 规范、核心页面、编码约定与调试要点。

### 一、项目简介

LED 云平台前端采用 Next.js App Router 架构，提供设备管理、素材/文件管理、节目编辑与发布、消息通知、监控与运营等功能模块，统一经网关进行认证与权限校验，前端以 SPA 交互为主，保证体验与性能。

### 二、技术栈

- **框架**: Next.js 15（App Router）
- **语言**: TypeScript（strict=true）
- **前端库**: React 19
- **样式**: TailwindCSS v4（全局样式位于 `app/globals.css`）
- **UI 组件**: shadcn/ui + Ant Design（消息提示等）
- **状态管理**: React Context（用户、WebSocket），Zustand（节目编辑器等）
- **网络**: 原生 fetch 封装（`lib/api.ts`）
- **WebSocket**: STOMP（`@stomp/stompjs`）

依赖与脚本见 `package.json`：

```startLine:5:endLine:16:package.json
  "scripts": {
    "dev": "next dev -H 192.168.1.222",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
```

### 三、目录结构（摘）

- `app/`：App Router 页面与布局（如 `app/login`、`app/dashboard` 及其子模块）
- `components/`：通用与业务组件（含 `components/ui` 的 shadcn 组件）
- `contexts/`：全局上下文（用户、WebSocket 等）
- `lib/`：API、类型、工具、WebSocket 管理等
- `config/`：站点与认证配置
- `public/`：静态资源
- `.doc/`：项目文档与接口说明

### 四、运行与构建

1) 安装依赖：`npm install`
2) 本地开发：`npm run dev`（默认绑定 `192.168.1.222` 主机）
3) 生产构建：`npm run build`，启动：`npm start`

建议 Node.js 版本 18+。开发时请确保本机可访问网关 `http://192.168.1.222:8082`。

### 五、环境与代理（网关转发）

所有 API 必须经网关统一入口，并通过 Next.js rewrites 进行本地开发代理，避免 CORS 问题：

```startLine:4:endLine:18:next.config.js
  // 配置代理，解决CORS问题
  async rewrites() {
    return [
      { source: '/core/api/:path*', destination: 'http://192.168.1.222:8082/core/api/:path*' },
      { source: '/auth/api/:path*', destination: 'http://192.168.1.222:8082/auth/api/:path*' },
      { source: '/message/api/:path*', destination: 'http://192.168.1.222:8082/message/api/:path*' },
      { source: '/file/api/:path*', destination: 'http://192.168.1.222:8082/file/api/:path*' },
      { source: '/oauth2/:path*', destination: 'http://192.168.1.222:8082/oauth2/:path*' },
    ];
  },
```

前端请求统一使用相对路径（如 `/core/api/...`），由 Next.js 开发服务器转发至网关。

### 六、认证与会话

- 网关统一处理 OAuth2 认证与权限（Casbin）。前端以 Cookie 认证为主。
- 登录通过授权端点发起重定向，并携带回跳地址 `redirect_uri`：

```startLine:24:endLine:49:config/auth.ts
// 认证相关端点
export const getAuthEndpoints = () => ({
  authorize: `/oauth2/authorization/gateway-server`,
  userInfo: `/api/user/info`,
  logout: `/logout`
});

export const login = (redirectUri: string = "/dashboard") => {
  const endpoints = getAuthEndpoints();
  const fullRedirectUri = window.location.origin + redirectUri;
  const authUrl = `${endpoints.authorize}?redirect_uri=${encodeURIComponent(fullRedirectUri)}`;
  window.location.href = authUrl;
};
```

登录页会检测是否已有认证 Cookie 并自动跳转仪表盘：

```startLine:53:endLine:71:app/login/page.tsx
  useEffect(() => {
    const checkCookies = () => {
      if (document.cookie) {
        const hasCookies = document.cookie.split(';').some(c => {
          const name = c.trim().split('=')[0].toLowerCase();
          return name.includes('auth') || name.includes('token') || name.includes('session') || name === 'jsessionid';
        });
        if (hasCookies) {
          setTimeout(() => { router.push('/dashboard'); }, 1000);
        }
      }
    };
    checkCookies();
  }, [router]);
```

### 七、API 调用规范与示例

- 统一使用 `lib/api.ts` 的 `fetchApi`/`api` 封装，请求自动携带 Cookie（`credentials: 'include'`），并对通用响应结构进行解包（优先返回 `data` 或 `result` 字段）。

```startLine:11:endLine:22:lib/api.ts
export async function fetchApi(path: string, options: RequestInit = {}) {
  const defaultOptions: RequestInit = {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers },
  };
  const mergedOptions = { ...defaultOptions, ...options };
  // ...
```

```startLine:64:endLine:86:lib/api.ts
// 处理统一的API响应结构
if (responseData && typeof responseData === 'object') {
  if ('code' in responseData) {
    if (responseData.code !== 0 && responseData.code !== 200) {
      throw new Error(responseData.msg || `API错误: 代码 ${responseData.code}`);
    }
  }
  if ('data' in responseData) return responseData.data;
  if ('result' in responseData) return responseData.result;
}
```

获取当前登录用户信息：

```startLine:127:endLine:134:lib/api.ts
export const userApi = {
  getCurrentUser: async () => {
    try {
      return await fetchApi(`${CORE_API_PREFIX}/user/current`);
    } catch (error) {
      throw error;
    }
  },
}
```

文件上传走文件服务前缀 `/file/api`，采用 `FormData`（避免 JSON Content-Type）：

```startLine:70:endLine:82:lib/api/fileUpload.ts
const response = await fetch('/file/api/file/upload/single', {
  method: 'POST',
  credentials: 'include',
  body: formData
})
const responseData = await response.json()
```

### 八、WebSocket（消息与通知）

- 使用 STOMP over WebSocket，默认地址可通过环境变量覆盖：

```startLine:37:endLine:45:app/layout.tsx
<WebSocketProvider 
  config={{
    brokerURL: process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://192.168.1.222:8082/message-service/ws',
    reconnectDelay: 3000,
    maxReconnectAttempts: 5,
    debug: process.env.NODE_ENV === 'development',
  }}
```

- Provider 自动根据用户登录状态连接/断开，并在连接成功后恢复订阅；同时在右下角展示连接状态与 `Toaster` 提示。

```startLine:49:endLine:53:app/layout.tsx
<div style={{ position: 'fixed', right: 8, bottom: 8, zIndex: 50 }}>
  <ConnectionStatus mode="icon" />
</div>
<Toaster />
```

### 九、UI 与交互规范

- 优先使用 `components/ui` 下的 shadcn 组件，风格 `new-york`；搭配 Tailwind 实现布局与响应式。
- Ant Design 主要用于全局消息与提示（如 `message`）。
- 应用框架：顶部固定导航 + 左侧固定侧边栏，右侧内容区随路由切换更新（保持 SPA 体验）。

### 十、核心页面与模块（选摘）

- 登录：`app/login/page.tsx`（语言切换、授权跳转）
- 仪表盘布局：`app/dashboard/layout.tsx`（应用壳：`components/LEDPlatformApp`）
- 用户与会话：`contexts/UserContext.tsx`（首屏拉取当前用户）
- WebSocket：`contexts/WebSocketContext.tsx` + `components/websocket/*`
- 业务页：`app/dashboard/*`（如设备、文件、节目、发布、角色、用户、通知、消息）
- 节目编辑器：`components/program-editor/*`（状态管理使用 Zustand）

### 十一、编码规范与约定

- TypeScript 严格模式；模块解析 `bundler`；路径别名：`@/*`。

```startLine:2:endLine:7:tsconfig.json
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
```

- 组件尽量保持单一职责；提取通用逻辑到 `lib/` 或独立 hooks。
- API 路径统一使用相对路径，并遵循服务前缀：`/core/api`、`/auth/api`、`/message/api`、`/file/api`。
- 所有请求默认携带凭据（Cookie），禁止直接拼接网关绝对地址。

### 十二、调试与故障定位

- 本地代理：确认 `next.config.js` rewrites 生效。
- 网络日志：`fetchApi` 在开发环境会输出请求/响应日志，可设置 `NEXT_PUBLIC_API_DELAY` 模拟网络延迟。
- WebSocket 调试：开发模式下可启用详细日志与调试浮层（`WebSocketProvider` 内部已集成）。
- 鉴权问题：若遇 401/403，确认浏览器 Cookie、网关登录状态与回跳地址是否正确。

### 十三、环境变量（可选）

- `NEXT_PUBLIC_WEBSOCKET_URL`：覆盖默认 WS 地址（如 `ws://<gateway>/message-service/ws`）
- `NEXT_PUBLIC_API_DELAY`：开发环境下为请求增加延迟（毫秒），便于观察加载状态

---

如需补充模块级文档或 API 清单，请在 `.doc/` 目录新增相应说明，并在 `README.md` 关联入口。

