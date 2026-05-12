import { AlertTriangleIcon } from '@renderer/components/ImportWizard/Icons'
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { Reducer } from 'redux'
import { VALIDATION_MESSAGES } from 'utils/decimalValidation'
import { useInjectReducer } from 'utils/injectReducer'
import { useInjectSaga } from 'utils/injectSaga'
import loadable from 'utils/loadable'
import {
  importFinalizeRequested,
  importPickFileRequested,
  importWizardClosed,
  importWizardOpened
} from './actions'
import reducer from './reducer'
import saga from './saga'
import {
  selectFileError,
  selectFileLoading,
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
  const importing = useSelector(selectImporting)
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
  }, [importPrecisionWarningPending])

  const openWizard = (): void => {
    setImportToastMessage(null)
    dispatch(importWizardOpened())
  }

  const closeWizard = (): void => {
    if (importing) return
    dispatch(importWizardClosed())
  }

  const handleSubmit = (ds: ImportedDataset, truncatedDecimals: boolean): void => {
    if (truncatedDecimals) {
      setImportToastMessage(VALIDATION_MESSAGES.IMPORT_WARNING)
    }
    dispatch(importFinalizeRequested(ds, truncatedDecimals))
  }

  const handleRequestPickFile = (): void => {
    dispatch(importPickFileRequested())
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <WeatherToolbar onUploadFile={openWizard} />
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
        <div className="pointer-events-none fixed bottom-6 right-6 z-[60] max-w-md rounded border border-amber-900/40 bg-amber-900/95 px-4 py-3 text-sm text-amber-100 shadow-2xl">
          <div className="flex items-start gap-2">
            <AlertTriangleIcon className="mt-0.5 h-4 w-4 shrink-0" />
            <div>{importToastMessage}</div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Weather
