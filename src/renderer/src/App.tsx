import React from 'react'
import { useSelector } from 'react-redux'
import type { RootState } from './store/reducers'
import HomePage from './containers/HomePage/Loadable'

// Add additional screen imports here as the app grows, e.g.:
// import ProjectScreen from './containers/ProjectScreen/Loadable'

function App(): React.JSX.Element {
  const [showSplash, setShowSplash] = React.useState(true)
  const screen = useSelector((state: RootState) => state.navigation.screen)

  React.useEffect(() => {
    const timer = window.setTimeout(() => setShowSplash(false), 1200)
    return () => window.clearTimeout(timer)
  }, [])

  if (showSplash) {
    return (
      <div className="h-screen w-screen bg-dark text-neutral-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <h1 className="text-3xl font-semibold tracking-wide">Helios</h1>
          <p className="text-sm text-neutral-400">Loading workspace...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-dark text-neutral-200 overflow-hidden">
      {screen === 'home' && <HomePage />}
      {/* Add additional screen renderers here, e.g.: */}
      {/* {screen === 'project' && <ProjectScreen />} */}
    </div>
  )
}

export default App
