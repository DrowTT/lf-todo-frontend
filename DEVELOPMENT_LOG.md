# 极简待办 (Lite-Todo) 开发日志

## 2026-02-02 项目底座搭建

### 完成内容

#### 1. 项目脚手架初始化

- 使用 `pnpm create @quick-start/electron --template vue-ts` 创建项目
- 技术栈：Electron + Vite + Vue 3 + TypeScript
- 启用 Electron 镜像代理加速下载

#### 2. 样式系统配置

- 安装 TailwindCSS v4 + Sass
- 安装 @tailwindcss/postcss 和 @tailwindcss/vite
- 配置 `postcss.config.js` 和 `tailwind.config.js`
- 创建全局样式入口 `src/renderer/src/styles/global.scss`

#### 3. 目录结构创建

```
src/renderer/src/
├── components/     # UI 组件（脚手架自带）
├── layout/         # 布局组件
│   ├── TitleBar.vue   # 标题栏骨架
│   └── layout.scss    # 布局样式
├── db/             # SQLite 封装层
│   └── index.ts       # 入口文件
└── styles/         # 全局样式
    └── global.scss    # Tailwind 入口
```

#### 4. 验证结果

- ✅ `pnpm dev` 正常启动
- ✅ Electron 窗口正常显示
- ✅ Vite 开发服务器运行在 localhost:5173

### 下一步工作

- Phase 1：实现自定义无边框标题栏（置顶、最小化、关闭）
- Phase 2：集成 better-sqlite3 数据库
