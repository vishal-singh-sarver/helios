import { CheckCircleIcon, CloseIcon } from '@renderer/components/ImportWizard/Icons'
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { Reducer } from 'redux'
import { VALIDATION_MESSAGES } from 'utils/decimalValidation'
import { useInjectReducer } from 'utils/injectReducer'
import { useInjectSaga } from 'utils/injectSaga'
import loadable from 'utils/loadable'
import {
  importClearRequested,
  importPrecisionWarningConsumed,
  importFinalizeRequested,
  importPickFileRequested,
  importWizardClosed,
  importWizardOpened
} from './actions'
import reducer from './reducer'
import saga from './saga'
import {
  selectClearingImport,
  selectDataset,
  selectFileError,
  selectFileLoading,
  selectActiveProjectId,
  selectActiveScenarioId,
  selectImportError,
  selectImportPrecisionWarningPending,
  selectImporting,
  selectPickedFile,
  selectWizardOpen
} from './selectors'
import type { ImportedDataset } from './types'
import WeatherTable from './WeatherTable'
import WeatherToolbar from './WeatherToolbar'

// Lazy-load the wizard chunk on first open. The Stepper, parsers, and step
// components don't need to be in the Weather screen's initial bundle.
const ImportWizard = loadable(() => import('@renderer/components/ImportWizard'))

export function Weather(): React.JSX.Element {
  useInjectReducer({ key: 'weather', reducer: reducer as Reducer })
  useInjectSaga({ key: 'weather', saga })

  const dispatch = useDispatch()
  const fileLoading = useSelector(selectFileLoading)
  const fileError = useSelector(selectFileError)
  const pickedFile = useSelector(selectPickedFile)
  const dataset = useSelector(selectDataset)
  const activeProjectId = useSelector(selectActiveProjectId)
  const activeScenarioId = useSelector(selectActiveScenarioId)
  const importing = useSelector(selectImporting)
  const clearingImport = useSelector(selectClearingImport)
  const importError = useSelector(selectImportError)
  const importPrecisionWarningPending = useSelector(selectImportPrecisionWarningPending)
  const wizardOpen = useSelector(selectWizardOpen)
  const [importToastMessage, setImportToastMessage] = React.useState<string | null>(null)
  const toastTimeoutRef = React.useRef<number | null>(null)

  // Clear timeout on unmount
  React.useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        window.clearTimeout(toastTimeoutRef.current)
      }
    }
  }, [])

  React.useEffect(() => {
    if (importToastMessage == null) return undefined
    // Clear any existing timeout before setting a new one
    if (toastTimeoutRef.current) {
      window.clearTimeout(toastTimeoutRef.current)
    }
    toastTimeoutRef.current = window.setTimeout(() => {
      setImportToastMessage(null)
      toastTimeoutRef.current = null
    }, 2000)
    return () => {
      if (toastTimeoutRef.current) {
        window.clearTimeout(toastTimeoutRef.current)
      }
    }
  }, [importToastMessage])

  React.useEffect(() => {
    if (!importPrecisionWarningPending) return
    setImportToastMessage(VALIDATION_MESSAGES.IMPORT_WARNING)
    if (activeProjectId && activeScenarioId) {
      dispatch(importPrecisionWarningConsumed(activeProjectId, activeScenarioId))
    }
  }, [activeProjectId, activeScenarioId, dispatch, importPrecisionWarningPending])

  const openWizard = (): void => {
    setImportToastMessage(null)
    dispatch(importWizardOpened())
  }

  const closeWizard = (): void => {
    if (importing) return
    dispatch(importWizardClosed())
  }

  const handleSubmit = (ds: ImportedDataset, truncatedDecimals: boolean): void => {
    if (!activeProjectId || !activeScenarioId) return
    if (truncatedDecimals) {
      setImportToastMessage(VALIDATION_MESSAGES.IMPORT_WARNING)
    }
    dispatch(importFinalizeRequested(activeProjectId, activeScenarioId, ds, truncatedDecimals))
  }

  const handleRequestPickFile = (): void => {
    dispatch(importPickFileRequested())
  }

  const handleClearImportedFile = (): void => {
    if (!activeProjectId || !activeScenarioId) return
    setImportToastMessage(null)
    dispatch(importClearRequested(activeProjectId, activeScenarioId))
  }

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden">
      <WeatherToolbar
        onUploadFile={openWizard}
        importedFilename={dataset?.filename ?? null}
        onClearImportedFile={handleClearImportedFile}
        clearingImport={clearingImport}
      />
      <WeatherTable />

      {wizardOpen && (
        <ImportWizard
          isOpen
          onClose={closeWizard}
          onRequestPickFile={handleRequestPickFile}
          onSubmit={handleSubmit}
          onImportWarning={setImportToastMessage}
          pickedFile={pickedFile}
          fileLoading={fileLoading}
          fileError={fileError}
          importing={importing}
          importError={importError}
        />
      )}

      {importToastMessage && (
        <div className="absolute left-1/2 top-2 z-[60] w-full max-w-[520px] -translate-x-1/2 px-4">
          <div className="flex items-center gap-2 rounded border border-[#8dd3a8] bg-[#effcf4] px-4 py-3 text-sm text-[#0f6e3e] shadow-lg">
            <CheckCircleIcon className="h-4 w-4 shrink-0" />
            <div className="min-w-0 flex-1">{importToastMessage}</div>
            <button
              type="button"
              aria-label="Dismiss import notification"
              onClick={() => setImportToastMessage(null)}
              className="shrink-0 text-[#0f6e3e] opacity-80 transition hover:opacity-100"
            >
              <CloseIcon className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Weather
