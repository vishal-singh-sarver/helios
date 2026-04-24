import Header from '@renderer/components/Header'
import LabeledField from '@renderer/components/LabeledField'
import MenuBar from '@renderer/components/MenuBar'
import Tooltip from '@renderer/components/Tooltip'
import CenterWorkspace from '@renderer/containers/CenterWorkspace'
import LeftPanel from '@renderer/containers/LeftPanel'
import RightPanel from '@renderer/containers/RightPanel'
import React from 'react'
import { useDispatch } from 'react-redux'
import type { Reducer } from 'redux'
import { navigate } from 'store/navigationReducer'
import { useInjectReducer } from 'utils/injectReducer'
import { useInjectSaga } from 'utils/injectSaga'
import { TOOLBAR_ITEMS } from '../../types/project'
import reducer from './reducer'
import saga from './saga'

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

