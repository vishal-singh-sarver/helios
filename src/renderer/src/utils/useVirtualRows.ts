import React from 'react'

export interface UseVirtualRowsArgs {
  rowCount: number
  rowHeight: number
  containerRef: React.RefObject<HTMLDivElement | null>
  overscan?: number
}

export interface UseVirtualRowsResult {
  startIndex: number
  endIndex: number
}

/**
 * Windowed-list hook: given a scrollable container and a fixed row height,
 * returns the [startIndex, endIndex) slice that should actually be rendered.
 * Caller is responsible for adding top/bottom spacer rows to preserve
 * scroll height.
 */
export function useVirtualRows({
  rowCount,
  rowHeight,
  containerRef,
  overscan = 5
}: UseVirtualRowsArgs): UseVirtualRowsResult {
  const [scrollTop, setScrollTop] = React.useState(0)
  const [viewportHeight, setViewportHeight] = React.useState(0)

  React.useLayoutEffect(() => {
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

  return { startIndex, endIndex }
}
