import { useCategoryStore } from './category'
import { useSubTaskStore } from './subtask'
import { useTaskStore } from './task'

export const store = {
  get categories() {
    return useCategoryStore().categories
  },
  get currentCategoryId() {
    return useCategoryStore().currentCategoryId
  },
  get tasks() {
    return useTaskStore().tasks
  },
  get isLoading() {
    return useTaskStore().isLoading
  },
  get pendingCounts() {
    return useTaskStore().pendingCounts
  },
  get subTasksMap() {
    return useSubTaskStore().subTasksMap
  },
  get expandedTaskIds() {
    return useSubTaskStore().expandedTaskIds
  },

  async fetchCategories() {
    const categoryStore = useCategoryStore()
    const taskStore = useTaskStore()

    await categoryStore.fetchCategories()
    await taskStore.initPendingCounts()

    if (categoryStore.currentCategoryId) {
      await this.fetchTasks()
    }
  },

  async addCategory(name: string) {
    await useCategoryStore().addCategory(name)

    if (useCategoryStore().currentCategoryId) {
      await this.fetchTasks()
    }
  },

  async deleteCategory(id: number) {
    useTaskStore().removePendingCount(id)
    await useCategoryStore().deleteCategory(id)

    if (useCategoryStore().currentCategoryId) {
      await this.fetchTasks()
    } else {
      useTaskStore().clearTasks()
      useSubTaskStore().reset()
    }
  },

  async updateCategory(id: number, name: string) {
    await useCategoryStore().updateCategory(id, name)
  },

  async selectCategory(id: number) {
    useCategoryStore().selectCategory(id)
    useSubTaskStore().reset()
    await this.fetchTasks()
  },

  async fetchTasks() {
    const categoryId = useCategoryStore().currentCategoryId
    const taskStore = useTaskStore()
    const subTaskStore = useSubTaskStore()

    if (!categoryId) {
      taskStore.clearTasks()
      subTaskStore.reset()
      return
    }

    await taskStore.fetchTasks(categoryId)
    subTaskStore.loadExpandedForCategory(categoryId)
    await subTaskStore.fetchExpandedSubTasks(subTaskStore.expandedTaskIds)
  },

  async addTask(content: string) {
    const categoryId = useCategoryStore().currentCategoryId
    if (!categoryId) return false

    return useTaskStore().addTask(content, categoryId)
  },

  async toggleTask(id: number) {
    const categoryId = useCategoryStore().currentCategoryId
    if (!categoryId) return false

    return useTaskStore().toggleTask(id, categoryId)
  },

  async deleteTask(id: number) {
    const categoryId = useCategoryStore().currentCategoryId
    if (!categoryId) return false

    const deleted = await useTaskStore().deleteTask(id, categoryId)
    if (deleted) {
      useSubTaskStore().removeTask(id, categoryId)
    }

    return deleted
  },

  async updateTaskContent(id: number, content: string) {
    return useTaskStore().updateTaskContent(id, content)
  },

  async clearCompletedTasks() {
    const categoryId = useCategoryStore().currentCategoryId
    const completedIds = await useTaskStore().clearCompletedTasks()

    if (completedIds && categoryId) {
      useSubTaskStore().removeCompletedTasks(completedIds, categoryId)
    }

    return completedIds
  },

  async reorderTasks(previousOrderedIds: number[]) {
    return useTaskStore().reorderTasks(previousOrderedIds)
  },

  async fetchSubTasks(parentId: number) {
    await useSubTaskStore().fetchSubTasks(parentId)
  },

  async toggleExpand(taskId: number) {
    const categoryId = useCategoryStore().currentCategoryId
    if (!categoryId) return false

    return useSubTaskStore().toggleExpand(taskId, categoryId)
  },

  async addSubTask(content: string, parentId: number) {
    return useSubTaskStore().addSubTask(content, parentId)
  },

  async toggleSubTask(id: number, parentId: number) {
    return useSubTaskStore().toggleSubTask(id, parentId)
  },

  async deleteSubTask(id: number, parentId: number) {
    return useSubTaskStore().deleteSubTask(id, parentId)
  },

  async updateSubTaskContent(id: number, parentId: number, content: string) {
    return useSubTaskStore().updateSubTaskContent(id, parentId, content)
  }
}
