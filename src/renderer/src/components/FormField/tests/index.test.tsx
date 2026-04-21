import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import FormField from '../index'

// Mock Tooltip to isolate FormField — Tooltip has its own tests
vi.mock('../../Tooltip', () => ({
  default: ({ text, ariaLabel }: { text: string; ariaLabel: string }) => (
    <span data-testid="tooltip" aria-label={ariaLabel}>
      {text}
    </span>
  )
}))

describe('<FormField />', () => {
  const defaultProps = {
    labelProps: {
      label: 'Project Name',
      helpText: 'Enter a project name.',
      helpAriaLabel: 'Show project name help'
    },
    inputProps: {
      name: 'projectName',
      value: '',
      onChange: vi.fn(),
      onBlur: vi.fn()
    }
  }

  // Smoke test — component mounts without throwing
  it('renders without error', () => {
    render(<FormField {...defaultProps} />)
  })

  // Verifies the label text is rendered
  it('renders the label text', () => {
    render(<FormField {...defaultProps} />)
    expect(screen.getByText('Project Name')).toBeInTheDocument()
  })

  // Verifies the red asterisk indicating a required field is shown
  it('renders the required asterisk', () => {
    render(<FormField {...defaultProps} />)
    expect(screen.getByText('*')).toBeInTheDocument()
  })

  // Verifies the Tooltip child component is rendered
  it('renders the tooltip', () => {
    render(<FormField {...defaultProps} />)
    expect(screen.getByTestId('tooltip')).toBeInTheDocument()
  })

  // Verifies the input element has an id matching the name prop (for label association)
  it('renders an input with id matching name prop', () => {
    render(<FormField {...defaultProps} />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('id', 'projectName')
  })

  // Verifies the default placeholder is "Enter" when no custom placeholder is given
  it('renders with default placeholder', () => {
    render(<FormField {...defaultProps} />)
    expect(screen.getByPlaceholderText('Enter')).toBeInTheDocument()
  })

  // Verifies onChange callback fires when user types into the input
  it('calls onChange when user types', () => {
    const onChange = vi.fn()
    render(<FormField {...defaultProps} inputProps={{ ...defaultProps.inputProps, onChange }} />)
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Test' } })
    expect(onChange).toHaveBeenCalled()
  })

  // Verifies onBlur callback fires when input loses focus
  it('calls onBlur when input loses focus', () => {
    const onBlur = vi.fn()
    render(<FormField {...defaultProps} inputProps={{ ...defaultProps.inputProps, onBlur }} />)
    fireEvent.blur(screen.getByRole('textbox'))
    expect(onBlur).toHaveBeenCalled()
  })

  // Verifies no error message is shown when error prop is absent
  it('does not show error when error prop is absent', () => {
    render(<FormField {...defaultProps} />)
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  // Verifies the error message renders with role="alert" when error prop is provided
  it('shows error message when error prop is provided', () => {
    render(
      <FormField
        {...defaultProps}
        inputProps={{ ...defaultProps.inputProps, error: 'Name is required.' }}
      />
    )
    expect(screen.getByRole('alert')).toHaveTextContent('Name is required.')
  })

  // Verifies aria-invalid is set to true on the input when an error exists
  it('sets aria-invalid to true when error exists', () => {
    render(
      <FormField {...defaultProps} inputProps={{ ...defaultProps.inputProps, error: 'Required' }} />
    )
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true')
  })

  // Verifies aria-invalid is false when no error exists
  it('sets aria-invalid to false when no error', () => {
    render(<FormField {...defaultProps} />)
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'false')
  })

  // Verifies the input's aria-describedby points to the error element's id
  it('links input to error via aria-describedby', () => {
    render(
      <FormField {...defaultProps} inputProps={{ ...defaultProps.inputProps, error: 'Required' }} />
    )
    const input = screen.getByRole('textbox')
    const errorId = input.getAttribute('aria-describedby')
    expect(errorId).toBeTruthy()
    expect(screen.getByRole('alert')).toHaveAttribute('id', errorId)
  })

  // Verifies aria-describedby is not set when there is no error
  it('does not set aria-describedby when no error', () => {
    render(<FormField {...defaultProps} />)
    expect(screen.getByRole('textbox')).not.toHaveAttribute('aria-describedby')
  })

  // Verifies the input renders as type="number" when specified
  it('renders number type input when specified', () => {
    render(
      <FormField {...defaultProps} inputProps={{ ...defaultProps.inputProps, type: 'number' }} />
    )
    expect(screen.getByRole('spinbutton')).toHaveAttribute('type', 'number')
  })

  // Verifies the input is disabled when disabled prop is true
  it('disables input when disabled prop is true', () => {
    render(
      <FormField {...defaultProps} inputProps={{ ...defaultProps.inputProps, disabled: true }} />
    )
    expect(screen.getByRole('textbox')).toBeDisabled()
  })

  // Snapshot regression guard — default state (no error)
  it('should match the snapshot', () => {
    const { container } = render(<FormField {...defaultProps} />)
    expect(container.firstChild).toMatchSnapshot()
  })

  // Snapshot regression guard — error state
  it('should match the snapshot with error', () => {
    const { container } = render(
      <FormField {...defaultProps} inputProps={{ ...defaultProps.inputProps, error: 'Required' }} />
    )
    expect(container.firstChild).toMatchSnapshot()
  })
})
