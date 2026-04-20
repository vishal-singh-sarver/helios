import React from 'react'
import type { Reducer } from 'redux'
import weatherIcon from '@renderer/assets/weather.svg'
import Weather from '@renderer/containers/Weather'
import { useInjectReducer } from 'utils/injectReducer'
import { useInjectSaga } from 'utils/injectSaga'
import reducer from './reducer'
import saga from './saga'

// To read state:  const value = useSelector((s: RootState) => s.centerWorkspace.someField)
// To dispatch:    const dispatch = useDispatch()

type Tab = 'weather' | null

export function CenterWorkspace(): React.JSX.Element {
  useInjectReducer({ key: 'centerWorkspace', reducer: reducer as Reducer })
  useInjectSaga({ key: 'centerWorkspace', saga })

  const [activeTab, setActiveTab] = React.useState<Tab>(null)

  const weatherActive = activeTab === 'weather'

  return (
    <section className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-lg border border-app-border bg-panel/20 p-3">
      <div className="flex items-center">
        <button
          type="button"
          onClick={() => setActiveTab('weather')}
          aria-pressed={weatherActive}
          className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm text-neutral-200 ${
            weatherActive ? 'bg-neutral-700' : 'bg-neutral-800/80 hover:bg-neutral-700/80'
          }`}
        >
          <img src={weatherIcon} alt="" aria-hidden="true" className="h-4 w-4" />
          Weather
        </button>
      </div>

      {activeTab === 'weather' && <Weather />}
    </section>
  )
}

export default CenterWorkspace
