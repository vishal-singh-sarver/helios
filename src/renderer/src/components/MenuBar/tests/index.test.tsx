import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MenuBar from '../index'

const items = {
  File: ['New Project', 'Open Project'],
  Help: ['About']
}

function ControlledMenuBar({
  onItemSelect = vi.fn()
}: {
  onItemSelect?: (menuItem: string) => void
}): React.JSX.Element {
  const [openMenu, setOpenMenu] = React.useState<string | null>(null)

  return (
    <div>
      <MenuBar
        items={items}
        openMenu={openMenu}
        onToggle={setOpenMenu}
        onItemSelect={onItemSelect}
      />
      <button>Outside</button>
    </div>
  )
}

describe('<MenuBar />', () => {
  it('renders top-level menu buttons', () => {
    render(<ControlledMenuBar />)

    expect(screen.getByRole('button', { name: 'File' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Help' })).toBeInTheDocument()
  })

  it('shows submenu items when a menu is opened', async () => {
    const user = userEvent.setup()

    render(<ControlledMenuBar />)
    await user.click(screen.getByRole('button', { name: 'File' }))

    expect(screen.getByRole('button', { name: 'New Project' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Open Project' })).toBeInTheDocument()
  })

  it('calls onItemSelect when a submenu item is clicked', async () => {
    const user = userEvent.setup()
    const onItemSelect = vi.fn()

    render(<ControlledMenuBar onItemSelect={onItemSelect} />)
    await user.click(screen.getByRole('button', { name: 'File' }))
    await user.click(screen.getByRole('button', { name: 'New Project' }))

    expect(onItemSelect).toHaveBeenCalledWith('New Project')
  })

  it('closes the open menu when clicking outside', async () => {
    const user = userEvent.setup()

    render(<ControlledMenuBar />)
    await user.click(screen.getByRole('button', { name: 'File' }))
    expect(screen.getByRole('button', { name: 'New Project' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Outside' }))

    expect(screen.queryByRole('button', { name: 'New Project' })).not.toBeInTheDocument()
  })
})
