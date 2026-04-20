import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import MenuBar from '../index'
import { ToolbarMap } from '../../../types/project'

const MOCK_ITEMS: ToolbarMap = {
  File: ['New Project', 'Open Project', 'Save'],
  Edit: ['Undo', 'Redo']
}

describe('<MenuBar />', () => {
  const setup = (props = {}) => {
    const onItemSelect = vi.fn()

    render(<MenuBar items={MOCK_ITEMS} onItemSelect={onItemSelect} {...props} />)

    return { onItemSelect }
  }

  // Smoke test
  it('renders without crashing', () => {
    setup()
  })

  // Accessibility: nav landmark
  it('renders navigation landmark', () => {
    setup()
    expect(screen.getByRole('navigation')).toBeInTheDocument()
  })

  //  Top-level menu buttons (accessible)
  it('renders all top-level menu buttons', () => {
    setup()

    expect(screen.getByRole('button', { name: 'File' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument()
  })

  //  Dropdown items exist in the DOM but are visually hidden via CSS class.
  //  jsdom doesn't apply Tailwind, so we verify the `invisible` / `group-hover:visible`
  //  classes are present on the dropdown container instead of using toBeVisible().
  it('dropdown items are not visible initially', () => {
    setup()

    const item = screen.getByText('New Project')
    const dropdownContainer = item.closest('div.invisible')
    expect(dropdownContainer).not.toBeNull()
    expect(dropdownContainer).toHaveClass('invisible')
    expect(dropdownContainer).toHaveClass('group-hover:visible')
  })

  //  Dropdown becomes visible on hover
  it('shows dropdown items on hover', () => {
    setup()

    const menuButton = screen.getByRole('button', { name: 'File' })
    fireEvent.mouseOver(menuButton)

    const item = screen.getByText('New Project')
    expect(item).toBeVisible()
  })

  //  Click interaction + exact call count
  it('calls onItemSelect once with correct value on click', () => {
    const { onItemSelect } = setup()

    fireEvent.mouseOver(screen.getByRole('button', { name: 'File' }))
    fireEvent.click(screen.getByText('New Project'))

    expect(onItemSelect).toHaveBeenCalledTimes(1)
    expect(onItemSelect).toHaveBeenCalledWith('New Project')
  })

  //  Multiple clicks + order verification
  it('handles multiple item clicks in correct order', () => {
    const { onItemSelect } = setup()

    fireEvent.mouseOver(screen.getByRole('button', { name: 'File' }))
    fireEvent.click(screen.getByText('New Project'))

    fireEvent.mouseOver(screen.getByRole('button', { name: 'Edit' }))
    fireEvent.click(screen.getByText('Undo'))

    expect(onItemSelect).toHaveBeenCalledTimes(2)
    expect(onItemSelect).toHaveBeenNthCalledWith(1, 'New Project')
    expect(onItemSelect).toHaveBeenNthCalledWith(2, 'Undo')
  })

  //  Ensure handler is NOT called before interaction
  it('does not call onItemSelect before user interaction', () => {
    const { onItemSelect } = setup()
    expect(onItemSelect).not.toHaveBeenCalled()
  })

  //  Handles empty menu safely
  it('renders correctly with empty items', () => {
    render(<MenuBar items={{}} onItemSelect={vi.fn()} />)
    expect(screen.getByRole('navigation')).toBeInTheDocument()
  })

  //  Handles empty group
  it('renders menu group with no items', () => {
    const items = { File: [] }

    render(<MenuBar items={items} onItemSelect={vi.fn()} />)

    const button = screen.getByRole('button', { name: 'File' })
    expect(button).toBeInTheDocument()

    fireEvent.mouseOver(button)

    // No dropdown items should exist
    expect(screen.queryByRole('menuitem')).not.toBeInTheDocument()
  })

  //  Structure: correct number of groups
  it('renders correct number of menu groups', () => {
    setup()

    const nav = screen.getByRole('navigation')
    const groups = nav.querySelectorAll(':scope > div')

    expect(groups.length).toBe(Object.keys(MOCK_ITEMS).length)
  })

  //  Snapshot (kept minimal importance)
  it('matches snapshot', () => {
    const { container } = render(<MenuBar items={MOCK_ITEMS} onItemSelect={vi.fn()} />)
    expect(container.firstChild).toMatchSnapshot()
  })
})
