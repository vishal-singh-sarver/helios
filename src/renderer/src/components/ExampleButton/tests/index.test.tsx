import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import ExampleButton from '../index'

describe('<ExampleButton />', () => {
  it('renders the label', () => {
    render(<ExampleButton label="Click me" />)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const onClick = vi.fn()
    render(<ExampleButton label="Click me" onClick={onClick} />)
    fireEvent.click(screen.getByText('Click me'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('is disabled when disabled prop is true', () => {
    render(<ExampleButton label="Disabled" disabled />)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('should match the snapshot', () => {
    const { container } = render(<ExampleButton label="Snapshot" />)
    expect(container.firstChild).toMatchSnapshot()
  })
})
