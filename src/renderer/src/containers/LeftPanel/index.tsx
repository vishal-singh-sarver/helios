import React from 'react'
import type { Reducer } from 'redux'
import CollapseButton from '@renderer/components/CollapseButton'
import { useInjectReducer } from 'utils/injectReducer'
import { useInjectSaga } from 'utils/injectSaga'
import reducer from './reducer'
import saga from './saga'

// To read state:  const value = useSelector((s: RootState) => s.leftPanel.someField)
// To dispatch:    const dispatch = useDispatch()

export function LeftPanel(): React.JSX.Element {
  useInjectReducer({ key: 'leftPanel', reducer: reducer as Reducer })
  useInjectSaga({ key: 'leftPanel', saga })

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
