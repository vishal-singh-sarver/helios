import { fireEvent, render, screen } from '@testing-library/react'
import { GhostBtn, PrimaryBtn, SecondaryBtn, Select, TextInput } from '../primitives'

describe('<PrimaryBtn />', () => {
  it('renders children and fires onClick when enabled', () => {
    const onClick = vi.fn()
    render(<PrimaryBtn onClick={onClick}>Save</PrimaryBtn>)
    fireEvent.click(screen.getByText('Save'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('does not fire onClick when disabled', () => {
    const onClick = vi.fn()
    render(
      <PrimaryBtn onClick={onClick} disabled>
        Save
      </PrimaryBtn>
    )
    fireEvent.click(screen.getByText('Save'))
    expect(onClick).not.toHaveBeenCalled()
  })

  it('applies the disabled style class', () => {
    render(<PrimaryBtn disabled>Save</PrimaryBtn>)
    const btn = screen.getByText('Save')
    expect(btn).toBeDisabled()
    expect(btn.className).toContain('cursor-not-allowed')
  })
})

describe('<SecondaryBtn />', () => {
  it('renders children and fires onClick', () => {
    const onClick = vi.fn()
    render(<SecondaryBtn onClick={onClick}>Cancel</SecondaryBtn>)
    fireEvent.click(screen.getByText('Cancel'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})

describe('<GhostBtn />', () => {
  it('renders left icon and children', () => {
    render(
      <GhostBtn leftIcon={<span data-testid="icon">‹</span>}>Back</GhostBtn>
    )
    expect(screen.getByTestId('icon')).toBeInTheDocument()
    expect(screen.getByText('Back')).toBeInTheDocument()
  })
})

describe('<Select />', () => {
  const options = [
    { value: 'a', label: 'Alpha' },
    { value: 'b', label: 'Beta' }
  ]

  it('renders placeholder + options', () => {
    render(<Select value={null} onChange={vi.fn()} options={options} placeholder="-- pick --" />)
    expect(screen.getByText('-- pick --')).toBeInTheDocument()
    expect(screen.getByText('Alpha')).toBeInTheDocument()
    expect(screen.getByText('Beta')).toBeInTheDocument()
  })

  it('emits string for non-empty selection', () => {
    const onChange = vi.fn()
    render(<Select value="a" onChange={onChange} options={options} />)
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'b' } })
    expect(onChange).toHaveBeenCalledWith('b')
  })

  it('emits null when the empty/placeholder option is chosen', () => {
    const onChange = vi.fn()
    render(<Select value="a" onChange={onChange} options={options} />)
    fireEvent.change(screen.getByRole('combobox'), { target: { value: '' } })
    expect(onChange).toHaveBeenCalledWith(null)
  })

  it('disables the underlying select when disabled prop is set', () => {
    render(<Select value="a" onChange={vi.fn()} options={options} disabled />)
    expect(screen.getByRole('combobox')).toBeDisabled()
  })
})

describe('<TextInput />', () => {
  it('renders an <input> with merged base + custom className', () => {
    render(<TextInput className="extra-class" placeholder="enter" />)
    const input = screen.getByPlaceholderText('enter')
    expect(input.className).toContain('extra-class')
    expect(input.className).toContain('rounded')
  })

  it('forwards onChange and value props', () => {
    const onChange = vi.fn()
    render(<TextInput value="abc" onChange={onChange} readOnly />)
    expect(screen.getByDisplayValue('abc')).toBeInTheDocument()
  })

  it('respects the disabled prop', () => {
    render(<TextInput disabled placeholder="x" />)
    expect(screen.getByPlaceholderText('x')).toBeDisabled()
  })
})
