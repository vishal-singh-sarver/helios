import React from 'react'
import heliosLogo from '@renderer/assets/Helios_logo.svg'

interface HeaderProps {
  children: React.ReactNode
}

function Header({ children }: HeaderProps): React.JSX.Element {
  return (
    <header className="border-b border-app-border">
      <div className="flex h-11 items-center border-b border-app-border px-4">
        <img src={heliosLogo} alt="Helios logo" className="h-5 w-auto" />
      </div>

      <div className="flex h-11 items-center justify-between px-3">{children}</div>
    </header>
  )
}

export default Header
