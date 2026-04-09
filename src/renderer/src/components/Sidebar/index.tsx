import React from 'react'
import SidebarButton from '@renderer/components/SidebarButton'
import { SidebarItem } from '../../types/project'

interface SidebarProps {
  items: SidebarItem[]
  activeLabel: string
  onSelect: (label: string) => void
}

function Sidebar({ items, activeLabel, onSelect }: SidebarProps): React.JSX.Element {
  return (
    <aside className="w-56 border-r border-app-border p-4">
      <nav className="flex flex-col gap-2">
        {items.map((item) => (
          <SidebarButton
            key={item.label}
            label={item.label}
            icon={item.icon}
            isActive={item.label === activeLabel}
            onClick={() => onSelect(item.label)}
          />
        ))}
      </nav>
    </aside>
  )
}

export default Sidebar
