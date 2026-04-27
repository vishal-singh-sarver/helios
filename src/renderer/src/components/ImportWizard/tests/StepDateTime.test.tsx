import { fireEvent, render, screen } from '@testing-library/react'
import StepDateTime from '../StepDateTime'
import {
  INITIAL_MAPPING,
  type DateTimeMapping,
  type ParseResult
} from 'containers/Weather/parsers'

const group1Parsed: ParseResult = {
  format: 'csv',
  delimiter: ',',
  headerLinesToSkip: 0,
  headers: ['year', 'month', 'day', 'hour', 'minute'],
  rows: [
    ['2026', '2', '26', '10', '0'],
    ['2026', '2', '26', '11', '0']
  ]
}

const group1Mapping: DateTimeMapping = {
  ...INITIAL_MAPPING,
  year: 'year',
  month: 'month',
  day: 'day',
  hour: 'hour',
  minute: 'minute'
}

const group2Parsed: ParseResult = {
  format: 'csv',
  delimiter: ',',
  headerLinesToSkip: 0,
  headers: ['Date', 'Time', 'temp'],
  rows: [
    ['26/02/2026', '10:00', '22.5'],
    ['26/02/2026', '99:99', '23.7']
  ]
}

const group2Mapping: DateTimeMapping = {
  ...INITIAL_MAPPING,
  date: 'Date',
  time: 'Time'
}

describe('<StepDateTime />', () => {
  const baseStats = { configReady: true, valid: 2, invalid: 0, total: 2 }

  it('renders all five Group 1 mapping rows', () => {
    render(
      <StepDateTime
        parsed={group1Parsed}
        mode="group1"
        onChangeMode={vi.fn()}
        mapping={group1Mapping}
        onChangeMapping={vi.fn()}
        dateFormat="YYYY-MM-DD"
        onChangeDateFormat={vi.fn()}
        stats={baseStats}
      />
    )
    expect(screen.getByText('year')).toBeInTheDocument()
    expect(screen.getByText('month')).toBeInTheDocument()
    expect(screen.getByText('day')).toBeInTheDocument()
    expect(screen.getByText('hour')).toBeInTheDocument()
    expect(screen.getByText('minute')).toBeInTheDocument()
  })

  it('renders Group 2 with Date format dropdown and Date column dropdown', () => {
    render(
      <StepDateTime
        parsed={group2Parsed}
        mode="group2"
        onChangeMode={vi.fn()}
        mapping={group2Mapping}
        onChangeMapping={vi.fn()}
        dateFormat="DD/MM/YYYY"
        onChangeDateFormat={vi.fn()}
        stats={baseStats}
      />
    )
    expect(screen.getByText('Date')).toBeInTheDocument()
    expect(screen.getByText('Time')).toBeInTheDocument()
  })

  it('switching mode calls onChangeMode', () => {
    const onChangeMode = vi.fn()
    render(
      <StepDateTime
        parsed={group2Parsed}
        mode="group2"
        onChangeMode={onChangeMode}
        mapping={group2Mapping}
        onChangeMapping={vi.fn()}
        dateFormat="DD/MM/YYYY"
        onChangeDateFormat={vi.fn()}
        stats={baseStats}
      />
    )
    fireEvent.click(screen.getByLabelText(/Group 1/))
    expect(onChangeMode).toHaveBeenCalledWith('group1')
  })

  it('shows formatted parsed Date-Time in 24-hour for valid rows', () => {
    render(
      <StepDateTime
        parsed={group2Parsed}
        mode="group2"
        onChangeMode={vi.fn()}
        mapping={group2Mapping}
        onChangeMapping={vi.fn()}
        dateFormat="DD/MM/YYYY"
        onChangeDateFormat={vi.fn()}
        stats={baseStats}
      />
    )
    // Row 1 has "26/02/2026 10:00" → "26/02/2026, 10:00"
    expect(screen.getByText(/26\/02\/2026, 10:00/)).toBeInTheDocument()
  })

  it('shows "Invalid time format" when time is unparseable but date is OK', () => {
    render(
      <StepDateTime
        parsed={group2Parsed}
        mode="group2"
        onChangeMode={vi.fn()}
        mapping={group2Mapping}
        onChangeMapping={vi.fn()}
        dateFormat="DD/MM/YYYY"
        onChangeDateFormat={vi.fn()}
        stats={baseStats}
      />
    )
    expect(screen.getByText('Invalid time format')).toBeInTheDocument()
  })

  it('shows "Invalid" when the date itself is unparseable', () => {
    const badDate: ParseResult = {
      ...group2Parsed,
      rows: [['garbage-date', '10:00', '22.5']]
    }
    render(
      <StepDateTime
        parsed={badDate}
        mode="group2"
        onChangeMode={vi.fn()}
        mapping={group2Mapping}
        onChangeMapping={vi.fn()}
        dateFormat="DD/MM/YYYY"
        onChangeDateFormat={vi.fn()}
        stats={{ configReady: true, valid: 0, invalid: 1, total: 1 }}
      />
    )
    expect(screen.getByText('Invalid')).toBeInTheDocument()
  })

  it('renders the "All rows valid" badge when invalid count is 0', () => {
    render(
      <StepDateTime
        parsed={group1Parsed}
        mode="group1"
        onChangeMode={vi.fn()}
        mapping={group1Mapping}
        onChangeMapping={vi.fn()}
        dateFormat="YYYY-MM-DD"
        onChangeDateFormat={vi.fn()}
        stats={{ configReady: true, valid: 2, invalid: 0, total: 2 }}
      />
    )
    expect(screen.getByText(/All 2 rows valid/)).toBeInTheDocument()
  })

  it('renders the partial-valid banner when there is a mix', () => {
    render(
      <StepDateTime
        parsed={group2Parsed}
        mode="group2"
        onChangeMode={vi.fn()}
        mapping={group2Mapping}
        onChangeMapping={vi.fn()}
        dateFormat="DD/MM/YYYY"
        onChangeDateFormat={vi.fn()}
        stats={{ configReady: true, valid: 1, invalid: 1, total: 2 }}
      />
    )
    expect(screen.getByText(/1 of 2 valid/)).toBeInTheDocument()
    expect(screen.getByText(/1 will import as Invalid/)).toBeInTheDocument()
  })
})
