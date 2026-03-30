const STORAGE_KEY = 'lf-todo:pro-status'

export interface PersistedProStatus {
  isPro: boolean
  syncedAt: number
}

export function loadPersistedProStatus(): PersistedProStatus | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as PersistedProStatus
  } catch {
    return null
  }
}

export function savePersistedProStatus(status: PersistedProStatus) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(status))
}

export function clearPersistedProStatus() {
  localStorage.removeItem(STORAGE_KEY)
}
