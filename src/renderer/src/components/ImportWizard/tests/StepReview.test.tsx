import { fireEvent, render, screen } from '@testing-library/react'
import StepReview from '../StepReview'
import type { ParseResult } from 'containers/Weather/parsers'

const parsed: ParseResult = {
  format: 'csv',
  delimiter: ',',
  headerLinesToSkip: 0,
  headers: ['Date', 'Time', 'temp', 'humidity'],
  rows: [
    ['26/02/2026', '10:00', '22.5', '65'],
    ['26/02/2026', '11:00', '23.7', '62']
  ]
}

const parsedDateTimes = [
  new Date(2026, 1, 26, 10, 0, 0),
  new Date(2026, 1, 26, 11, 0, 0)
]

describe('<StepReview />', () => {
  const baseProps = {
    parsed,
    parsedDateTimes,
    dtColumns: ['Date', 'Time'],
    columnSelection: {} as Record<number, boolean>,
    disabledColumnIndices: [] as number[],
    onToggleColumn: vi.fn()
  }

  it('renders the synthetic Date-Time row, marked required', () => {
    render(<StepReview {...baseProps} />)
    expect(screen.getByText('Date-Time')).toBeInTheDocument()
    expect(screen.getByText('(required)')).toBeInTheDocument()
  })

  it('omits columns that are part of the date/time mapping', () => {
    render(<StepReview {...baseProps} />)
    // Date and Time should NOT appear as their own rows (they are folded into Date-Time)
    expect(screen.queryByText('Date')).not.toBeInTheDocument()
    expect(screen.queryByText('Time')).not.toBeInTheDocument()
  })

  it('renders user-selectable columns with their first 3 example values', () => {
    render(<StepReview {...baseProps} />)
    expect(screen.getByText('temp')).toBeInTheDocument()
    expect(screen.getByText('humidity')).toBeInTheDocument()
    // Examples joined by comma
    expect(screen.getByText(/22\.5, 23\.7/)).toBeInTheDocument()
  })

  it('checkboxes default to checked when columnSelection has no entry', () => {
    render(<StepReview {...baseProps} />)
    const checkboxes = screen.getAllByRole('checkbox')
    // First checkbox is the disabled Date-Time one — skip it
    const userCheckboxes = checkboxes.slice(1)
    userCheckboxes.forEach((cb) => expect(cb).toBeChecked())
  })

  it('reflects columnSelection: false → unchecked', () => {
    render(<StepReview {...baseProps} columnSelection={{ 2: false }} />)
    const checkboxes = screen.getAllByRole('checkbox')
    // Index 2 in headers is "temp" — first user column → second checkbox overall
    expect(checkboxes[1]).not.toBeChecked()
  })

  it('clicking a column checkbox calls onToggleColumn with the index', () => {
    const onToggleColumn = vi.fn()
    render(<StepReview {...baseProps} onToggleColumn={onToggleColumn} />)
    const checkboxes = screen.getAllByRole('checkbox')
    fireEvent.click(checkboxes[1]) // first user-row (temp at index 2)
    expect(onToggleColumn).toHaveBeenCalledWith(2)
  })

  it('Date-Time checkbox is disabled and cannot be unchecked', () => {
    render(<StepReview {...baseProps} />)
    const dtCheckbox = screen.getAllByRole('checkbox')[0]
    expect(dtCheckbox).toBeDisabled()
    expect(dtCheckbox).toBeChecked()
  })

  it('shows the first 3 parsed Date-Time values as a preview', () => {
    render(<StepReview {...baseProps} />)
    expect(screen.getByText(/26\/02\/2026/)).toBeInTheDocument()
  })

  it('shows "Invalid" in the Date-Time preview when a parsed date is null', () => {
    render(<StepReview {...baseProps} parsedDateTimes={[null, null]} />)
    expect(screen.getByText(/Invalid, Invalid/)).toBeInTheDocument()
  })

  it('renders unsupported columns as unchecked and disabled with a message', () => {
    render(<StepReview {...baseProps} disabledColumnIndices={[2]} />)
    expect(
      screen.getByText('Character based columns have been disabled as that input is not supported.')
    ).toBeInTheDocument()

    const checkboxes = screen.getAllByRole('checkbox')
    expect(checkboxes[1]).toBeDisabled()
    expect(checkboxes[1]).not.toBeChecked()
  })
})
