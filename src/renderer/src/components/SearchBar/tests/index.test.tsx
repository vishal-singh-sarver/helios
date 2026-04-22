import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import SearchBar from '../index'

describe('<SearchBar />', () => {
  const defaultProps = {
    ariaLabel: 'Search projects',
    icon: 'search.svg',
    value: '',
    placeholder: 'Search...',
    onChange: vi.fn()
  }

  // Smoke test — component mounts without throwing
  it('renders without error', () => {
    render(<SearchBar {...defaultProps} />)
  })

  // Verifies the input has the correct aria-label for accessibility
  it('renders the input with correct aria-label', () => {
    render(<SearchBar {...defaultProps} />)
    expect(screen.getByLabelText('Search projects')).toBeInTheDocument()
  })

  // Verifies the placeholder text appears in the input
  it('renders the placeholder text', () => {
    render(<SearchBar {...defaultProps} />)
    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument()
  })

  // Verifies the search icon is rendered with correct src.
  // NOTE: <img alt=""> has implicit role="presentation", not role="img",
  // so we query by alt text instead of role.
  it('renders the search icon', () => {
    render(<SearchBar {...defaultProps} />)
    const img = screen.getByAltText('')
    expect(img).toHaveAttribute('src', 'search.svg')
  })

  // Verifies the icon has empty alt text (decorative image).
  // The presence of an <img> queryable via getByAltText('') confirms it.
  it('renders the icon as decorative (empty alt)', () => {
    render(<SearchBar {...defaultProps} />)
    const img = screen.getByAltText('')
    expect(img.tagName).toBe('IMG')
    expect(img).toHaveAttribute('alt', '')
  })

  // Verifies the controlled value prop is reflected in the input
  it('displays the current value', () => {
    render(<SearchBar {...defaultProps} value="coastal" />)
    expect(screen.getByLabelText('Search projects')).toHaveValue('coastal')
  })

  // Verifies onChange callback fires with the typed value
  it('calls onChange with new value when user types', () => {
    const onChange = vi.fn()
    render(<SearchBar {...defaultProps} onChange={onChange} />)
    fireEvent.change(screen.getByLabelText('Search projects'), {
      target: { value: 'delta' }
    })
    expect(onChange).toHaveBeenCalledWith('delta')
  })

  // Verifies onChange fires with empty string when input is cleared
  it('calls onChange with empty string when cleared', () => {
    const onChange = vi.fn()
    render(<SearchBar {...defaultProps} value="test" onChange={onChange} />)
    fireEvent.change(screen.getByLabelText('Search projects'), {
      target: { value: '' }
    })
    expect(onChange).toHaveBeenCalledWith('')
  })

  // Snapshot regression guard
  it('should match the snapshot', () => {
    const { container } = render(<SearchBar {...defaultProps} />)
    expect(container.firstChild).toMatchSnapshot()
  })

  it('renders without placeholder when not provided', () => {
    render(<SearchBar {...defaultProps} placeholder={undefined} />)
    expect(screen.getByRole('textbox')).not.toHaveAttribute('placeholder')
  })
})
