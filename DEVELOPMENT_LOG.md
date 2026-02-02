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

- ~~Phase 1：实现自定义无边框标题栏（置顶、最小化、关闭）~~
- ~~Phase 2：集成 better-sqlite3 数据库~~
- Phase 3：实现待办管理 UI（分类列表、任务列表、输入框）

---

## 2026-02-02 Phase 1 & 2 完成

### Phase 1: 自定义无边框标题栏 ✅

#### 1. 主进程配置

- 修改 `src/main/index.ts`，启用 `frame: false` 去除原生标题栏
- 注册窗口控制 IPC 处理器：
  - `window:minimize` - 最小化窗口
  - `window:close` - 关闭窗口
  - `window:toggle-always-on-top` - 切换置顶状态
  - `window:always-on-top-changed` - 置顶状态变更通知

#### 2. TitleBar 组件实现

- 创建 `src/renderer/src/layout/TitleBar.vue`
- 实现功能：
  - 窗口拖拽区域（`-webkit-app-region: drag`）
  - 置顶按钮（📌）：点击切换置顶状态，有视觉反馈
  - 最小化按钮（➖）
  - 关闭按钮（✕）：hover 红色高亮
- 深色主题样式：`#2b2b2b` 背景，紧凑设计

#### 3. Preload API

- 扩展 `src/preload/index.ts`，暴露窗口控制 API
- 添加 TypeScript 类型定义 `src/preload/index.d.ts`

#### 4. 全局样式

- 更新 `src/renderer/src/styles/global.scss`
- 添加全局重置样式和基础主题配置

### Phase 2: 集成 better-sqlite3 数据库 ✅

#### 1. 依赖安装

```bash
pnpm add better-sqlite3
pnpm add -D @types/better-sqlite3
```

#### 2. 数据库模块

- 创建 `src/main/db/database.ts`
- 数据库位置：`AppData\Roaming\lf-todo\lite-todo.db`
- 表结构设计：

**Category 表**

- `id`: 主键
- `name`: 分类名称
- `order_index`: 排序权重
- `created_at`: 创建时间

**Task 表**

- `id`: 主键
- `content`: 任务内容
- `is_completed`: 完成状态 (0/1)
- `category_id`: 所属分类ID（外键）
- `order_index`: 排序权重
- `created_at`: 创建时间

#### 3. CRUD 封装

**Category 操作**

- `getAllCategories()` - 获取所有分类
- `createCategory(name)` - 创建分类
- `updateCategory(id, name)` - 更新分类
- `deleteCategory(id)` - 删除分类（级联删除关联任务）

**Task 操作**

- `getTasksByCategory(categoryId)` - 获取分类下的任务
- `createTask(content, categoryId)` - 创建任务
- `updateTask(id, updates)` - 更新任务
- `deleteTask(id)` - 删除任务
- `toggleTaskComplete(id)` - 切换完成状态

#### 4. IPC 集成

- 在 `src/main/index.ts` 中：
  - 初始化数据库（`app.whenReady`）
  - 注册所有数据库 IPC 处理器
  - 退出时关闭数据库连接
- 在 `src/preload/index.ts` 中暴露数据库 API
- 在 `src/renderer/src/db/index.ts` 中添加类型定义

#### 5. 测试指南

- 创建 `DATABASE_TEST.md`，提供完整的测试脚本
- 测试覆盖：CRUD、级联删除、数据持久化

### 技术亮点

1. **外键约束**：启用 SQLite 外键约束，支持级联删除
2. **类型安全**：完整的 TypeScript 类型定义
3. **IPC 架构**：清晰的主进程/渲染进程通信接口
4. **窗口拖拽**：使用 `-webkit-app-region` 实现自定义拖拽
5. **深色主题**：符合现代应用审美的 UI 设计

### 验证结果

- ✅ `pnpm dev` 正常启动
- ✅ 自定义标题栏显示正常
- ✅ 窗口拖拽功能正常
- ✅ 置顶/最小化/关闭按钮正常工作
- ✅ 数据库文件创建成功
- 🔄 待用户测试 CRUD 操作（见 DATABASE_TEST.md）
