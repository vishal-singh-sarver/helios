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
        dateMode="parts"
        onChangeDateMode={vi.fn()}
        timeMode="parts"
        onChangeTimeMode={vi.fn()}
        mapping={group1Mapping}
        onChangeMapping={vi.fn()}
        dateFormat="YYYY-MM-DD"
        onChangeDateFormat={vi.fn()}
        datetimeFormat="YYYY-MM-DDTHH:MM:SSZ"
        onChangeDateTimeFormat={vi.fn()}
        stats={baseStats}
      />
    )
    expect(screen.getByText('Day')).toBeInTheDocument()
    expect(screen.getByText('Month')).toBeInTheDocument()
    expect(screen.getByText('Year')).toBeInTheDocument()
    expect(screen.getByText('Hour')).toBeInTheDocument()
    expect(screen.getByText('Minute')).toBeInTheDocument()
  })

  it('renders all three date/time mapping sections on one page', () => {
    render(
      <StepDateTime
        parsed={group2Parsed}
        dateMode="string"
        onChangeDateMode={vi.fn()}
        timeMode="string"
        onChangeTimeMode={vi.fn()}
        mapping={group2Mapping}
        onChangeMapping={vi.fn()}
        dateFormat="DD/MM/YYYY"
        onChangeDateFormat={vi.fn()}
        datetimeFormat="YYYY-MM-DDTHH:MM:SSZ"
        onChangeDateTimeFormat={vi.fn()}
        stats={baseStats}
      />
    )
    expect(screen.getByText('Year')).toBeInTheDocument()
    expect(screen.getByText('Date String')).toBeInTheDocument()
    expect(screen.getByText('Date-Time')).toBeInTheDocument()
  })

  it('clicking another card calls onChangeDateMode', () => {
    const onChangeDateMode = vi.fn()
    render(
      <StepDateTime
        parsed={group2Parsed}
        dateMode="string"
        onChangeDateMode={onChangeDateMode}
        timeMode="string"
        onChangeTimeMode={vi.fn()}
        mapping={group2Mapping}
        onChangeMapping={vi.fn()}
        dateFormat="DD/MM/YYYY"
        onChangeDateFormat={vi.fn()}
        datetimeFormat="YYYY-MM-DDTHH:MM:SSZ"
        onChangeDateTimeFormat={vi.fn()}
        stats={baseStats}
      />
    )
    const partsCard = screen.getByLabelText('day month year')
    const grid = partsCard.closest('.grid') as HTMLElement
    fireEvent.click(within(grid).getByRole('button'))
    expect(onChangeDateMode).toHaveBeenCalledWith('parts')
  })

  it('disables controls in unselected date cards', () => {
    render(
      <StepDateTime
        parsed={group2Parsed}
        dateMode="string"
        onChangeDateMode={vi.fn()}
        timeMode="string"
        onChangeTimeMode={vi.fn()}
        mapping={group2Mapping}
        onChangeMapping={vi.fn()}
        dateFormat="DD/MM/YYYY"
        onChangeDateFormat={vi.fn()}
        datetimeFormat="YYYY-MM-DDTHH:MM:SSZ"
        onChangeDateTimeFormat={vi.fn()}
        stats={baseStats}
      />
    )

    const partsCard = screen.getByLabelText('day month year')
    const dateStringCard = screen.getByLabelText('date string')
    const dateTimeCard = screen.getByLabelText('date-time')

    within(partsCard)
      .getAllByRole('combobox')
      .forEach((select) => expect(select).toBeDisabled())
    within(dateStringCard)
      .getAllByRole('combobox')
      .forEach((select) => expect(select).not.toBeDisabled())
    within(dateTimeCard)
      .getAllByRole('combobox')
      .forEach((select) => expect(select).toBeDisabled())
  })

  it('shows formatted parsed Date-Time in the preview for valid rows', () => {
    render(
      <StepDateTime
        parsed={group2Parsed}
        dateMode="string"
        onChangeDateMode={vi.fn()}
        timeMode="string"
        onChangeTimeMode={vi.fn()}
        mapping={group2Mapping}
        onChangeMapping={vi.fn()}
        dateFormat="DD/MM/YYYY"
        onChangeDateFormat={vi.fn()}
        datetimeFormat="YYYY-MM-DDTHH:MM:SSZ"
        onChangeDateTimeFormat={vi.fn()}
        stats={baseStats}
      />
    )
    // Row 1 has "26/02/2026 10:00" → formatted via en-US locale
    expect(screen.getByText(/2\/26\/2026, 10:00:00\s*AM/)).toBeInTheDocument()
  })

  it('shows "Invalid time format" when time is unparseable but date is OK', () => {
    render(
      <StepDateTime
        parsed={group2Parsed}
        dateMode="string"
        onChangeDateMode={vi.fn()}
        timeMode="string"
        onChangeTimeMode={vi.fn()}
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
        dateMode="string"
        onChangeDateMode={vi.fn()}
        timeMode="string"
        onChangeTimeMode={vi.fn()}
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
        dateMode="parts"
        onChangeDateMode={vi.fn()}
        timeMode="parts"
        onChangeTimeMode={vi.fn()}
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
        dateMode="string"
        onChangeDateMode={vi.fn()}
        timeMode="string"
        onChangeTimeMode={vi.fn()}
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
    expect(screen.getByText(/1 invalid/)).toBeInTheDocument()
  })

  it('renders combined Date-Time mode and previews ISO rows', () => {
    render(
      <StepDateTime
        parsed={group3Parsed}
        dateMode="datetime"
        onChangeDateMode={vi.fn()}
        timeMode="none"
        onChangeTimeMode={vi.fn()}
        mapping={group3Mapping}
        onChangeMapping={vi.fn()}
        dateFormat="YYYY-MM-DD"
        onChangeDateFormat={vi.fn()}
        datetimeFormat="YYYY-MM-DDTHH:MM:SSZ"
        onChangeDateTimeFormat={vi.fn()}
        stats={{ configReady: true, valid: 2, invalid: 0, total: 2 }}
      />
    )

    expect(screen.getByLabelText('date-time')).toBeInTheDocument()
    expect(screen.getAllByText(/2\/26\/2026/).length).toBeGreaterThan(0)
  })
})
