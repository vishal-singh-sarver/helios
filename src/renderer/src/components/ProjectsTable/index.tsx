import React, { useState } from 'react'
import EmptyState from '../EmptyState'
import { ProjectRecord } from '../../types/project'

interface ProjectsTableProps {
  projects: ProjectRecord[]
  emptyIcon: string
  onCreateNew: () => void
}

type SortKey = 'name' | 'lastUpdated' | 'size'
type SortOrder = 'asc' | 'desc'

const COLUMN_LABELS: Record<SortKey, string> = {
  name: 'Name',
  lastUpdated: 'Last Updated',
  size: 'Size'
}

function ProjectsTable({ projects, emptyIcon, onCreateNew }: ProjectsTableProps): React.JSX.Element {
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')

  const handleSort = (key: SortKey): void => {
    if (key === sortKey) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortOrder('asc')
    }
  }

  const sortedProjects = [...projects].sort((a, b) => {
    let aValue: string | number = a[sortKey]
    let bValue: string | number = b[sortKey]

    if (sortKey === 'size') {
  aValue = Number.parseFloat(a.size)
  bValue = Number.parseFloat(b.size)
}

    if (sortKey === 'lastUpdated') {
      return sortOrder === 'asc'
        ? new Date(a.lastUpdated).getTime() - new Date(b.lastUpdated).getTime()
        : new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
    }

    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
    return 0
  })

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
              {(['name', 'lastUpdated', 'size'] as SortKey[]).map((key) => (
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
                  key={project.name}
                  className="border-b border-app-border/80 hover:bg-panel/40"
                >
                  <td className="px-4 py-3 text-sm text-white">{project.name}</td>
                  <td className="px-4 py-3 text-sm text-neutral-400">{project.lastUpdated}</td>
                  <td className="px-4 py-3 text-sm text-neutral-300">{project.size}</td>
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