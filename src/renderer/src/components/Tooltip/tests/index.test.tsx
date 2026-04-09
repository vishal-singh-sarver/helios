// components/Tooltip/tests/index.test.tsx
import React from 'react'
import { render, screen } from '@testing-library/react'
import Tooltip from '../index'

describe('<Tooltip />', () => {
  const defaultProps = {
    text: 'Help text here',
    ariaLabel: 'Show help'
  }

  // Smoke test — component mounts without throwing
  it('renders without error', () => {
    render(<Tooltip {...defaultProps} />)
  })

  // Verifies the "?" icon is visible and associated with the correct aria-label
  it('renders the question mark trigger', () => {
    render(<Tooltip {...defaultProps} />)
    expect(screen.getByLabelText('Show help')).toHaveTextContent('?')
  })

  // Verifies the tooltip text is present in the DOM (hidden via CSS, but queryable)
  it('renders the tooltip text in the DOM', () => {
    render(<Tooltip {...defaultProps} />)
    expect(screen.getByRole('tooltip')).toHaveTextContent('Help text here')
  })

  // Snapshot regression guard — catches unintended markup changes
  it('should match the snapshot', () => {
    const { container } = render(<Tooltip {...defaultProps} />)
    expect(container.firstChild).toMatchSnapshot()
  })
})