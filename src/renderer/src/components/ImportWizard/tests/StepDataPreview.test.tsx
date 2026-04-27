import { fireEvent, render, screen } from '@testing-library/react'
import StepDataPreview from '../StepDataPreview'
import type { ParseResult } from 'containers/Weather/parsers'

const csvParsed: ParseResult = {
  format: 'csv',
  delimiter: ',',
  headerLinesToSkip: 0,
  headers: ['year', 'month', 'day', 'temp'],
  rows: [
    ['2026', '2', '26', '22.5'],
    ['2026', '2', '27', '23.7']
  ]
}

const xmlParsed: ParseResult = {
  format: 'xml',
  delimiter: '',
  headerLinesToSkip: 0,
  headers: ['Date', 'Time', 'temp'],
  rows: [['26/02/2026', '10:00', '22.5']]
}

describe('<StepDataPreview />', () => {
  const baseProps = {
    parsed: csvParsed,
    parseError: null,
    onChangeDelimiter: vi.fn(),
    onChangeSkip: vi.fn()
  }

  it('renders headers and preview rows', () => {
    render(<StepDataPreview {...baseProps} />)
    // Headers appear both in the preview table and the chip list — use getAllByText
    expect(screen.getAllByText('year').length).toBeGreaterThan(0)
    expect(screen.getAllByText('temp').length).toBeGreaterThan(0)
    expect(screen.getByText('22.5')).toBeInTheDocument()
    expect(screen.getByText('23.7')).toBeInTheDocument()
  })

  it('renders chip labels in the column labels preview', () => {
    render(<StepDataPreview {...baseProps} />)
    // Chips show plain header text (no positional prefix)
    expect(screen.getAllByText('year').length).toBeGreaterThan(0)
    expect(screen.getAllByText('month').length).toBeGreaterThan(0)
    expect(screen.getAllByText('day').length).toBeGreaterThan(0)
  })

  it('disables delimiter and skip inputs in XML mode', () => {
    render(<StepDataPreview {...baseProps} parsed={xmlParsed} />)
    const select = screen.getByRole('combobox') as HTMLSelectElement
    expect(select).toBeDisabled()
    const skipInput = screen.getByRole('spinbutton') as HTMLInputElement
    expect(skipInput).toBeDisabled()
  })

  it('calls onChangeDelimiter when the delimiter changes', () => {
    const onChangeDelimiter = vi.fn()
    render(<StepDataPreview {...baseProps} onChangeDelimiter={onChangeDelimiter} />)
    const select = screen.getByRole('combobox') as HTMLSelectElement
    fireEvent.change(select, { target: { value: ';' } })
    expect(onChangeDelimiter).toHaveBeenCalledWith(';')
  })

  it('calls onChangeSkip when header-skip input changes', () => {
    const onChangeSkip = vi.fn()
    render(<StepDataPreview {...baseProps} onChangeSkip={onChangeSkip} />)
    const skipInput = screen.getByRole('spinbutton') as HTMLInputElement
    fireEvent.change(skipInput, { target: { value: '2' } })
    expect(onChangeSkip).toHaveBeenCalledWith(2)
  })

  it('clamps negative skip values to 0', () => {
    const onChangeSkip = vi.fn()
    render(<StepDataPreview {...baseProps} onChangeSkip={onChangeSkip} />)
    const skipInput = screen.getByRole('spinbutton') as HTMLInputElement
    fireEvent.change(skipInput, { target: { value: '-3' } })
    expect(onChangeSkip).toHaveBeenCalledWith(0)
  })

  it('renders the parse-error banner when parseError is set', () => {
    render(<StepDataPreview {...baseProps} parseError="bad row" />)
    expect(screen.getByText(/Parse error/)).toBeInTheDocument()
    expect(screen.getByText(/bad row/)).toBeInTheDocument()
  })
})
