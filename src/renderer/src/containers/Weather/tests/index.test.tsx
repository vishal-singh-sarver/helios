import React from 'react'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import Weather from '../index'
import * as weatherActions from '../actions'
import type { ImportedDataset, PickedFile } from '../types'

const mockDispatch = vi.fn()
const sel = {
  fileLoading: false,
  fileError: null as string | null,
  pickedFile: null as PickedFile | null,
  importing: false,
  importError: null as string | null,
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
      onSubmit: (ds: ImportedDataset) => void
    }) {
      if (!props.isOpen) return null
      return (
        <div data-testid="wizard">
          <button data-testid="wizard-close" onClick={props.onClose} />
          <button data-testid="wizard-pick" onClick={props.onRequestPickFile} />
          <button
            data-testid="wizard-submit"
            onClick={() =>
              props.onSubmit({
                filename: 'foo.csv',
                columns: [],
                records: []
              })
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
      weatherActions.importFinalizeRequested({
        filename: 'foo.csv',
        columns: [],
        records: []
      })
    )
  })
})
