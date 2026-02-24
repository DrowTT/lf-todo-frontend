# lf-todo 项目评估报告：性能 & 用户体验

> 评估时间：2026-02-24 | 技术栈：Electron + Vue 3 + better-sqlite3 + Tailwind CSS

---

## 一、性能问题

### P1 ⚠️ Store 操作触发全量重绘（高优先级）

**问题定位**：[store/index.ts](file:///d:/playground/lf-todo/src/renderer/src/store/index.ts)

几乎所有写操作（`toggleTask`、`deleteTask`、`addTask`、`updateTaskContent`、`addSubTask` 等）执行后，都调用 `fetchTasks()` 重新拉取整个任务列表。在任务数量较多时会产生明显的 IPC 开销和 DOM 重绘。

```diff
// 当前：每次操作都全量重拉
async toggleTask(id: number) {
  await db.toggleTaskComplete(id)
- await this.fetchTasks()         // 全量重拉
- await this.fetchPendingCounts() // 再拉一次统计
}

// 建议：本地乐观更新 + 按需同步
async toggleTask(id: number) {
  // 1. 本地立即更新
  const task = this.tasks.find(t => t.id === id)
  if (task) task.is_completed = task.is_completed ? 0 : 1
  // 2. 同步更新 pendingCounts（本地计算即可，无需 IPC）
  this._updatePendingCountLocally()
  // 3. 后台持久化（不阻塞 UI）
  db.toggleTaskComplete(id)
}
```

**影响操作**：`toggleTask`、`deleteTask`、`updateTaskContent`、`addSubTask`、`toggleSubTask`、`deleteSubTask`

---

### P2 ⚠️ `getPendingTaskCounts` 触发时机过频（高优先级）

**问题定位**：[store/index.ts L112, L118, L127, L147](file:///d:/playground/lf-todo/src/renderer/src/store/index.ts#L112-L147)

`pendingCounts` 记录的是各分类的未完成任务数，完全可以**本地计算**（`tasks.filter()` 就能得到），却每次都发起一次独立 IPC 调用。

**建议**：将 `pendingCounts` 改为 `computed` 属性，或改用本地 `reduce` 聚合，避免额外 IPC 往返。

---

### P3 📌 `TodoList.vue` 模板内有内联计算（中优先级）

**问题定位**：[TodoList.vue L36](file:///d:/playground/lf-todo/src/renderer/src/components/TodoList.vue#L36)

```html
<!-- 当前：每次渲染都执行 filter -->
<span>{{ store.tasks.filter((t) => !t.is_completed).length }} 待办</span>
```

模板内直接调用 `filter()`，在 Vue 每次响应式更新时都会重新执行。应提取为 `computed`。

```ts
// 在 script setup 中
const pendingCount = computed(
  () => store.tasks.filter((t) => !t.is_completed).length,
);
```

---

### P4 📌 `subTaskProgress` 中存在重复的 `has()` 调用（低优先级）

**问题定位**：[TodoItem.vue L24-L34](file:///d:/playground/lf-todo/src/renderer/src/components/TodoItem.vue#L24-L34)

```ts
const subTaskProgress = computed(() => {
  if (store.expandedTaskIds.has(props.task.id) && store.subTasksMap[props.task.id]) {
    const list = store.subTasksMap[props.task.id] // 访问了两次 subTasksMap
```

可用解构提前取值减少重复查找，影响较小，但建议整洁。

---

### P5 📌 数据库 `deleteTasks` 使用循环逐条删除（中优先级）

**问题定位**：[database.ts L244-L251](file:///d:/playground/lf-todo/src/main/db/database.ts#L244-L251)

```ts
// 当前：逐条执行，虽在事务内，但循环 SQL 仍比一次 IN 查询慢
const deleteOne = db.prepare("DELETE FROM tasks WHERE id = ?");
const deleteBatch = db.transaction((taskIds) => {
  for (const id of taskIds) deleteOne.run(id);
});
```

**建议**：使用 `IN (?,?,?)` 一次性删除：

```ts
export function deleteTasks(ids: number[]): void {
  if (!db || ids.length === 0) return;
  const placeholders = ids.map(() => "?").join(",");
  db.prepare(`DELETE FROM tasks WHERE id IN (${placeholders})`).run(...ids);
}
```

---

### P6 📌 `adjustHeight` 函数在多个组件中重复定义（低优先级）

[TodoInput.vue](file:///d:/playground/lf-todo/src/renderer/src/components/TodoInput.vue)、[TodoItem.vue](file:///d:/playground/lf-todo/src/renderer/src/components/TodoItem.vue)、[SubTaskItem.vue](file:///d:/playground/lf-todo/src/renderer/src/components/SubTaskItem.vue) 三处均有完全相同的 `adjustHeight` 逻辑，建议提取为 `composable`：

```ts
// composables/useAutoResize.ts
export function useAutoResize(textareaRef: Ref<HTMLTextAreaElement | null>) {
  const adjustHeight = () => {
    const el = textareaRef.value;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  };
  return { adjustHeight };
}
```

---

## 二、用户体验问题

### UX1 ❌ 危险操作（删除）无需确认（高优先级）

**问题定位**：[TodoItem.vue L40-L42](file:///d:/playground/lf-todo/src/renderer/src/components/TodoItem.vue#L40-L42)、[SubTaskItem.vue L20-L22](file:///d:/playground/lf-todo/src/renderer/src/components/SubTaskItem.vue#L20-L22)

单个任务的删除按钮直接调用 `store.deleteTask(id)`，没有任何确认提示。已有 `useConfirm` composable，但只在"清空已完成"时使用了。

**建议**：单任务删除也应接入 `useConfirm`，或采用删除后 **Undo（撤销）** 提示条的设计（更符合现代 UX）。

---

### UX2 ⚠️ `alert()` 用于校验错误提示（高优先级）

**问题定位**：[TodoInput.vue L19](file:///d:/playground/lf-todo/src/renderer/src/components/TodoInput.vue#L19)

```ts
alert("请先选择一个分类");
```

原生 `alert()` 会阻断主进程，外观与整体深色主题割裂。建议替换为内联 Toast / Snackbar 提示，或直接在 UI 层隐藏该按钮（未选分类时 `TodoInput` 本来就不渲染，这行代码实际上**永远不会执行**，是死代码）。

---

### UX3 ⚠️ 没有任何加载/等待状态反馈（高优先级）

所有异步操作（切换分类、添加任务等）期间，UI 无任何 loading 状态。若 IPC 延迟（如磁盘繁忙），用户会以为操作没响应，进而重复点击。

**建议**：store 中增加 `isLoading: boolean` 标志位，在关键操作时显示 spinner 或禁用输入框。

---

### UX4 📌 编辑模式下 `blur` 会自动保存（可能误触发）

**问题定位**：[TodoItem.vue L114](file:///d:/playground/lf-todo/src/renderer/src/components/TodoItem.vue#L114)、[SubTaskItem.vue L88](file:///d:/playground/lf-todo/src/renderer/src/components/SubTaskItem.vue#L88)

```html
@blur="saveEdit"
```

当用户**误触编辑**（双击后立即想取消）、或切换到其他窗口再切换回来时，`blur` 会静默保存。建议区分意图：`Enter` 主动保存，`Escape` 取消，`blur` 只在内容有变化时才保存，无变化则视为取消。

当前 `saveEdit` 内有 `trimmed !== props.task.content` 判断，可以提升去：**`blur` 时若内容未改变，直接 `cancelEdit()`，不走 `updateTask` IPC**。

---

### UX5 📌 空状态文案缺乏引导性（中优先级）

**问题定位**：[TodoList.vue L55-L58](file:///d:/playground/lf-todo/src/renderer/src/components/TodoList.vue#L55-L58)

```html
<div>请选择或创建一个分类</div>
<div>暂无任务,快去添加一个吧~</div>
```

纯文字空状态，没有图标或操作引导。建议配合简单 SVG 插画 + 操作按钮（如"点击 + 新建分类"箭头指向侧边栏）。

---

### UX6 📌 `CategoryList` 缺乏拖拽排序能力（中优先级）

数据库字段 `order_index` 已存在，但 UI 上没有提供拖拽排序功能。分类顺序一旦建立便无法调整，影响长期使用。

**建议**：集成 `@vueuse/integrations` 中的 `useSortable` 或轻量的 `sortablejs`，实现侧边栏拖拽排序，写入 `order_index`。

---

### UX7 📌 `TodoItem` 的展开按钮始终渲染，即使没有子任务（低优先级）

**问题定位**：[TodoItem.vue L127-L146](file:///d:/playground/lf-todo/src/renderer/src/components/TodoItem.vue#L127-L146)

展开按钮对所有任务都显示（hover 时），即使 `subtask_total === 0`，带来视觉噪音。建议 `v-if="subTaskProgress || isExpanded"` 控制按钮可见性。

---

### UX8 📌 缺少快捷键支持（低优先级）

- 没有新建分类的快捷键
- `Ctrl+Enter` 或 `Cmd+Enter` 没有全局快捷键快速添加任务
- 没有 `Del` / `Backspace` 删除选中任务的支持

---

### UX9 📌 TitleBar 的窗口控制按钮使用 emoji（低优先级）

**问题定位**：[TitleBar.vue L13, L20, L23](file:///d:/playground/lf-todo/src/renderer/src/layout/TitleBar.vue#L13-L23)

```html
📌 ➖ ✕
```

Emoji 渲染受系统字体影响，在不同平台/字体下显示尺寸不一致。建议替换为 SVG 图标保证一致性。

---

## 三、优先级汇总

| 优先级 | 问题                        | 类型       |
| ------ | --------------------------- | ---------- |
| 🔴 高  | P1 全量 `fetchTasks` 重绘   | 性能       |
| 🔴 高  | P2 `pendingCounts` 冗余 IPC | 性能       |
| 🔴 高  | UX1 单条删除无确认          | 用户体验   |
| 🔴 高  | UX2 `alert()` 阻断式提示    | 用户体验   |
| 🔴 高  | UX3 无 loading 状态         | 用户体验   |
| 🟡 中  | P3 模板内联 `filter`        | 性能       |
| 🟡 中  | P5 循环删除 SQL             | 性能       |
| 🟡 中  | UX4 `blur` 误保存           | 用户体验   |
| 🟡 中  | UX5 空状态无引导            | 用户体验   |
| 🟡 中  | UX6 缺拖拽排序              | 用户体验   |
| 🟢 低  | P4 重复 `has()`             | 性能       |
| 🟢 低  | P6 `adjustHeight` 重复代码  | 可维护性   |
| 🟢 低  | UX7 无用展开按钮            | 用户体验   |
| 🟢 低  | UX8 缺快捷键                | 用户体验   |
| 🟢 低  | UX9 Emoji 按钮              | 视觉一致性 |
