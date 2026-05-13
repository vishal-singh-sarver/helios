import { fireEvent, render, screen, within } from '@testing-library/react'
import { INITIAL_MAPPING, type DateTimeMapping, type ParseResult } from 'containers/Weather/parsers'
import StepDateTime from '../StepDateTime'

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

const group3Parsed: ParseResult = {
  format: 'csv',
  delimiter: ',',
  headerLinesToSkip: 0,
  headers: ['Timestamp', 'temp'],
  rows: [
    ['2026-02-26T10:00:00Z', '22.5'],
    ['2026-02-26T11:15:00Z', '23.7']
  ]
}

const group3Mapping: DateTimeMapping = {
  ...INITIAL_MAPPING,
  datetime: 'Timestamp'
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
        datetimeFormat="YYYY-MM-DDTHH:MM:SSZ"
        onChangeDateTimeFormat={vi.fn()}
        stats={baseStats}
      />
    )
    expect(screen.getAllByText('year').length).toBeGreaterThan(0)
    expect(screen.getAllByText('month').length).toBeGreaterThan(0)
    expect(screen.getAllByText('day').length).toBeGreaterThan(0)
    expect(screen.getAllByText('hour').length).toBeGreaterThan(0)
    expect(screen.getAllByText('minute').length).toBeGreaterThan(0)
  })

  it('renders all three date/time mapping sections on one page', () => {
    render(
      <StepDateTime
        parsed={group2Parsed}
        mode="group2"
        onChangeMode={vi.fn()}
        mapping={group2Mapping}
        onChangeMapping={vi.fn()}
        dateFormat="DD/MM/YYYY"
        onChangeDateFormat={vi.fn()}
        datetimeFormat="YYYY-MM-DDTHH:MM:SSZ"
        onChangeDateTimeFormat={vi.fn()}
        stats={baseStats}
      />
    )
    expect(screen.getAllByText('year').length).toBeGreaterThan(0)
    expect(screen.getByText('date')).toBeInTheDocument()
    expect(screen.getByText('date-time')).toBeInTheDocument()
  })

  it('clicking another card calls onChangeMode', () => {
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
        datetimeFormat="YYYY-MM-DDTHH:MM:SSZ"
        onChangeDateTimeFormat={vi.fn()}
        stats={baseStats}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: /year/i }))
    expect(onChangeMode).toHaveBeenCalledWith('group1')
  })

  it('disables controls in unselected cards', () => {
    render(
      <StepDateTime
        parsed={group2Parsed}
        mode="group2"
        onChangeMode={vi.fn()}
        mapping={group2Mapping}
        onChangeMapping={vi.fn()}
        dateFormat="DD/MM/YYYY"
        onChangeDateFormat={vi.fn()}
        datetimeFormat="YYYY-MM-DDTHH:MM:SSZ"
        onChangeDateTimeFormat={vi.fn()}
        stats={baseStats}
      />
    )

    const yearCard = screen.getByRole('button', { name: /year/i })
    const dateCard = screen.getByRole('button', {
      name: /date dd\/mm\/yyyy/i
    })

    const dateTimeCard = screen.getByRole('button', {
      name: /date-time yyyy-mm-ddthh:mm:ssz/i
    })

    within(yearCard)
      .getAllByRole('combobox')
      .forEach((select) => expect(select).toBeDisabled())
    within(dateCard)
      .getAllByRole('combobox')
      .forEach((select) => expect(select).not.toBeDisabled())
    within(dateTimeCard)
      .getAllByRole('combobox')
      .forEach((select) => expect(select).toBeDisabled())
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
        datetimeFormat="YYYY-MM-DDTHH:MM:SSZ"
        onChangeDateTimeFormat={vi.fn()}
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
        datetimeFormat="YYYY-MM-DDTHH:MM:SSZ"
        onChangeDateTimeFormat={vi.fn()}
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
        datetimeFormat="YYYY-MM-DDTHH:MM:SSZ"
        onChangeDateTimeFormat={vi.fn()}
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
        datetimeFormat="YYYY-MM-DDTHH:MM:SSZ"
        onChangeDateTimeFormat={vi.fn()}
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
        datetimeFormat="YYYY-MM-DDTHH:MM:SSZ"
        onChangeDateTimeFormat={vi.fn()}
        stats={{ configReady: true, valid: 1, invalid: 1, total: 2 }}
      />
    )
    expect(screen.getByText(/1 of 2 valid/)).toBeInTheDocument()
    expect(screen.getByText(/1 will import as Invalid/)).toBeInTheDocument()
  })

  it('renders combined Date-Time mode and previews ISO rows', () => {
    render(
      <StepDateTime
        parsed={group3Parsed}
        mode="group3"
        onChangeMode={vi.fn()}
        mapping={group3Mapping}
        onChangeMapping={vi.fn()}
        dateFormat="YYYY-MM-DD"
        onChangeDateFormat={vi.fn()}
        datetimeFormat="YYYY-MM-DDTHH:MM:SSZ"
        onChangeDateTimeFormat={vi.fn()}
        stats={{ configReady: true, valid: 2, invalid: 0, total: 2 }}
      />
    )

    expect(screen.getByText('date-time')).toBeInTheDocument()
    expect(screen.getByText(/26\/02\/2026, 10:00/)).toBeInTheDocument()
  })
})
