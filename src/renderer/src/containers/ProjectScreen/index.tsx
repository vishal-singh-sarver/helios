import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { Reducer } from 'redux'
import Header from '@renderer/components/Header'
import LabeledField from '@renderer/components/LabeledField'
import MenuBar from '@renderer/components/MenuBar'
import Tooltip from '@renderer/components/Tooltip'
import { useInjectReducer } from 'utils/injectReducer'
import { useInjectSaga } from 'utils/injectSaga'
import { TOOLBAR_ITEMS } from '../../types/project'
import { setLatitude, setLongitude } from './actions'
import CenterWorkspace from './CenterWorkspace'
import LeftPanel from './LeftPanel'
import reducer from './reducer'
import RightPanel from './RightPanel'
import saga from './saga'
import { selectLatitude, selectLongitude, selectUtcOffset } from './selectors'

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
  const latitude = useSelector(selectLatitude)
  const longitude = useSelector(selectLongitude)
  const utcOffset = useSelector(selectUtcOffset)

  // UTC Offset is computed from a mathematical formula (to be wired in
  // later). It is never edited manually, so default disabled: true. The
  // setter is kept around so a future effect / handler can temporarily
  // unlock it if that's ever needed.
  const [utcOffsetDisabled, setUtcOffsetDisabled] = React.useState(true)

  // When a project run starts, all three coordinate fields must lock so
  // the user can't change inputs mid-run. The trigger logic will be
  // provided later (likely from a "Run" button or a saga effect).
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
      <Header>
        <MenuBar items={TOOLBAR_ITEMS} onItemSelect={() => {}} />
        <div className="flex items-center gap-2">
          <LabeledField
            label="Latitude"
            value={latitude}
            onChange={(value) => dispatch(setLatitude(value))}
            disabled={coordsLocked}
            invalid={latitudeInvalid}
            labelAdornment={<Tooltip text={LATITUDE_HELP} ariaLabel="Show latitude help" />}
          />

          <LabeledField
            label="Longitude"
            value={longitude}
            onChange={(value) => dispatch(setLongitude(value))}
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
