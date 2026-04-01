import { onMounted, ref } from 'vue'
import { useCategoryStore } from '../store/category'
import { useSubTaskStore } from '../store/subtask'
import { useTaskStore } from '../store/task'

async function bootstrapRuntimeFeatures() {
  await Promise.all([
    Promise.resolve(), // Reserved for settings bootstrap.
    Promise.resolve(), // Reserved for updater bootstrap.
    Promise.resolve() // Reserved for draft recovery.
  ])
}

export function useAppBootstrap() {
  const categoryStore = useCategoryStore()
  const taskStore = useTaskStore()
  const subTaskStore = useSubTaskStore()

  const hasBootstrapped = ref(false)
  const isBootstrapping = ref(false)

  onMounted(async () => {
    if (hasBootstrapped.value) return

    isBootstrapping.value = true

    try {
      const hasCurrentCategory = await categoryStore.fetchCategories()
      await taskStore.initPendingCounts()

      if (hasCurrentCategory && categoryStore.currentCategoryId) {
        await taskStore.fetchTasks(categoryStore.currentCategoryId)
        subTaskStore.loadExpandedForCategory(categoryStore.currentCategoryId)
        await subTaskStore.fetchExpandedSubTasks(subTaskStore.expandedTaskIds)
      } else {
        taskStore.clearTasks()
        subTaskStore.reset()
      }

      await bootstrapRuntimeFeatures()
      hasBootstrapped.value = true
    } catch (error) {
      console.error('[appBootstrap] bootstrap failed', error)
    } finally {
      isBootstrapping.value = false
    }
  })

  return {
    isBootstrapping
  }
}
