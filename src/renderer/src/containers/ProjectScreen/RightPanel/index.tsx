import React from 'react'
import CollapseButton from '../CollapseButton'

function RightPanel(): React.JSX.Element {
  const [collapsed, setCollapsed] = React.useState(false)
  const toggle = (): void => setCollapsed((prev) => !prev)

  const widthClass = collapsed ? 'w-8' : 'w-[280px]'

  return (
    <aside
      className={`${widthClass} shrink-0 overflow-hidden rounded-lg border border-app-border bg-panel/20 transition-[width] duration-150`}
    >
      <div className="flex items-center justify-start p-1">
        <CollapseButton collapsed={collapsed} side="right" onToggle={toggle} />
      </div>
      {!collapsed && (
        <div className="overflow-y-auto p-3">
          {/* Properties */}
        </div>
      )}
    </aside>
  )
}

export default RightPanel
