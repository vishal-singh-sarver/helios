import {
  loadScenarioRequested,
  setActiveScenario
} from 'containers/ProjectScreen/actions'
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { Reducer } from 'redux'
import { useInjectReducer } from 'utils/injectReducer'
import { useInjectSaga } from 'utils/injectSaga'
import WeatherTable from './WeatherTable'
import WeatherToolbar from './WeatherToolbar'
import reducer from './reducer'
import saga from './saga'
import { selectActiveScenarioId } from './selectors'

// Default scenarioId until project-level routing wires this up.
const DEFAULT_SCENARIO_ID = 'default'

export function Weather(): React.JSX.Element {
  useInjectReducer({ key: 'weather', reducer: reducer as Reducer })
  useInjectSaga({ key: 'weather', saga })

  const dispatch = useDispatch()
  const activeScenarioId = useSelector(selectActiveScenarioId)

  React.useEffect(() => {
    if (activeScenarioId == null) {
      dispatch(setActiveScenario(DEFAULT_SCENARIO_ID))
      dispatch(loadScenarioRequested(DEFAULT_SCENARIO_ID))
    }
  }, [activeScenarioId, dispatch])

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <WeatherToolbar />
      <WeatherTable />
    </div>
  )
}

export default Weather
