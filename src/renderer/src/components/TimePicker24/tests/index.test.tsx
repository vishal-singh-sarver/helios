import { fireEvent, render, screen, within } from '@testing-library/react'
import TimePicker24 from '../index'

describe('<TimePicker24 />', () => {
  beforeEach(() => {
    // jsdom doesn't implement scrollIntoView; the picker calls it on mount.
    Element.prototype.scrollIntoView = vi.fn()
  })

  it('renders 24 hour options', () => {
    render(<TimePicker24 value="" onChange={vi.fn()} />)
    const hoursList = screen.getByRole('listbox', { name: 'Hours' })
    expect(within(hoursList).getAllByRole('option')).toHaveLength(24)
  })

  it('has only the Hours listbox (no minutes)', () => {
    render(<TimePicker24 value="" onChange={vi.fn()} />)
    expect(screen.getByRole('listbox', { name: 'Hours' })).toBeInTheDocument()
    expect(screen.queryByRole('listbox', { name: 'Minutes' })).not.toBeInTheDocument()
  })

  it('pads hours to two digits', () => {
    render(<TimePicker24 value="" onChange={vi.fn()} />)
    const hoursList = screen.getByRole('listbox', { name: 'Hours' })
    expect(within(hoursList).getByRole('button', { name: '00' })).toBeInTheDocument()
    expect(within(hoursList).getByRole('button', { name: '23' })).toBeInTheDocument()
  })

  it('does not include hours above 23', () => {
    render(<TimePicker24 value="" onChange={vi.fn()} />)
    const hoursList = screen.getByRole('listbox', { name: 'Hours' })
    expect(within(hoursList).queryByRole('button', { name: '24' })).not.toBeInTheDocument()
  })

  it('marks the current hour as selected when value is valid', () => {
    render(<TimePicker24 value="14:30" onChange={vi.fn()} />)
    const hoursList = screen.getByRole('listbox', { name: 'Hours' })
    expect(within(hoursList).getByRole('option', { selected: true })).toHaveTextContent('14')
  })

  it('has no selection when value is empty or malformed', () => {
    render(<TimePicker24 value="" onChange={vi.fn()} />)
    expect(screen.queryByRole('option', { selected: true })).not.toBeInTheDocument()
  })

  it('calls onChange with HH:00 when an hour is picked', () => {
    const onChange = vi.fn()
    render(<TimePicker24 value="10:45" onChange={onChange} />)
    const hoursList = screen.getByRole('listbox', { name: 'Hours' })
    fireEvent.click(within(hoursList).getByRole('button', { name: '07' }))
    expect(onChange).toHaveBeenCalledWith('07:00')
  })

  it('zeroes out minutes on every hour pick, even when the previous value had minutes', () => {
    const onChange = vi.fn()
    render(<TimePicker24 value="23:59" onChange={onChange} />)
    const hoursList = screen.getByRole('listbox', { name: 'Hours' })
    fireEvent.click(within(hoursList).getByRole('button', { name: '09' }))
    expect(onChange).toHaveBeenCalledWith('09:00')
  })
})
