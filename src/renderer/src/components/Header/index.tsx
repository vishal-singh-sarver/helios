import React from 'react'
import heliosLogo from '@renderer/assets/Helios_logo.svg'

interface HeaderProps {
  children: React.ReactNode
  onLogoClick?: () => void
}

function Header({ children, onLogoClick }: HeaderProps): React.JSX.Element {
  const logo = <img src={heliosLogo} alt="Helios logo" className="h-5 w-auto" />

  return (
    <header className="border-b border-app-border">
      <div className="flex h-11 items-center border-b border-app-border px-4">
        {onLogoClick ? (
          <button
            type="button"
            onClick={onLogoClick}
            aria-label="Go to home"
            className="flex items-center rounded focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-500"
          >
            {logo}
          </button>
        ) : (
          logo
        )}
      </div>

      <div className="flex h-[50px] items-center justify-between bg-[#202020] px-5 py-[10px]">
        {children}
      </div>
    </header>
  )
}

export default Header
