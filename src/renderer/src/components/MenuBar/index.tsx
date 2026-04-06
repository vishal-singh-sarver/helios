import React from 'react'
import { ToolbarMap } from '../../types/project'

interface MenuBarProps {
  items: ToolbarMap
  openMenu: string | null
  onToggle: (value: string | null) => void
  onItemSelect: (menuItem: string) => void
}

function MenuBar({ items, openMenu, onToggle, onItemSelect }: MenuBarProps): React.JSX.Element {
  const toolbarRef = React.useRef<HTMLDivElement | null>(null)

  React.useEffect(() => {
    const onPointerDown = (event: MouseEvent): void => {
      if (!openMenu) return
      if (toolbarRef.current && !toolbarRef.current.contains(event.target as Node)) {
        onToggle(null)
      }
    }

    window.addEventListener('mousedown', onPointerDown)
    return () => window.removeEventListener('mousedown', onPointerDown)
  }, [onToggle, openMenu])

  return (
    <div ref={toolbarRef}>
      <nav className="flex items-center gap-2 text-sm font-medium text-neutral-300">
        {Object.keys(items).map((item) => (
          <div key={item} className="relative">
            <button
              onClick={() => onToggle(openMenu === item ? null : item)}
              className="rounded px-2 py-1 hover:bg-panel hover:text-white"
            >
              {item}
            </button>

            {openMenu === item && (
              <div className="absolute top-9 left-0 z-20 min-w-44 rounded border border-app-border bg-[#181a1f] py-1 shadow-lg">
                {items[item]?.map((menuItem) => (
                  <button
                    key={menuItem}
                    onClick={() => onItemSelect(menuItem)}
                    className="block w-full px-3 py-1.5 text-left text-sm text-neutral-200 hover:bg-app-border"
                  >
                    {menuItem}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </div>
  )
}

export default MenuBar
