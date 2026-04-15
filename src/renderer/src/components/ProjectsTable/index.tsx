import React, { useState } from 'react'
import EmptyState from '../EmptyState'
import type { RecentProjectItem } from '../../containers/HomePage/types'

interface ProjectsTableProps {
  projects: RecentProjectItem[]
  emptyIcon: string
  onCreateNew: () => void
}

type SortKey = 'name' | 'last_updated' | 'size'
type SortOrder = 'asc' | 'desc'

const COLUMN_LABELS: Record<SortKey, string> = {
  name: 'Name',
  last_updated: 'Last Updated',
  size: 'Size'
}

function formatBytes(bytes: number): string {
  if (!bytes) return '—'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let value = bytes
  let unitIndex = 0
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024
    unitIndex += 1
  }
  return `${value.toFixed(value >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`
}

function formatTimestamp(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleString()
}

function ProjectsTable({ projects, emptyIcon, onCreateNew }: ProjectsTableProps): React.JSX.Element {
  const [sortKey, setSortKey] = useState<SortKey>('last_updated')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')

  const handleSort = (key: SortKey): void => {
    if (key === sortKey) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortOrder('asc')
    }
  }

  const sortedProjects = React.useMemo(() => {
    const copy = [...projects]
    copy.sort((a, b) => {
      if (sortKey === 'size') {
        return sortOrder === 'asc' ? a.size - b.size : b.size - a.size
      }
      if (sortKey === 'last_updated') {
        return sortOrder === 'asc'
          ? new Date(a.last_updated).getTime() - new Date(b.last_updated).getTime()
          : new Date(b.last_updated).getTime() - new Date(a.last_updated).getTime()
      }
      if (a.name < b.name) return sortOrder === 'asc' ? -1 : 1
      if (a.name > b.name) return sortOrder === 'asc' ? 1 : -1
      return 0
    })
    return copy
  }, [projects, sortKey, sortOrder])

  const getArrow = (key: SortKey): string => {
    if (key !== sortKey) return '↑↓'
    return sortOrder === 'asc' ? '↑' : '↓'
  }

  return (
    <>
      <h1 className="mb-6 text-lg font-medium text-white">Recent Projects</h1>

      <div className="overflow-hidden rounded border border-app-border bg-panel/20">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-app-border">
              {(['name', 'last_updated', 'size'] as SortKey[]).map((key) => (
                <th
                  key={key}
                  scope="col"
                  className={`px-4 py-2 text-left text-sm font-normal text-neutral-400 ${
                    key === 'size' ? 'w-[20%]' : 'w-[40%]'
                  }`}
                >
                  <button
                    onClick={() => handleSort(key)}
                    className="flex items-center gap-1 hover:text-white"
                  >
                    {COLUMN_LABELS[key]}
                    <span aria-hidden="true">{getArrow(key)}</span>
                  </button>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {sortedProjects.length === 0 ? (
              <tr>
                <td colSpan={3}>
                  <EmptyState icon={emptyIcon} onCreateNew={onCreateNew} />
                </td>
              </tr>
            ) : (
              sortedProjects.map((project) => (
                <tr
                  key={project.id}
                  className="border-b border-app-border/80 hover:bg-panel/40"
                >
                  <td className="px-4 py-3 text-sm text-white">{project.name}</td>
                  <td className="px-4 py-3 text-sm text-neutral-400">
                    {formatTimestamp(project.last_updated)}
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-300">
                    {formatBytes(project.size)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}

export default ProjectsTable
