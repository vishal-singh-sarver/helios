import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import * as weatherActions from '../actions'
import Weather from '../index'
import type { ImportedDataset, PickedFile } from '../types'

const mockDispatch = vi.fn()
const sel = {
  fileLoading: false,
  fileError: null as string | null,
  pickedFile: null as PickedFile | null,
  importing: false,
  importError: null as string | null,
  importPrecisionWarningPending: false,
  wizardOpen: false
}

vi.mock('react-redux', () => ({
  useDispatch: () => mockDispatch,
  useSelector: (s: (state: unknown) => unknown) => s({} as never)
}))

vi.mock('utils/injectReducer', () => ({ useInjectReducer: vi.fn() }))
vi.mock('utils/injectSaga', () => ({ useInjectSaga: vi.fn() }))

vi.mock('../selectors', () => ({
  selectFileLoading: () => sel.fileLoading,
  selectFileError: () => sel.fileError,
  selectPickedFile: () => sel.pickedFile,
  selectImporting: () => sel.importing,
  selectImportError: () => sel.importError,
  selectImportPrecisionWarningPending: () => sel.importPrecisionWarningPending,
  selectWizardOpen: () => sel.wizardOpen
}))

vi.mock('../WeatherToolbar', () => ({
  default: ({ onUploadFile }: { onUploadFile?: () => void }) => (
    <div data-testid="toolbar">
      <button data-testid="upload" onClick={onUploadFile}>
        upload
      </button>
    </div>
  )
}))

vi.mock('../WeatherTable', () => ({
  default: () => <div data-testid="table" />
}))

// `loadable(...)` returns a component. Use a regular component so the wizard
// renders synchronously in tests instead of trying to async-import a chunk.
vi.mock('utils/loadable', () => ({
  default: () =>
    function FakeImportWizard(props: {
      isOpen: boolean
      onClose: () => void
      onRequestPickFile: () => void
      onSubmit: (ds: ImportedDataset, truncatedDecimals: boolean) => void
      onImportWarning: (message: string | null) => void
    }) {
      if (!props.isOpen) return null
      return (
        <div data-testid="wizard">
          <button data-testid="wizard-close" onClick={props.onClose} />
          <button data-testid="wizard-pick" onClick={props.onRequestPickFile} />
          <button
            data-testid="wizard-warning"
            onClick={() =>
              props.onImportWarning(
                'Only 7 decimal places have been taken for decimal values as more are not supported.'
              )
            }
          />
          <button
            data-testid="wizard-submit"
            onClick={() =>
              props.onSubmit(
                {
                  filename: 'foo.csv',
                  columns: [],
                  records: []
                },
                false
              )
            }
          />
          <button
            data-testid="wizard-submit-truncated"
            onClick={() =>
              props.onSubmit(
                {
                  filename: 'foo.csv',
                  columns: [],
                  records: []
                },
                true
              )
            }
          />
        </div>
      )
    }
}))

function resetSel(): void {
  sel.fileLoading = false
  sel.fileError = null
  sel.pickedFile = null
  sel.importing = false
  sel.importError = null
  sel.importPrecisionWarningPending = false
  sel.wizardOpen = false
}

describe('<Weather />', () => {
  beforeEach(() => {
    mockDispatch.mockClear()
    resetSel()
  })

  afterEach(() => {
    cleanup()
  })

  it('renders toolbar and table', () => {
    render(<Weather />)
    expect(screen.getByTestId('toolbar')).toBeInTheDocument()
    expect(screen.getByTestId('table')).toBeInTheDocument()
  })

  it('does not render the wizard when wizardOpen is false', () => {
    render(<Weather />)
    expect(screen.queryByTestId('wizard')).not.toBeInTheDocument()
  })

  it('renders the wizard when wizardOpen is true', () => {
    sel.wizardOpen = true
    render(<Weather />)
    expect(screen.getByTestId('wizard')).toBeInTheDocument()
  })

  it('dispatches importWizardOpened when the toolbar fires Upload File', () => {
    render(<Weather />)
    fireEvent.click(screen.getByTestId('upload'))
    expect(mockDispatch).toHaveBeenCalledWith(weatherActions.importWizardOpened())
  })

  it('dispatches importWizardClosed when the wizard requests close', () => {
    sel.wizardOpen = true
    render(<Weather />)
    fireEvent.click(screen.getByTestId('wizard-close'))
    expect(mockDispatch).toHaveBeenCalledWith(weatherActions.importWizardClosed())
  })

  it('does not dispatch close while importing', () => {
    sel.wizardOpen = true
    sel.importing = true
    render(<Weather />)
    fireEvent.click(screen.getByTestId('wizard-close'))
    expect(mockDispatch).not.toHaveBeenCalledWith(weatherActions.importWizardClosed())
  })

  it('dispatches importPickFileRequested when wizard requests pick', () => {
    sel.wizardOpen = true
    render(<Weather />)
    fireEvent.click(screen.getByTestId('wizard-pick'))
    expect(mockDispatch).toHaveBeenCalledWith(weatherActions.importPickFileRequested())
  })

  it('dispatches importFinalizeRequested with the dataset on wizard submit', () => {
    sel.wizardOpen = true
    render(<Weather />)
    fireEvent.click(screen.getByTestId('wizard-submit'))
    expect(mockDispatch).toHaveBeenCalledWith(
      weatherActions.importFinalizeRequested(
        {
          filename: 'foo.csv',
          columns: [],
          records: []
        },
        false
      )
    )
  })

  it('renders a bottom-right import toast when the wizard reports a precision warning', () => {
    sel.wizardOpen = true
    render(<Weather />)
    fireEvent.click(screen.getByTestId('wizard-warning'))
    expect(
      screen.getByText(
        'Only 7 decimal places have been taken for decimal values as more are not supported.'
      )
    ).toBeInTheDocument()
  })

  it('renders a bottom-right import toast when submit reports truncated decimals', () => {
    sel.wizardOpen = true
    render(<Weather />)
    fireEvent.click(screen.getByTestId('wizard-submit-truncated'))
    expect(
      screen.getByText(
        'Only 7 decimal places have been taken for decimal values as more are not supported.'
      )
    ).toBeInTheDocument()
  })

  it('renders a bottom-right import toast when refreshed backend data was precision-normalized', () => {
    sel.importPrecisionWarningPending = true
    render(<Weather />)
    expect(
      screen.getByText(
        'Only 7 decimal places have been taken for decimal values as more are not supported.'
      )
    ).toBeInTheDocument()
  })
})
