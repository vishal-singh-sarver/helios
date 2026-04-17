import React from 'react'
import CollapseButton from '../CollapseButton'

function LeftPanel(): React.JSX.Element {
  const [collapsed, setCollapsed] = React.useState(false)
  const toggle = (): void => setCollapsed((prev) => !prev)

  const widthClass = collapsed ? 'w-8' : 'w-[280px]'

  return (
    <aside
      className={`${widthClass} shrink-0 overflow-hidden rounded-lg border border-app-border bg-panel/20 transition-[width] duration-150`}
    >
      <div className="flex items-center justify-end p-1">
        <CollapseButton collapsed={collapsed} side="left" onToggle={toggle} />
      </div>
      {!collapsed && (
        <div className="overflow-y-auto p-3">
          {/* Tools: Geometry, Materials, Models */}
        </div>
      )}
    </aside>
  )
}

export default LeftPanel
