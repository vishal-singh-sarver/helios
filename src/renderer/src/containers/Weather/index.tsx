import React from 'react'
import type { Reducer } from 'redux'
import { useInjectReducer } from 'utils/injectReducer'
import { useInjectSaga } from 'utils/injectSaga'
import WeatherTable from './WeatherTable'
import WeatherToolbar from './WeatherToolbar'
import reducer from './reducer'
import saga from './saga'

// To read state:  const value = useSelector((s: RootState) => s.weather.someField)
// To dispatch:    const dispatch = useDispatch()

export function Weather(): React.JSX.Element {
  useInjectReducer({ key: 'weather', reducer: reducer as Reducer })
  useInjectSaga({ key: 'weather', saga })

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <WeatherToolbar />
      <WeatherTable />
    </div>
  )
}

export default Weather
