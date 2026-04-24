import { render, screen } from '@testing-library/react'
import Tooltip from '../index'

describe('<Tooltip />', () => {
  const defaultProps = {
    text: 'Help text here',
    ariaLabel: 'Show help'
  }

  it('renders without error', () => {
    render(<Tooltip {...defaultProps} />)
  })

  it('renders the trigger with correct label and "?" glyph', () => {
    render(<Tooltip {...defaultProps} />)
    expect(screen.getByLabelText('Show help')).toHaveTextContent('?')
  })

  it('wires the trigger with data-tooltip-* attributes for react-tooltip', () => {
    render(<Tooltip {...defaultProps} />)
    const trigger = screen.getByLabelText('Show help')

    // react-tooltip matches a tooltip bubble to its trigger via these attrs.
    expect(trigger).toHaveAttribute('data-tooltip-content', 'Help text here')
    expect(trigger.getAttribute('data-tooltip-id')).toBeTruthy()
  })

  it('makes the trigger keyboard-focusable', () => {
    render(<Tooltip {...defaultProps} />)
    expect(screen.getByLabelText('Show help')).toHaveAttribute('tabindex', '0')
  })
})
