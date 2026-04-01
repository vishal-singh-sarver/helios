import React, { useState } from 'react'
import EmptyState from '../EmptyState'

interface ProjectRecord {
  name: string
  lastUpdated: string
  size: string
}

interface ProjectsTableProps {
  projects: ProjectRecord[]
  emptyIcon: string
  onCreateNew: () => void
}

type SortKey = 'name' | 'lastUpdated' | 'size'
type SortOrder = 'asc' | 'desc'

function ProjectsTable({ projects, emptyIcon, onCreateNew }: ProjectsTableProps): React.JSX.Element {
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')

  const handleSort = (key: SortKey) => {
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

    // handle size (convert MB string to number)
    if (sortKey === 'size') {
      aValue = parseFloat(a.size)
      bValue = parseFloat(b.size)
    }

    // handle date
    if (sortKey === 'lastUpdated') {
      return sortOrder === 'asc'
        ? new Date(a.lastUpdated).getTime() - new Date(b.lastUpdated).getTime()
        : new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
    }

    // default string compare
    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
    return 0
  })

  const getArrow = (key: SortKey) => {
    if (key !== sortKey) return '↑↓'
    return sortOrder === 'asc' ? '↑' : '↓'
  }

  return (
    <>
      <h1 className="mb-6 text-lg font-medium text-white">Recent Projects</h1>

      <div className="overflow-hidden rounded border border-app-border bg-panel/20">
        <div className="grid grid-cols-[2fr_2fr_1fr] border-b border-app-border px-4 py-2 text-sm text-neutral-400">
          <span onClick={() => handleSort('name')}>Name {getArrow('name')}</span>
          <span onClick={() => handleSort('lastUpdated')}>Last Updated {getArrow('lastUpdated')}</span>
          <span onClick={() => handleSort('size')}>Size {getArrow('size')}</span>
        </div>

        {sortedProjects.length === 0 ? (
          <EmptyState icon={emptyIcon} onCreateNew={onCreateNew} />
        ) : (
          <div className="max-h-130 overflow-y-auto">
            {sortedProjects.map((project) => (
              <button
                key={project.name}
                className="grid w-full grid-cols-[2fr_2fr_1fr] items-center border-b border-app-border/80 px-4 py-3 text-left text-sm"
              >
                <span className="text-white">{project.name}</span>
                <span className="text-neutral-400">{project.lastUpdated}</span>
                <span className="text-neutral-300">{project.size}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  )
}

export default ProjectsTable
