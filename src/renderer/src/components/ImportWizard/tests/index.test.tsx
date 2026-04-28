import { fireEvent, render, screen, within } from '@testing-library/react'
import ImportWizard from '../index'
import type { ImportWizardProps } from '../types'
import type { ImportedDataset } from 'containers/Weather/parsers'

const baseProps: ImportWizardProps = {
  isOpen: true,
  onClose: vi.fn(),
  onRequestPickFile: vi.fn(),
  onSubmit: vi.fn(),
  pickedFile: null,
  fileLoading: false,
  fileError: null,
  importing: false,
  importError: null
}

const goodGroup1File = {
  filename: 'sample.csv',
  rawText:
    'year,month,day,hour,minute,temp\n' +
    '2026,2,26,10,0,22.5\n' +
    '2026,2,27,11,0,23.7'
}

describe('<ImportWizard />', () => {
  it('renders nothing when not open', () => {
    const { container } = render(<ImportWizard {...baseProps} isOpen={false} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders the modal header on step 1 when open', () => {
    render(<ImportWizard {...baseProps} />)
    expect(screen.getByText('Import Weather Data')).toBeInTheDocument()
    expect(screen.getByText('Weather Data File')).toBeInTheDocument()
  })

  it('Browse button calls onRequestPickFile', () => {
    const onRequestPickFile = vi.fn()
    render(<ImportWizard {...baseProps} onRequestPickFile={onRequestPickFile} />)
    fireEvent.click(screen.getByText('Browse'))
    expect(onRequestPickFile).toHaveBeenCalledTimes(1)
  })

  it('Cancel button calls onClose', () => {
    const onClose = vi.fn()
    render(<ImportWizard {...baseProps} onClose={onClose} />)
    fireEvent.click(screen.getByText('Cancel'))
    expect(onClose).toHaveBeenCalled()
  })

  it('close (×) button in header calls onClose', () => {
    const onClose = vi.fn()
    render(<ImportWizard {...baseProps} onClose={onClose} />)
    fireEvent.click(screen.getByLabelText('Close'))
    expect(onClose).toHaveBeenCalled()
  })

  it('Next is disabled on step 1 when no file has been parsed', () => {
    render(<ImportWizard {...baseProps} />)
    expect(screen.getByText('Next')).toBeDisabled()
  })

  it('auto-parses pickedFile prop and reveals filename + enables Next', () => {
    render(<ImportWizard {...baseProps} pickedFile={goodGroup1File} />)
    expect(screen.getByDisplayValue('sample.csv')).toBeInTheDocument()
    expect(screen.getByText('Next')).not.toBeDisabled()
  })

  it('clicking Next on step 1 advances to step 2 (data preview)', () => {
    render(<ImportWizard {...baseProps} pickedFile={goodGroup1File} />)
    fireEvent.click(screen.getByText('Next'))
    expect(screen.getByText('Delimiter')).toBeInTheDocument()
    expect(screen.getByText('Header Lines to Skip')).toBeInTheDocument()
  })

  it('Back button returns to the previous step', () => {
    render(<ImportWizard {...baseProps} pickedFile={goodGroup1File} />)
    fireEvent.click(screen.getByText('Next'))
    expect(screen.getByText('Delimiter')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Back'))
    // Back on step 1 — file label is visible again
    expect(screen.getByText('Weather Data File')).toBeInTheDocument()
  })

  it('walks all four steps and Import dispatches a dataset with the check column', () => {
    const onSubmit = vi.fn()
    render(<ImportWizard {...baseProps} pickedFile={goodGroup1File} onSubmit={onSubmit} />)

    // Step 1 → 2
    fireEvent.click(screen.getByText('Next'))
    // Step 2 → 3
    fireEvent.click(screen.getByText('Next'))
    // Step 3 → 4 (auto-mapping picks year/month/day/hour/minute → all rows valid)
    fireEvent.click(screen.getByText('Next'))
    // Step 4 — Import button now visible
    fireEvent.click(screen.getByText('Import'))

    expect(onSubmit).toHaveBeenCalledTimes(1)
    const dataset = onSubmit.mock.calls[0][0] as ImportedDataset

    expect(dataset.filename).toBe('sample.csv')

    // Check column injected at the front
    expect(dataset.columns[0]).toEqual({
      key: '__check__',
      label: 'check',
      index: -1
    })

    // The user-selectable column "temp" comes through (it's the only non-DT column)
    const tempCol = dataset.columns.find((c) => c.label === 'temp')
    expect(tempCol).toBeDefined()

    // Date-time component columns are folded into the synthetic Date-Time, not exposed
    expect(dataset.columns.find((c) => c.label === 'year')).toBeUndefined()
    expect(dataset.columns.find((c) => c.label === 'hour')).toBeUndefined()

    // Every record has __check__ = "1" by default (backend uses 0/1 strings)
    expect(dataset.records).toHaveLength(2)
    expect(dataset.records[0].values.__check__).toBe('1')
    expect(dataset.records[1].values.__check__).toBe('1')

    // dtIso is set (rows are valid)
    expect(dataset.records[0].dtIso).not.toBeNull()
  })

  it('renders the importError banner when prop is set', () => {
    render(<ImportWizard {...baseProps} importError="Save cancelled" />)
    expect(screen.getByText(/Import failed/)).toBeInTheDocument()
    expect(screen.getByText(/Save cancelled/)).toBeInTheDocument()
  })

  it('disables Cancel + close while importing is true', () => {
    render(<ImportWizard {...baseProps} importing />)
    expect(screen.getByLabelText('Close')).toBeDisabled()
  })

  it('shows "Importing…" on the Import button while importing', () => {
    render(<ImportWizard {...baseProps} pickedFile={goodGroup1File} importing />)
    fireEvent.click(screen.getByText('Next'))
    fireEvent.click(screen.getByText('Next'))
    fireEvent.click(screen.getByText('Next'))
    expect(screen.getByText('Importing…')).toBeInTheDocument()
    expect(screen.getByText('Importing…')).toBeDisabled()
  })

  it('updates the file label and parses again when pickedFile changes', () => {
    const { rerender } = render(<ImportWizard {...baseProps} pickedFile={goodGroup1File} />)
    expect(screen.getByDisplayValue('sample.csv')).toBeInTheDocument()

    const second = {
      filename: 'second.csv',
      rawText: 'year,month,day,temp\n2026,3,1,18.0'
    }
    rerender(<ImportWizard {...baseProps} pickedFile={second} />)
    expect(screen.getByDisplayValue('second.csv')).toBeInTheDocument()
  })

  it('renders parse-error banner when pickedFile content is malformed', () => {
    const malformed = {
      filename: 'broken.csv',
      // Mismatched column counts — parseDelimited throws
      rawText: 'a,b,c\n1,2,3,4'
    }
    render(<ImportWizard {...baseProps} pickedFile={malformed} />)
    expect(screen.getByText(/Invalid file/)).toBeInTheDocument()
  })

  it('Step 4 Date-Time row is required and disabled', () => {
    render(<ImportWizard {...baseProps} pickedFile={goodGroup1File} />)
    fireEvent.click(screen.getByText('Next')) // step 2
    fireEvent.click(screen.getByText('Next')) // step 3
    fireEvent.click(screen.getByText('Next')) // step 4
    const dtRow = screen.getByText('Date-Time').closest('tr') as HTMLElement
    const checkbox = within(dtRow).getByRole('checkbox')
    expect(checkbox).toBeDisabled()
    expect(checkbox).toBeChecked()
  })
})
