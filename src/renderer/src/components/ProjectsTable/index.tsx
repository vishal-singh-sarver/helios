import React, { useState } from 'react'
import deleteIcon from '@renderer/assets/delete.svg'
import sortIcon from '@renderer/assets/Sort 3.svg'
import { formatBytes, formatRelativeDate } from 'utils/format'
import { useVirtualRows } from 'utils/useVirtualRows'
import EmptyState from '../EmptyState'
import type { RecentProjectItem } from '../../containers/HomePage/types'

interface ProjectsTableProps {
  projects: RecentProjectItem[]
  emptyIcon: string
  onCreateNew: () => void
  onDelete: (projectId: string) => void
  deletingIds: string[]
}

type SortKey = 'name' | 'last_updated' | 'size'
type SortOrder = 'asc' | 'desc'

const ROW_HEIGHT = 64
const OVERSCAN = 5

const COLUMN_LABELS: Record<SortKey, string> = {
  name: 'Name',
  last_updated: 'Last Updated',
  size: 'Size'
}



function ProjectsTable({
  projects,
  emptyIcon,
  onCreateNew,
  onDelete,
  deletingIds
}: ProjectsTableProps): React.JSX.Element {
  const [sortKey, setSortKey] = useState<SortKey>('last_updated')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const containerRef = React.useRef<HTMLDivElement>(null)

  const handleSort = (key: SortKey): void => {
    if (key === sortKey) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortOrder('asc')
    }
  }

  const handleOpenProject = (project: RecentProjectItem): void => {
    if (import.meta.env.DEV) {
      console.log('[ProjectsTable] open project', project.id, project.name)
    }
    // TODO: dispatch openProject(project.id)
  }

  const sortedProjects = React.useMemo(() => {
    const decorated = projects.map((p) => ({
      project: p,
      timestamp: sortKey === 'last_updated' ? new Date(p.last_updated).getTime() : 0
    }))

    decorated.sort((a, b) => {
      if (sortKey === 'size') {
        return sortOrder === 'asc'
          ? a.project.size - b.project.size
          : b.project.size - a.project.size
      }
      if (sortKey === 'last_updated') {
        return sortOrder === 'asc' ? a.timestamp - b.timestamp : b.timestamp - a.timestamp
      }
      const cmp = a.project.name.localeCompare(b.project.name)
      return sortOrder === 'asc' ? cmp : -cmp
    })

    return decorated.map((d) => d.project)
  }, [projects, sortKey, sortOrder])

  const { startIndex, endIndex } = useVirtualRows({
    rowCount: sortedProjects.length,
    rowHeight: ROW_HEIGHT,
    containerRef,
    overscan: OVERSCAN
  })

  const visibleRows = sortedProjects.slice(startIndex, endIndex)
  const paddingTop = startIndex * ROW_HEIGHT
  const paddingBottom = (sortedProjects.length - endIndex) * ROW_HEIGHT

  const getAriaSort = (key: SortKey): 'ascending' | 'descending' | 'none' => {
    if (key !== sortKey) return 'none'
    return sortOrder === 'asc' ? 'ascending' : 'descending'
  }

  const renderSortIndicator = (key: SortKey): React.JSX.Element => {
    const isActive = key === sortKey
    return (
      <img
        src={sortIcon}
        alt=""
        aria-hidden="true"
        className={`ml-1 h-3 w-auto ${isActive ? 'opacity-100' : 'opacity-60'} ${
          isActive && sortOrder === 'desc' ? 'rotate-180' : ''
        }`}
      />
    )
  }

  return (
    <>
      <h2 className="mb-6 text-lg font-medium text-white">Recent Projects</h2>

      <div
        ref={containerRef}
        className="scrollbar-custom flex-1 min-h-0 overflow-y-auto rounded border border-app-border bg-app-panel/20"
      >
        {sortedProjects.length === 0 ? (
          <EmptyState icon={emptyIcon} onCreateNew={onCreateNew} />
        ) : (
          <table className="w-full border-separate table-fixed" style={{ borderSpacing: 0 }}>
            <colgroup>
              <col style={{ width: '40%' }} />
              <col style={{ width: '32%' }} />
              <col style={{ width: '20%' }} />
              <col style={{ width: '8%' }} />
            </colgroup>

            <thead>
              <tr>
                {(['name', 'last_updated', 'size'] as SortKey[]).map((key) => (
                  <th
                    key={key}
                    scope="col"
                    aria-sort={getAriaSort(key)}
                    className="sticky top-0 z-10 bg-app-bg border-b border-app-border px-4 py-3 text-left text-sm font-normal text-neutral-400"
                  >
                    <button
                      type="button"
                      onClick={() => handleSort(key)}
                      className="flex items-center gap-1 hover:text-white focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 rounded"
                    >
                      {COLUMN_LABELS[key]}
                      {renderSortIndicator(key)}
                    </button>
                  </th>
                ))}
                <th
                  scope="col"
                  aria-label="Actions"
                  className="sticky top-0 z-10 bg-app-bg border-b border-app-border"
                />
              </tr>
            </thead>

            <tbody>
              {paddingTop > 0 && (
                <tr aria-hidden="true" style={{ height: paddingTop }}>
                  <td colSpan={4} />
                </tr>
              )}

              {visibleRows.map((project) => {
                const isDeleting = deletingIds.includes(project.id)
                return (
                  <tr
                    key={project.id}
                    className="hover:bg-app-panel/40 focus-within:bg-app-panel/40"
                    style={{ height: ROW_HEIGHT }}
                  >
                    <td className="border-b border-app-border/80 px-4 overflow-hidden">
                      <button
                        type="button"
                        aria-label={`Open project ${project.name}`}
                        onClick={() => handleOpenProject(project)}
                        title={project.name}
                        className="block w-full truncate text-left text-sm text-white focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 rounded"
                      >
                        {project.name}
                      </button>
                    </td>
                    <td className="border-b border-app-border/80 px-4 text-sm text-neutral-400">
                      {formatRelativeDate(project.last_updated)}
                    </td>
                    <td className="border-b border-app-border/80 px-4 text-sm text-neutral-300">
                      {formatBytes(project.size)}
                    </td>
                    <td className="border-b border-app-border/80 px-4">
                      <button
                        type="button"
                        aria-label={`Delete project ${project.name}`}
                        onClick={() => onDelete(project.id)}
                        disabled={isDeleting}
                        className="flex h-8 w-8 items-center justify-center rounded text-neutral-400 focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <img src={deleteIcon} alt="" aria-hidden="true" className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                )
              })}

              {paddingBottom > 0 && (
                <tr aria-hidden="true" style={{ height: paddingBottom }}>
                  <td colSpan={4} />
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </>
  )
}

export default ProjectsTable
