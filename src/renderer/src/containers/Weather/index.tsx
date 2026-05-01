import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { Reducer } from 'redux'
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
  const wizardOpen = useSelector(selectWizardOpen)

  const openWizard = (): void => {
    dispatch(importWizardOpened())
  }

  const closeWizard = (): void => {
    if (importing) return
    dispatch(importWizardClosed())
  }

  const handleSubmit = (ds: ImportedDataset): void => {
    dispatch(importFinalizeRequested(ds))
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
          pickedFile={pickedFile}
          fileLoading={fileLoading}
          fileError={fileError}
          importing={importing}
          importError={importError}
        />
      )}
    </div>
  )
}

export default Weather
