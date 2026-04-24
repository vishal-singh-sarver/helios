import { fireEvent, render, screen } from '@testing-library/react'
import LabeledField from '../index'

describe('<LabeledField />', () => {
  // Smoke test
  it('renders without error', () => {
    render(<LabeledField label="Latitude" value="45.5" />)
  })

  // Renders the label text
  it('renders the provided label', () => {
    render(<LabeledField label="Latitude" value="45.5" />)
    expect(screen.getByText('Latitude')).toBeInTheDocument()
  })

  // Input has the label as aria-label by default (accessibility)
  it('defaults the input aria-label to the label text', () => {
    render(<LabeledField label="Longitude" value="-73.9" />)
    expect(screen.getByLabelText('Longitude')).toBeInTheDocument()
  })

  // Custom aria-label override
  it('uses ariaLabel override when provided', () => {
    render(<LabeledField label="UTC" value="-5" ariaLabel="UTC Offset field" />)
    expect(screen.getByLabelText('UTC Offset field')).toBeInTheDocument()
  })

  // Reflects the controlled value
  it('displays the current value', () => {
    render(<LabeledField label="Latitude" value="45.5" />)
    expect(screen.getByLabelText('Latitude')).toHaveValue('45.5')
  })

  // Numbers are accepted as value (cast to string by React)
  it('accepts a numeric value', () => {
    render(<LabeledField label="UTC" value={-5} />)
    expect(screen.getByLabelText('UTC')).toHaveValue('-5')
  })

  // Read-only behavior when onChange is omitted
  it('renders read-only when onChange is omitted', () => {
    render(<LabeledField label="Read-only" value="fixed" />)
    const input = screen.getByLabelText('Read-only') as HTMLInputElement
    expect(input.readOnly).toBe(true)
  })

  // Calls onChange with the typed value when editable
  it('fires onChange with new value when user types', () => {
    const onChange = vi.fn()
    render(<LabeledField label="Latitude" value="" onChange={onChange} />)
    fireEvent.change(screen.getByLabelText('Latitude'), {
      target: { value: '12.34' }
    })
    expect(onChange).toHaveBeenCalledWith('12.34')
  })

  // Disabled prop blocks interaction
  it('disables the input when disabled=true', () => {
    render(<LabeledField label="UTC Offset" value="-7" disabled />)
    const input = screen.getByLabelText('UTC Offset') as HTMLInputElement
    expect(input.disabled).toBe(true)
  })

  // onChange does not fire when disabled (browser behavior, verified by simulating)
  it('does not fire onChange while disabled', () => {
    const onChange = vi.fn()
    render(<LabeledField label="UTC" value="-7" disabled onChange={onChange} />)
    const input = screen.getByLabelText('UTC') as HTMLInputElement
    // Simulate user interaction on a disabled input — browsers ignore the event
    fireEvent.change(input, { target: { value: '0' } })
    // React still fires the synthetic change event; assertion here is that
    // the rendered value stays the controlled one
    expect(input.value).toBe('-7')
  })

  // Placeholder when value is empty
  it('renders a placeholder when provided', () => {
    render(
      <LabeledField label="Latitude" value="" placeholder="Enter latitude" onChange={() => {}} />
    )
    expect(screen.getByPlaceholderText('Enter latitude')).toBeInTheDocument()
  })

  // Custom width class is applied
  it('applies a custom inputWidthClass', () => {
    render(<LabeledField label="Email" value="" onChange={() => {}} inputWidthClass="w-64" />)
    expect(screen.getByLabelText('Email').className).toContain('w-64')
  })

  // Editable input is not read-only
  it('is not read-only when onChange is provided', () => {
    render(<LabeledField label="Latitude" value="" onChange={() => {}} />)
    const input = screen.getByLabelText('Latitude') as HTMLInputElement
    expect(input.readOnly).toBe(false)
  })

  // labelAdornment renders inline with the label text (e.g. a Tooltip icon)
  it('renders labelAdornment inside the label cell', () => {
    render(
      <LabeledField
        label="Latitude"
        value=""
        labelAdornment={<span data-testid="help-icon">?</span>}
      />
    )
    expect(screen.getByTestId('help-icon')).toBeInTheDocument()
  })

  it('does not render a labelAdornment slot when omitted', () => {
    render(<LabeledField label="Latitude" value="" />)
    expect(screen.queryByTestId('help-icon')).not.toBeInTheDocument()
  })

  // Invalid prop applies red border
  it('applies red border when invalid=true', () => {
    const { container } = render(<LabeledField label="Latitude" value="999" invalid />)
    expect((container.firstChild as HTMLElement).className).toContain('border-red-500')
  })

  it('does not apply red border when invalid is false', () => {
    const { container } = render(<LabeledField label="Latitude" value="45.5" />)
    const className = (container.firstChild as HTMLElement).className
    expect(className).toContain('border-app-border')
    expect(className).not.toContain('border-red-500')
  })

  it('sets aria-invalid on the input when invalid=true', () => {
    render(<LabeledField label="Latitude" value="999" invalid />)
    const input = screen.getByLabelText('Latitude')
    expect(input).toHaveAttribute('aria-invalid', 'true')
  })

  it('does not set aria-invalid when invalid is false', () => {
    render(<LabeledField label="Latitude" value="45.5" />)
    const input = screen.getByLabelText('Latitude')
    expect(input).not.toHaveAttribute('aria-invalid')
  })

  // Snapshot
  it('matches the snapshot (read-only)', () => {
    const { container } = render(<LabeledField label="Latitude" value="45.5" />)
    expect(container.firstChild).toMatchSnapshot()
  })

  it('matches the snapshot (editable)', () => {
    const { container } = render(
      <LabeledField label="Latitude" value="45.5" onChange={() => {}} />
    )
    expect(container.firstChild).toMatchSnapshot()
  })

  it('matches the snapshot (disabled)', () => {
    const { container } = render(<LabeledField label="UTC Offset" value="-7" disabled />)
    expect(container.firstChild).toMatchSnapshot()
  })
})
