# 数据库功能测试指南

## 测试步骤

1. 启动应用：`pnpm dev`
2. 按 `F12` 打开 DevTools
3. 在 Console 中依次执行以下测试代码

## 测试脚本

### 1. 测试创建分类

```javascript
// 创建两个分类
const cat1 = await window.api.db.createCategory('工作')
const cat2 = await window.api.db.createCategory('生活')
console.log('创建的分类:', cat1, cat2)
```

### 2. 测试获取所有分类

```javascript
const categories = await window.api.db.getCategories()
console.log('所有分类:', categories)
```

### 3. 测试创建任务

```javascript
// 假设第一个分类的 ID 是 1
const task1 = await window.api.db.createTask('完成项目文档', 1)
const task2 = await window.api.db.createTask('准备周会汇报', 1)
const task3 = await window.api.db.createTask('购买日用品', 2)
console.log('创建的任务:', task1, task2, task3)
```

### 4. 测试获取任务列表

```javascript
// 获取第一个分类的任务
const tasks = await window.api.db.getTasks(1)
console.log('分类 1 的任务:', tasks)
```

### 5. 测试切换任务完成状态

```javascript
// 假设第一个任务的 ID 是 1
await window.api.db.toggleTaskComplete(1)
console.log('已切换任务 1 的完成状态')

// 验证状态变更
const updatedTasks = await window.api.db.getTasks(1)
console.log('更新后的任务列表:', updatedTasks)
```

### 6. 测试更新任务内容

```javascript
await window.api.db.updateTask(1, { content: '完成项目文档（已修改）' })
console.log('已更新任务 1 的内容')

// 验证更新
const tasks = await window.api.db.getTasks(1)
console.log('更新后的任务列表:', tasks)
```

### 7. 测试删除任务

```javascript
await window.api.db.deleteTask(1)
console.log('已删除任务 1')

// 验证删除
const tasks = await window.api.db.getTasks(1)
console.log('删除后的任务列表:', tasks)
```

### 8. 测试级联删除（删除分类同时删除关联任务）

```javascript
await window.api.db.deleteCategory(1)
console.log('已删除分类 1（及其所有任务）')

// 验证级联删除
const categories = await window.api.db.getCategories()
console.log('删除后的分类列表:', categories)
```

## 预期结果

- 所有操作应无报错
- 数据持久化：关闭应用后重新打开，数据仍然存在
- 级联删除：删除分类时，关联的任务也会被删除

## 数据库文件位置

Windows: `C:\Users\<用户名>\AppData\Roaming\lf-todo\lite-todo.db`

可使用 SQLite 工具（如 DB Browser for SQLite）查看数据库内容。
