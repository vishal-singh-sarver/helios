import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Tooltip from '../index'

describe('<Tooltip />', () => {
  const defaultProps = {
    text: 'Help text here',
    ariaLabel: 'Show help'
  }

  it('renders without error', () => {
    render(<Tooltip {...defaultProps} />)
  })

  it('renders the trigger with correct label', () => {
    render(<Tooltip {...defaultProps} />)
    expect(screen.getByLabelText('Show help')).toHaveTextContent('?')
  })

  it('renders tooltip text in the DOM', () => {
    render(<Tooltip {...defaultProps} />)
    expect(screen.getByRole('tooltip')).toHaveTextContent('Help text here')
  })

  it('shows tooltip on hover', async () => {
    render(<Tooltip {...defaultProps} />)

    const trigger = screen.getByLabelText('Show help')
    const tooltip = screen.getByRole('tooltip')

    await userEvent.hover(trigger)

    expect(tooltip).toBeInTheDocument()
  })
})
