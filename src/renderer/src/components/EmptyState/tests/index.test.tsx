// components/EmptyState/tests/index.test.tsx
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import EmptyState from '../index'

describe('<EmptyState />', () => {
  const defaultProps = {
    icon: 'search.svg',
    onCreateNew: vi.fn()
  }

  // Smoke test — component mounts without throwing
  it('renders without error', () => {
    render(<EmptyState {...defaultProps} />)
  })

  // Verifies the primary heading is displayed to the user
  it('renders the heading text', () => {
    render(<EmptyState {...defaultProps} />)
    expect(screen.getByText('No Projects Found')).toBeInTheDocument()
  })

  // Verifies the descriptive message below the heading
  it('renders the description text', () => {
    render(<EmptyState {...defaultProps} />)
    expect(
      screen.getByText('No Projects Found. Please add a new Project.')
    ).toBeInTheDocument()
  })

  // Verifies the CTA button is rendered with correct label
  it('renders the add new project button', () => {
    render(<EmptyState {...defaultProps} />)
    expect(screen.getByText('+ Add New Project')).toBeInTheDocument()
  })

  // Verifies the callback fires exactly once when user clicks the CTA
  it('calls onCreateNew when button is clicked', () => {
  const onCreateNew = vi.fn()

  render(<EmptyState {...defaultProps} onCreateNew={onCreateNew} />)

  // Ensure it's NOT called initially
  expect(onCreateNew).not.toHaveBeenCalled()

  fireEvent.click(screen.getByText('+ Add New Project'))

  expect(onCreateNew).toHaveBeenCalledTimes(1)
})
  // Verifies the icon prop is passed to the img src correctly
  it('renders the icon image with correct src', () => {
    render(<EmptyState {...defaultProps} />)
    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('src', 'search.svg')
  })

  // Snapshot regression guard
  it('should match the snapshot', () => {
    const { container } = render(<EmptyState {...defaultProps} />)
    expect(container.firstChild).toMatchSnapshot()
  })
})