import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { Reducer } from 'redux'
import { useInjectReducer } from 'utils/injectReducer'
import { useInjectSaga } from 'utils/injectSaga'
import loadable from 'utils/loadable'
import { importFinalizeRequested, importPickFileRequested, importReset } from './actions'
import reducer from './reducer'
import saga from './saga'
import {
  selectFileError,
  selectFileLoading,
  selectImportError,
  selectImporting,
  selectPickedFile
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

  const [showWizard, setShowWizard] = useState(false)
  // Tracks the previous `importing` value across renders so we can detect a
  // true→false transition. Computed during render rather than in useEffect to
  // avoid a setState-in-effect cascade — React's recommended pattern for
  // deriving local state from external (Redux) state.
  const [prevImporting, setPrevImporting] = useState(false)
  if (prevImporting !== importing) {
    setPrevImporting(importing)
    if (prevImporting && !importing && !importError) {
      setShowWizard(false)
    }
  }

  const openWizard = (): void => {
    dispatch(importReset())
    setShowWizard(true)
  }

  const closeWizard = (): void => {
    if (importing) return
    setShowWizard(false)
    dispatch(importReset())
  }

  const handleSubmit = (ds: ImportedDataset): void => {
    dispatch(importFinalizeRequested(ds))
  }

  const handleRequestPickFile = (): void => {
    dispatch(importPickFileRequested())
  }
  // React.useEffect(() => {
  //   // TEMP: dummy scenario id until the scenario picker UI is built.
  //   // Remove this block once activeScenarioId is set elsewhere.
  //   try {
  //     if (!localStorage.getItem('helios:activeScenarioId')) {
  //       localStorage.setItem('helios:activeScenarioId', 'bd3d8f2d-fb7e-4496-b545-4d9ec24b3217')
  //     }
  //   } catch {
  //     /* storage disabled — ignore */
  //   }
  // }, [])

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <WeatherToolbar onUploadFile={openWizard} />
      <WeatherTable />

      {showWizard && (
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
