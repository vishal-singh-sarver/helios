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
<<<<<<< HEAD
  onRowClick?: (projectId: string) => void
=======
  onRequestDelete: (project: RecentProjectItem) => void
  deletingIds: string[]
>>>>>>> develop
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

<<<<<<< HEAD
// ── Helpers ───────────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (Number.isNaN(bytes) || bytes < 0) return '—'
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let value = bytes
  let unitIndex = 0
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024
    unitIndex += 1
  }
  return `${value.toFixed(value >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`
}

function formatRelativeDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  const diffMs = Date.now() - d.getTime()
  const diffDays = Math.floor(diffMs / 86_400_000)
  if (diffDays < 1) return 'today'
  if (diffDays <= 6) return `${diffDays} day ago`
  // Locale-independent M/D/YYYY to match the design exactly regardless of the
  // user's browser locale (toLocaleDateString would drift to D/M/YYYY in EU).
  return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`
}

// ── Hand-rolled virtualizer ───────────────────────────────────────────────────

interface UseVirtualRowsArgs {
  rowCount: number
  rowHeight: number
  containerRef: React.RefObject<HTMLDivElement | null>
  overscan?: number
}

function useVirtualRows({
  rowCount,
  rowHeight,
  containerRef,
  overscan = 5
}: UseVirtualRowsArgs): { startIndex: number; endIndex: number; paddingTop: number } {
  const [scrollTop, setScrollTop] = React.useState(0)
  const [viewportHeight, setViewportHeight] = React.useState(0)

  React.useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const onScroll = (): void => setScrollTop(el.scrollTop)
    const measure = (): void => setViewportHeight(el.clientHeight)

    measure()
    el.addEventListener('scroll', onScroll, { passive: true })
    const ro = new ResizeObserver(measure)
    ro.observe(el)

    return () => {
      el.removeEventListener('scroll', onScroll)
      ro.disconnect()
    }
  }, [containerRef])

  const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan)
  const visibleCount = Math.ceil(viewportHeight / rowHeight) + overscan * 2
  const endIndex = Math.min(rowCount, startIndex + visibleCount)

  return {
    startIndex,
    endIndex,
    paddingTop: startIndex * rowHeight
  }
}

// ── Component ─────────────────────────────────────────────────────────────────

function ProjectsTable({ projects, emptyIcon, onCreateNew, onRowClick }: ProjectsTableProps): React.JSX.Element {
=======
function ProjectsTable({
  projects,
  emptyIcon,
  onCreateNew,
  onRequestDelete,
  deletingIds
}: ProjectsTableProps): React.JSX.Element {
>>>>>>> develop
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
<<<<<<< HEAD
    onRowClick?.(project.id)
=======
    if (import.meta.env.DEV) {
      console.log('[ProjectsTable] open project', project.id, project.name)
    }
    // TODO: dispatch openProject(project.id)
>>>>>>> develop
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
                        onClick={() => onRequestDelete(project)}
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
