import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import DateTimeHeader, { DATE_FORMAT_OPTIONS } from '../DateTimeHeader'

vi.mock('@renderer/assets/ChevronDownIcon.svg', () => ({ default: 'ChevronDownIcon.svg' }))

describe('<DateTimeHeader />', () => {
  afterEach(() => {
    cleanup()
  })

  it('exports the canonical DATE_FORMAT_OPTIONS list', () => {
    expect(DATE_FORMAT_OPTIONS).toContain('YYYY-MM-DDTHH:MM:SSZ')
    expect(DATE_FORMAT_OPTIONS.length).toBeGreaterThanOrEqual(8)
  })

  it('renders the trigger button labelled "Date-Time"', () => {
    render(<DateTimeHeader value={DATE_FORMAT_OPTIONS[0]} onChange={vi.fn()} />)
    expect(screen.getByRole('button', { name: /date-time/i })).toBeInTheDocument()
  })

  it('does not render the listbox by default', () => {
    render(<DateTimeHeader value={DATE_FORMAT_OPTIONS[0]} onChange={vi.fn()} />)
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('opens the listbox on trigger click and shows every option', () => {
    render(<DateTimeHeader value={DATE_FORMAT_OPTIONS[0]} onChange={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: /date-time/i }))
    expect(screen.getByRole('listbox')).toBeInTheDocument()
    for (const opt of DATE_FORMAT_OPTIONS) {
      expect(screen.getByRole('option', { name: opt })).toBeInTheDocument()
    }
  })

  it('marks the current value as aria-selected', () => {
    render(<DateTimeHeader value={DATE_FORMAT_OPTIONS[2]} onChange={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: /date-time/i }))
    expect(screen.getByRole('option', { name: DATE_FORMAT_OPTIONS[2] })).toHaveAttribute(
      'aria-selected',
      'true'
    )
  })

  it('calls onChange and closes the listbox when an option is picked', () => {
    const onChange = vi.fn()
    render(<DateTimeHeader value={DATE_FORMAT_OPTIONS[0]} onChange={onChange} />)
    fireEvent.click(screen.getByRole('button', { name: /date-time/i }))
    fireEvent.click(screen.getByRole('option', { name: DATE_FORMAT_OPTIONS[3] }))
    expect(onChange).toHaveBeenCalledWith(DATE_FORMAT_OPTIONS[3])
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('toggles closed when the trigger is clicked twice', () => {
    render(<DateTimeHeader value={DATE_FORMAT_OPTIONS[0]} onChange={vi.fn()} />)
    const btn = screen.getByRole('button', { name: /date-time/i })
    fireEvent.click(btn)
    fireEvent.click(btn)
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('closes when the user mousedowns outside the popover', () => {
    render(<DateTimeHeader value={DATE_FORMAT_OPTIONS[0]} onChange={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: /date-time/i }))
    fireEvent.mouseDown(document.body)
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })
})
