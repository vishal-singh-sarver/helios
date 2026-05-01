// Centralized localStorage keys. Anything written or read across the
// renderer should go through these constants — searching for the literal
// string and finding it in only one place keeps cross-feature wiring
// auditable.
export const STORAGE_KEYS = {
  activeProjectId: 'helios:activeProjectId',
  activeScenarioId: 'helios:activeScenarioId'
} as const

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS]
