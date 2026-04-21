// components/SidebarButton/tests/index.test.tsx
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import SidebarButton from '../index'

describe('<SidebarButton />', () => {
  const defaultProps = {
    label: 'Home',
    icon: 'home.svg',
    onClick: vi.fn()
  }

  // Smoke test — component mounts without throwing
  it('renders without error', () => {
    render(<SidebarButton {...defaultProps} />)
  })

  // Verifies the button label text is rendered
  it('renders the label text', () => {
    render(<SidebarButton {...defaultProps} />)
    expect(screen.getByText('Home')).toBeInTheDocument()
  })

  // Verifies the icon image src is set from the icon prop
  it('renders the icon with correct src', () => {
    render(<SidebarButton {...defaultProps} />)
    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('src', 'home.svg')
  })

  // Verifies the aria-label is constructed as "Sidebar {label}"
  it('has correct aria-label', () => {
    render(<SidebarButton {...defaultProps} />)
    expect(screen.getByLabelText('Sidebar Home')).toBeInTheDocument()
  })

  // Verifies onClick callback fires when button is clicked
  it('calls onClick when clicked', () => {
    const onClick = vi.fn()
    render(<SidebarButton {...defaultProps} onClick={onClick} />)
    fireEvent.click(screen.getByLabelText('Sidebar Home'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  // Verifies the active state applies the active CSS class (bg-panel)
  it('applies active styles when isActive is true', () => {
    render(<SidebarButton {...defaultProps} isActive={true} />)
    const button = screen.getByLabelText('Sidebar Home')
    expect(button.className).toContain('bg-panel')
    expect(button.className).toContain('text-white')
  })

  // Verifies the inactive state applies the inactive CSS class (text-neutral-300)
  it('applies inactive styles when isActive is false', () => {
    render(<SidebarButton {...defaultProps} isActive={false} />)
    const button = screen.getByLabelText('Sidebar Home')
    expect(button.className).toContain('text-neutral-300')
  })

  // Verifies isActive defaults to false when not provided
  it('defaults to inactive when isActive is not provided', () => {
    render(<SidebarButton {...defaultProps} />)
    const button = screen.getByLabelText('Sidebar Home')
    expect(button.className).toContain('text-neutral-300')
  })

  // Snapshot regression guard — inactive state
  it('should match the snapshot (inactive)', () => {
    const { container } = render(<SidebarButton {...defaultProps} />)
    expect(container.firstChild).toMatchSnapshot()
  })

  // Snapshot regression guard — active state
  it('should match the snapshot (active)', () => {
    const { container } = render(<SidebarButton {...defaultProps} isActive={true} />)
    expect(container.firstChild).toMatchSnapshot()
  })
})
