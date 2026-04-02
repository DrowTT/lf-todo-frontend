export interface Category {
  id: number
  name: string
  order_index: number
  created_at: number
}

export interface Task {
  id: number
  content: string
  is_completed: boolean
  category_id: number
  order_index: number
  created_at: number
  parent_id: number | null
  subtask_total: number
  subtask_done: number
}

export type TaskUpdate = Partial<Pick<Task, 'content' | 'is_completed' | 'order_index'>>

export interface AutoCleanupConfig {
  enabled: boolean
  days: number
}

export interface PomodoroTaskBinding {
  taskId: number | null
  taskContentSnapshot: string | null
}

export interface PomodoroSessionState extends PomodoroTaskBinding {
  startedAt: number
  endsAt: number
  durationSeconds: number
  source: 'global' | 'task'
}

export interface PomodoroRecord extends PomodoroTaskBinding {
  id: string
  completedAt: number
  durationSeconds: number
  source: 'global' | 'task'
}

export interface PomodoroData {
  focusDurationSeconds: number
  totalCompletedCount: number
  activeSession: PomodoroSessionState | null
  history: PomodoroRecord[]
}

export interface SettingsData {
  autoLaunch: boolean
  closeToTray: boolean
  autoCleanup: AutoCleanupConfig
  pomodoro: PomodoroData
}

export interface AppInfo {
  name: string
  version: string
  electron: string
  chrome: string
  node: string
}

export type UpdateStatusData =
  | { status: 'checking' }
  | { status: 'available'; version: string; releaseNotes?: string }
  | { status: 'not-available' }
  | {
      status: 'downloading'
      percent: number
      bytesPerSecond: number
      transferred: number
      total: number
    }
  | { status: 'downloaded'; version: string }
  | { status: 'error'; message: string }
