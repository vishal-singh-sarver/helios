import type { CreateProjectResponse } from './types'

// Dev-only in-memory mock backend for projects, backed by localStorage so
// records survive page reloads. Delete this entire file when the real
// backend is wired up — service.ts will switch to api.post/get/delete and
// stop importing from here.

const STORAGE_KEY = 'helios:mock:projects'

export type StoredProject = CreateProjectResponse & { createdAt: number }

function read(): StoredProject[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as StoredProject[]) : []
  } catch {
    return []
  }
}

function write(projects: StoredProject[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects))
}

export const mockProjectStore = {
  list(): StoredProject[] {
    return read()
  },

  findByName(name: string): StoredProject | undefined {
    const needle = name.trim().toLowerCase()
    return read().find((p) => p.name.toLowerCase() === needle)
  },

  insert(project: StoredProject): void {
    write([...read(), project])
  },

  remove(projectId: string): boolean {
    const projects = read()
    const next = projects.filter((p) => p.project_id !== projectId)
    if (next.length === projects.length) return false
    write(next)
    return true
  },

  clear(): void {
    localStorage.removeItem(STORAGE_KEY)
  }
}
