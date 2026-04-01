---
date: '2026-04-01'
category: architecture
tags: [vue, pinia, async-action, optimistic-update, bootstrap]
severity: major
title: '在 Vue + Pinia 中先收口异步动作层，再给组件瘦身'
---

## 问题描述

前端重构时，如果组件直接承担启动逻辑、直接改 `props`，并且各个 store 自己散落着 `try/catch`、乐观更新和 fire-and-forget IPC，界面的状态就会越来越难预测。

## 根因分析

根因不是单一函数写得差，而是职责边界不清晰：

- 启动逻辑落在叶子组件里，导致 bootstrap 入口分散。
- 视图层把“展示计算”和“状态写回”混在一起，容易出现隐藏副作用。
- 写操作没有统一生命周期，缺少 pending、回滚和错误提示的共用模式。

## 解决方案

先补两层基础设施，再改组件：

- 新增 `useAppBootstrap`，把分类、任务和展开态初始化统一收回到 `App.vue`。
- 新增 `runAsyncAction`，统一处理 pending 标记、乐观更新、回滚、toast 和日志。
- 然后让 `task/subtask` store 接入这套动作层，再让 `TodoItem`/`SubTaskItem` 退回纯展示。

## 经验教训

> 如果目标是“可维护地重构 Vue 前端”，优先收口异步动作层和启动入口，组件瘦身会变得自然很多。

- 当组件里出现 “computed 里写数据” 时，优先把同步逻辑移回 store，而不是继续在组件里打补丁。
- 当多个 store 都开始写乐观更新时，尽快抽统一 action wrapper，不要复制 `try/catch + rollback` 模板。
- 删除、保存、排序这类动作只要有并发可能，就应该尽早暴露 pending 状态，避免用户重复触发。

## 相关文件

- `src/renderer/src/app/useAppBootstrap.ts`
- `src/renderer/src/services/runAsyncAction.ts`
- `src/renderer/src/store/task.ts`
- `src/renderer/src/store/subtask.ts`
- `src/renderer/src/components/TodoItem.vue`
- `src/renderer/src/components/TodoList.vue`
