import React, { useState } from 'react'
import deleteIcon from '@renderer/assets/delete.svg'
import EmptyState from '../EmptyState'
import type { RecentProjectItem } from '../../containers/HomePage/types'

interface ProjectsTableProps {
  projects: RecentProjectItem[]
  emptyIcon: string
  onCreateNew: () => void
}

type SortKey = 'name' | 'last_updated' | 'size'
type SortOrder = 'asc' | 'desc'

const ROW_HEIGHT = 64
const OVERSCAN = 5
const GRID_TEMPLATE = 'minmax(0,2fr) minmax(0,2fr) minmax(0,1fr) 48px'

const COLUMN_LABELS: Record<SortKey, string> = {
  name: 'Name',
  last_updated: 'Last Updated',
  size: 'Size'
}

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

function ProjectsTable({ projects, emptyIcon, onCreateNew }: ProjectsTableProps): React.JSX.Element {
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
    // TODO: wire to open-project action in the open-project feature pass
    // For now just log the id so the stub is verifiable in the console.
    console.log('[ProjectsTable] open project', project.id, project.name)
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

  const { startIndex, endIndex, paddingTop } = useVirtualRows({
    rowCount: sortedProjects.length,
    rowHeight: ROW_HEIGHT,
    containerRef,
    overscan: OVERSCAN
  })

  const visibleRows = sortedProjects.slice(startIndex, endIndex)

  const getArrow = (key: SortKey): string => {
    if (key !== sortKey) return '↑↓'
    return sortOrder === 'asc' ? '↑' : '↓'
  }

  return (
    <>
      <h1 className="mb-6 text-lg font-medium text-white">Recent Projects</h1>

      {/* Header row — sits outside the scroll container so it never scrolls */}
      <div
        role="row"
        className="grid items-center rounded-t border border-app-border bg-panel/20 px-4 py-2 text-sm font-normal text-neutral-400"
        style={{ gridTemplateColumns: GRID_TEMPLATE }}
      >
        {(['name', 'last_updated', 'size'] as SortKey[]).map((key) => (
          <button
            key={key}
            onClick={() => handleSort(key)}
            className="flex items-center gap-1 text-left hover:text-white"
          >
            {COLUMN_LABELS[key]}
            <span aria-hidden="true">{getArrow(key)}</span>
          </button>
        ))}
        <span aria-hidden="true" />
      </div>

      {/* Scrollable body */}
      <div
        ref={containerRef}
        role="list"
        className="scrollbar-custom flex-1 min-h-0 overflow-y-auto rounded-b border border-t-0 border-app-border bg-panel/20"
      >
        {sortedProjects.length === 0 ? (
          <EmptyState icon={emptyIcon} onCreateNew={onCreateNew} />
        ) : (
          <div
            style={{ height: sortedProjects.length * ROW_HEIGHT, position: 'relative' }}
          >
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                transform: `translateY(${paddingTop}px)`
              }}
            >
              {visibleRows.map((project) => (
                <div
                  key={project.id}
                  role="listitem"
                  className="grid items-center border-b border-app-border/80 px-4 hover:bg-panel/40 focus-within:bg-panel/40"
                  style={{ gridTemplateColumns: GRID_TEMPLATE, height: ROW_HEIGHT }}
                >
                  {/* Nested button owns the click + keyboard surface for "open project".
                      Row-level handlers were removed so (a) keyboard events from the
                      delete button don't bubble up, and (b) screen readers announce
                      this as a proper button instead of a silent listitem. */}
                  <button
                    type="button"
                    aria-label={`Open project ${project.name}`}
                    onClick={() => handleOpenProject(project)}
                    className="col-span-3 grid h-full cursor-pointer items-center rounded text-left focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-500"
                    style={{ gridTemplateColumns: 'minmax(0,2fr) minmax(0,2fr) minmax(0,1fr)' }}
                  >
                    <span className="truncate text-sm text-white">{project.name}</span>
                    <span className="text-sm text-neutral-400">
                      {formatRelativeDate(project.last_updated)}
                    </span>
                    <span className="text-sm text-neutral-300">{formatBytes(project.size)}</span>
                  </button>
                  <button
                    type="button"
                    aria-label={`Delete project ${project.name}`}
                    className="flex h-8 w-8 items-center justify-center rounded text-neutral-400 hover:bg-red-500/10 hover:text-red-400 focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-500"
                    onClick={() => {
                      // TODO: wire to deleteProject action in the delete-feature pass
                    }}
                  >
                    <img src={deleteIcon} alt="" aria-hidden="true" className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default ProjectsTable
