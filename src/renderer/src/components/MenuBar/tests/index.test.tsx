// components/MenuBar/tests/index.test.tsx
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import MenuBar from '../index'
import { ToolbarMap } from '../../../types/project'

const MOCK_ITEMS: ToolbarMap = {
  File: ['New Project', 'Open Project', 'Save'],
  Edit: ['Undo', 'Redo']
}

describe('<MenuBar />', () => {
  const defaultProps = {
    items: MOCK_ITEMS,
    onItemSelect: vi.fn()
  }

  // Smoke test — component mounts without throwing
  it('renders without error', () => {
    render(<MenuBar {...defaultProps} />)
  })

  // Verifies all top-level menu labels (Object.keys of items) are rendered
  it('renders all top-level menu labels', () => {
    render(<MenuBar {...defaultProps} />)
    expect(screen.getByText('File')).toBeInTheDocument()
    expect(screen.getByText('Edit')).toBeInTheDocument()
  })

  // Verifies every dropdown item from every menu group is in the DOM
  it('renders all dropdown items', () => {
    render(<MenuBar {...defaultProps} />)
    expect(screen.getByText('New Project')).toBeInTheDocument()
    expect(screen.getByText('Open Project')).toBeInTheDocument()
    expect(screen.getByText('Save')).toBeInTheDocument()
    expect(screen.getByText('Undo')).toBeInTheDocument()
    expect(screen.getByText('Redo')).toBeInTheDocument()
  })

  // Verifies onItemSelect is called with the correct menu item string when clicked
  it('calls onItemSelect with correct item on click', () => {
    const onItemSelect = vi.fn()
    render(<MenuBar {...defaultProps} onItemSelect={onItemSelect} />)
    fireEvent.click(screen.getByText('New Project'))
    expect(onItemSelect).toHaveBeenCalledWith('New Project')
  })

  // Verifies onItemSelect is called with a different menu item from a different group
  it('calls onItemSelect for items in different menu groups', () => {
    const onItemSelect = vi.fn()
    render(<MenuBar {...defaultProps} onItemSelect={onItemSelect} />)
    fireEvent.click(screen.getByText('Undo'))
    expect(onItemSelect).toHaveBeenCalledWith('Undo')
  })

  // Verifies the component uses a <nav> element for semantic navigation
  it('wraps menu in a nav element', () => {
    render(<MenuBar {...defaultProps} />)
    expect(screen.getByRole('navigation')).toBeInTheDocument()
  })

  // Verifies correct number of top-level menu groups are rendered
  it('renders correct number of menu groups', () => {
    render(<MenuBar {...defaultProps} />)
    const nav = screen.getByRole('navigation')
    // Each top-level menu is a direct child div with class "group"
    const groups = nav.querySelectorAll(':scope > div')
    expect(groups.length).toBe(2)
  })

  // Verifies it handles an empty items map without crashing
  it('renders without error when items is empty', () => {
    render(<MenuBar items={{}} onItemSelect={vi.fn()} />)
    expect(screen.getByRole('navigation')).toBeInTheDocument()
  })

  // Snapshot regression guard
  it('should match the snapshot', () => {
    const { container } = render(<MenuBar {...defaultProps} />)
    expect(container.firstChild).toMatchSnapshot()
  })
})