import React from 'react'
import type { Reducer } from 'redux'
import { useInjectReducer } from 'utils/injectReducer'
import { useInjectSaga } from 'utils/injectSaga'
import reducer from './reducer'
import saga from './saga'

// To read state:  const value = useSelector((s: RootState) => s.weather.someField)
// To dispatch:    const dispatch = useDispatch()

export function Weather(): React.JSX.Element {
  useInjectReducer({ key: 'weather', reducer: reducer as Reducer })
  useInjectSaga({ key: 'weather', saga })

  return (
    <div className="flex flex-1 items-center justify-center text-sm text-neutral-400">
      Weather
    </div>
  )
}

export default Weather
