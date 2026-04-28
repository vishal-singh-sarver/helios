import Header from '@renderer/components/Header'
import LabeledField from '@renderer/components/LabeledField'
import MenuBar from '@renderer/components/MenuBar'
import Tooltip from '@renderer/components/Tooltip'
import CenterWorkspace from '@renderer/containers/CenterWorkspace'
import LeftPanel from '@renderer/containers/LeftPanel'
import RightPanel from '@renderer/containers/RightPanel'
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { Reducer } from 'redux'
import { navigate } from 'store/navigationReducer'
import { useInjectReducer } from 'utils/injectReducer'
import { useInjectSaga } from 'utils/injectSaga'
import { TOOLBAR_ITEMS } from '../../types/project'
import { listScenariosRequested, loadDataTypesRequested, setActiveProject } from './actions'
import reducer from './reducer'
import saga from './saga'
import { selectActiveProjectId } from './selectors'

// HomePage writes `helios:activeProjectId` to localStorage on row click.
// We hydrate from it here so a refresh on the project screen still has a
// project — and so the scenarios fetch below has something to scope to.
const PROJECT_ID_STORAGE_KEY = 'helios:activeProjectId'

// `helios:activeScenarioId` is project-screen-scoped: the saga writes it on
// listScenariosSucceeded and we clear it on project screen unmount so it
// doesn't linger in localStorage once the user navigates back to Home.
const SCENARIO_ID_STORAGE_KEY = 'helios:activeScenarioId'

// Help text — mirrors the strings used in HomePage's New Project dialog so
// the user sees the same guidance whether they're creating a project or
// editing its coordinates from the project screen header.
const LATITUDE_HELP =
  'Enter latitude in decimal degrees. Valid range: -90 <= latitude <= 90. Negative for South, positive for North.'
const LONGITUDE_HELP =
  'Enter longitude in decimal degrees. Valid range: -180 <= longitude <= 180. Negative for West, positive for East.'

// Validation rules mirror the New Project dialog.
// Returns true when the value is parseable and within range, OR when the
// field is empty (empty = "not yet entered", not invalid). No error UI is
// rendered; callers use the derived booleans to flip the `invalid` prop
// on LabeledField, which shows a red border.
function isLatitudeValid(value: string): boolean {
  if (value === '') return true
  const n = Number.parseFloat(value)
  return !Number.isNaN(n) && n >= -90 && n <= 90
}

function isLongitudeValid(value: string): boolean {
  if (value === '') return true
  const n = Number.parseFloat(value)
  return !Number.isNaN(n) && n >= -180 && n <= 180
}

export function ProjectScreen(): React.JSX.Element {
  useInjectReducer({ key: 'projectScreen', reducer: reducer as Reducer })
  useInjectSaga({ key: 'projectScreen', saga })

  const dispatch = useDispatch()
  const activeProjectId = useSelector(selectActiveProjectId)

  // Load the data-types-with-units catalog once per mount. The reducer
  // dedupes by overwriting, so re-mounting the screen refreshes the slice.
  React.useEffect(() => {
    dispatch(loadDataTypesRequested())
  }, [dispatch])

  React.useEffect(() => {
    if (activeProjectId == null) {
      const stored = localStorage.getItem(PROJECT_ID_STORAGE_KEY)
      if (stored) dispatch(setActiveProject(stored))
    }
  }, [activeProjectId, dispatch])

  // Fire on every project-id change. Stale Redux scenario state from a prior
  // visit is overwritten by the saga's setActiveScenario when the response
  // resolves — so no `activeScenarioId == null` guard is needed.
  React.useEffect(() => {
    if (activeProjectId != null) {
      dispatch(listScenariosRequested(activeProjectId))
    }
  }, [activeProjectId, dispatch])

  // Clear the persisted scenario id when leaving the project screen so it
  // doesn't show up in localStorage on Home.
  React.useEffect(() => {
    return () => {
      localStorage.removeItem(SCENARIO_ID_STORAGE_KEY)
    }
  }, [])

  const [latitude, setLatitude] = React.useState('')
  const [longitude, setLongitude] = React.useState('')
  const [utcOffset] = React.useState('')

  const [utcOffsetDisabled, setUtcOffsetDisabled] = React.useState(true)

  const [projectRunning, setProjectRunning] = React.useState(false)

  // Placeholders until the setters are wired to real controls.
  void setUtcOffsetDisabled
  void setProjectRunning

  // Validity drives only the red-border indicator — no text errors.
  const latitudeInvalid = !isLatitudeValid(latitude)
  const longitudeInvalid = !isLongitudeValid(longitude)

  // Compose the effective disabled flags.
  //   - Latitude / Longitude: locked only while a run is in progress.
  //   - UTC Offset: locked when formula-driven OR when a run is in progress.
  const coordsLocked = projectRunning
  const utcLocked = projectRunning || utcOffsetDisabled

  return (
    <div className="flex flex-col h-full">
      <Header onLogoClick={() => dispatch(navigate('home'))}>
        <MenuBar items={TOOLBAR_ITEMS} onItemSelect={() => {}} />
        <div className="flex items-center gap-2">
          <LabeledField
            label="Latitude"
            value={latitude}
            onChange={setLatitude}
            disabled={coordsLocked}
            invalid={latitudeInvalid}
            labelAdornment={<Tooltip text={LATITUDE_HELP} ariaLabel="Show latitude help" />}
          />

          <LabeledField
            label="Longitude"
            value={longitude}
            onChange={setLongitude}
            disabled={coordsLocked}
            invalid={longitudeInvalid}
            labelAdornment={<Tooltip text={LONGITUDE_HELP} ariaLabel="Show longitude help" />}
          />

          <LabeledField label="UTC Offset" value={utcOffset} disabled={utcLocked} />
        </div>
      </Header>

      <main className="flex min-h-0 flex-1 gap-[10px] overflow-hidden p-[10px]">
        <LeftPanel />
        <CenterWorkspace />
        <RightPanel />
      </main>
    </div>
  )
}

export default ProjectScreen

