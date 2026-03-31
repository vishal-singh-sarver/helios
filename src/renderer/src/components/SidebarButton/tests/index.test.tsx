import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SidebarButton from '../index'

describe('<SidebarButton />', () => {
  it('renders the button label', () => {
    render(<SidebarButton label="Home" icon="home.svg" onClick={vi.fn()} />)

    expect(screen.getByRole('button', { name: 'Sidebar Home' })).toBeInTheDocument()
  })

  it('calls onClick when pressed', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()

    render(<SidebarButton label="Home" icon="home.svg" onClick={onClick} />)

    await user.click(screen.getByRole('button', { name: 'Sidebar Home' }))

    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('applies the active styles when active', () => {
    render(<SidebarButton label="Home" icon="home.svg" isActive onClick={vi.fn()} />)

    expect(screen.getByRole('button', { name: 'Sidebar Home' })).toHaveClass('bg-panel')
  })
})
