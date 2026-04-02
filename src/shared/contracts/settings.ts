import type { AutoCleanupConfig, PomodoroSessionState } from '../types/models'
import { expectBoolean } from './utils'
import { parseAutoCleanupConfig, parsePomodoroSessionState } from './entities'

export function parseBooleanSetting(value: unknown, label = 'enabled'): boolean {
  return expectBoolean(value, label)
}

export function parseSetAutoCleanupRequest(value: unknown, label = 'payload'): AutoCleanupConfig {
  return parseAutoCleanupConfig(value, label)
}

export function parseSetPomodoroActiveSessionRequest(
  value: unknown,
  label = 'payload'
): PomodoroSessionState | null {
  if (value === null) return null
  return parsePomodoroSessionState(value, label)
}
