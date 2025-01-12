# CelesteTalk

社交互动平台前端，基于 Next.js 14 + React + Shadcn/ui 构建。

## 目录结构

```
src/
├── app/                     # Next.js 应用主目录
│   ├── (auth)/             # 认证相关路由组
│   │   ├── login/          # 登录页面
│   │   ├── register/       # 注册页面
│   │   └── layout.tsx      # 认证页面布局
│   ├── (main)/             # 主要功能路由组
│   │   ├── feed/          # 动态消息流
│   │   ├── profile/       # 个人资料
│   │   ├── post/          # 帖子详情
│   │   └── layout.tsx     # 主页面布局
│   └── layout.tsx          # 根布局
├── components/             # 组件目录
│   ├── ui/                # UI组件(Shadcn)
│   │   ├── button/       # 按钮组件
│   │   ├── input/        # 输入框组件
│   │   └── card/         # 卡片组件
│   ├── forms/             # 表单组件
│   │   ├── login-form/   # 登录表单
│   │   └── post-form/    # 发帖表单
│   ├── posts/             # 帖子相关组件
│   │   ├── post-card/    # 帖子卡片
│   │   └── post-list/    # 帖子列表
│   └── shared/            # 共享组件
│       ├── header/       # 顶部导航
│       └── sidebar/      # 侧边栏
├── lib/                   # 工具库
│   ├── utils.ts          # 通用工具函数
│   ├── axios-config.ts   # Axios配置和拦截器
│   └── constants.ts      # 常量定义
├── types/                 # 类型定义
│   ├── post.ts           # 帖子相关类型
│   └── user.ts           # 用户相关类型
├── hooks/                 # 自定义Hook
│   ├── use-auth.ts       # 认证相关Hook
│   ├── use-posts.ts      # 帖子相关Hook
│   └── use-infinite.ts   # 无限滚动Hook
├── services/             # API服务封装
│   ├── auth.ts          # 认证相关API
│   ├── posts.ts         # 帖子相关API
│   └── users.ts         # 用户相关API
└── styles/               # 样式文件
    └── globals.css       # 全局样式
```

## 主要功能模块

1. 用户界面

   - 响应式设计
   - 深色/浅色主题
   - 无限滚动加载
   - 动态交互效果

2. 帖子功能

   - 发布帖子
   - 图片上传
   - 富文本编辑
   - 实时预览

3. 用户交互
   - 点赞/收藏
   - 评论回复
   - 用户关注
   - 消息通知

## 技术栈

- Next.js 14
- React
- Shadcn/ui
- TanStack Query (数据请求和缓存)
- Axios (HTTP 客户端)
- Zustand (状态管理)
- React Hook Form (表单处理)
- Zod (数据验证)
