import React from 'react'
import SidebarButton from '@renderer/components/SidebarButton'

interface SidebarItem {
  label: string
  icon: string
}

interface SidebarProps {
  items: SidebarItem[]
  onSelect: () => void
}

function Sidebar({ items, onSelect }: SidebarProps): React.JSX.Element {
  return (
    <aside className="w-56 border-r border-app-border p-4">
      <nav className="flex flex-col gap-2">
        {items?.map((item, index) => (
          <SidebarButton
            key={item.label}
            label={item.label}
            icon={item?.icon}
            isActive={index === 0}
            onClick={() => {
              if (item.label === 'New Project') {
                onSelect()
              }
            }}
          />
        ))}
      </nav>
    </aside>
  )
}

export default Sidebar
