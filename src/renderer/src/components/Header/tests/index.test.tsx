import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import Header from '../index'

// Mock SVG import so it resolves to a plain string
vi.mock('@renderer/assets/Helios_logo.svg', () => ({ default: 'helios-logo.svg' }))

describe('<Header />', () => {
  // Smoke test — component mounts without throwing
  it('renders without error', () => {
    render(
      <Header>
        <span>child</span>
      </Header>
    )
  })

  // Verifies the Helios logo image is rendered with correct src and alt text
  it('renders the Helios logo', () => {
    render(
      <Header>
        <span>child</span>
      </Header>
    )
    const logo = screen.getByAltText('Helios logo')
    expect(logo).toBeInTheDocument()
    expect(logo).toHaveAttribute('src', 'helios-logo.svg')
  })

  // Verifies that children passed to Header are rendered in the DOM
  it('renders children', () => {
    render(
      <Header>
        <span data-testid="test-child">Menu content</span>
      </Header>
    )
    expect(screen.getByTestId('test-child')).toBeInTheDocument()
  })

  // Verifies the two-row header structure (logo row + children row)
  it('renders two bordered rows', () => {
    const { container } = render(
      <Header>
        <span>child</span>
      </Header>
    )
    const headerEl = container.querySelector('header')
    // First div = logo row, second div = children row
    const rows = headerEl?.querySelectorAll(':scope > div')
    expect(rows?.length).toBe(2)
  })

  // ── onLogoClick behavior ──

  // Without onLogoClick: logo is a plain <img>, no button wrapper
  it('does not wrap the logo in a button when onLogoClick is absent', () => {
    render(
      <Header>
        <span>child</span>
      </Header>
    )
    expect(screen.queryByRole('button', { name: 'Go to home' })).not.toBeInTheDocument()
  })

  // With onLogoClick: logo is wrapped in a button that fires the callback
  it('wraps the logo in a "Go to home" button when onLogoClick is provided', () => {
    render(
      <Header onLogoClick={vi.fn()}>
        <span>child</span>
      </Header>
    )
    expect(screen.getByRole('button', { name: 'Go to home' })).toBeInTheDocument()
  })

  it('fires onLogoClick when the logo button is clicked', () => {
    const onLogoClick = vi.fn()
    render(
      <Header onLogoClick={onLogoClick}>
        <span>child</span>
      </Header>
    )
    fireEvent.click(screen.getByRole('button', { name: 'Go to home' }))
    expect(onLogoClick).toHaveBeenCalledTimes(1)
  })

  // Snapshot regression guard
  it('should match the snapshot', () => {
    const { container } = render(
      <Header>
        <span>child content</span>
      </Header>
    )
    expect(container.firstChild).toMatchSnapshot()
  })
})
