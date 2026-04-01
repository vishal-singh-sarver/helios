import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Sidebar from '../index'

const items = [
  { label: 'Home', icon: 'home.svg' },
  { label: 'New Project', icon: 'new-project.svg' },
  { label: 'Open project', icon: 'open-project.svg' }
]

describe('<Sidebar />', () => {
  it('renders all sidebar actions', () => {
    render(<Sidebar items={items} onSelect={vi.fn()} />)

    expect(screen.getByRole('button', { name: 'Sidebar Home' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sidebar New Project' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sidebar Open project' })).toBeInTheDocument()
  })

  it('calls onSelect only for the New Project action', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()

    render(<Sidebar items={items} onSelect={onSelect} />)

    await user.click(screen.getByRole('button', { name: 'Sidebar Home' }))
    expect(onSelect).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: 'Sidebar New Project' }))
    expect(onSelect).toHaveBeenCalledTimes(1)
  })
})
