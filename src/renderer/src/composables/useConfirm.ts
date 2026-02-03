import { ref } from 'vue'

interface ConfirmState {
  visible: boolean
  message: string
  resolve: ((value: boolean) => void) | null
}

const state = ref<ConfirmState>({
  visible: false,
  message: '',
  resolve: null
})

export function useConfirm() {
  const confirm = (message: string): Promise<boolean> => {
    return new Promise((resolve) => {
      state.value = {
        visible: true,
        message,
        resolve
      }
    })
  }

  const handleConfirm = () => {
    if (state.value.resolve) {
      state.value.resolve(true)
    }
    state.value.visible = false
    state.value.resolve = null
  }

  const handleCancel = () => {
    if (state.value.resolve) {
      state.value.resolve(false)
    }
    state.value.visible = false
    state.value.resolve = null
  }

  return {
    state,
    confirm,
    handleConfirm,
    handleCancel
  }
}
