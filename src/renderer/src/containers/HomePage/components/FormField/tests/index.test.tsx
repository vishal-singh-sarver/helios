import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FormField from '../index'

describe('<FormField />', () => {
  it('renders label, required marker, and input value', () => {
    render(
      <FormField
        label="Latitude"
        value="12.3"
        helpText="Latitude help text"
        isHelpVisible={false}
        helpAriaLabel="Show latitude help"
        onChange={vi.fn()}
        onHelpChange={vi.fn()}
      />
    )

    expect(screen.getByText('Latitude')).toBeInTheDocument()
    expect(screen.getByText('*')).toBeInTheDocument()
    expect(screen.getByDisplayValue('12.3')).toBeInTheDocument()
  })

  it('calls onChange when the input changes', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    render(
      <FormField
        label="Latitude"
        value=""
        helpText="Latitude help text"
        isHelpVisible={false}
        helpAriaLabel="Show latitude help"
        onChange={onChange}
        onHelpChange={vi.fn()}
      />
    )

    await user.type(screen.getByPlaceholderText('Enter'), '45')

    expect(onChange).toHaveBeenCalled()
    expect(onChange).toHaveBeenLastCalledWith('5')
  })

  it('shows tooltip and validation error from props', () => {
    render(
      <FormField
        label="Latitude"
        value=""
        error="Latitude is invalid"
        helpText="Latitude help text"
        isHelpVisible
        helpAriaLabel="Show latitude help"
        onChange={vi.fn()}
        onHelpChange={vi.fn()}
      />
    )

    expect(screen.getByRole('tooltip')).toHaveTextContent('Latitude help text')
    expect(screen.getByText('Latitude is invalid')).toBeInTheDocument()
  })

  it('calls onHelpChange on hover and unhover', async () => {
    const user = userEvent.setup()
    const onHelpChange = vi.fn()

    render(
      <FormField
        label="Latitude"
        value=""
        helpText="Latitude help text"
        isHelpVisible={false}
        helpAriaLabel="Show latitude help"
        onChange={vi.fn()}
        onHelpChange={onHelpChange}
      />
    )

    const helpButton = screen.getByRole('button', { name: 'Show latitude help' })
    await user.hover(helpButton)
    await user.unhover(helpButton)

    expect(onHelpChange).toHaveBeenNthCalledWith(1, true)
    expect(onHelpChange).toHaveBeenNthCalledWith(2, false)
  })
})
