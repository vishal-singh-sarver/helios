import React from 'react'
import { useSelector } from 'react-redux'
import type { RootState } from './store/reducers'
import HomePage from './containers/HomePage/Loadable'

// Add additional screen imports here as the app grows, e.g.:
// import ProjectScreen from './containers/ProjectScreen/Loadable'

function App(): React.JSX.Element {
  const screen = useSelector((state: RootState) => state.navigation.screen)

  return (
    <div className="flex flex-col h-screen bg-dark text-neutral-200 overflow-hidden">
      {screen === 'home' && <HomePage />}
      {/* Add additional screen renderers here, e.g.: */}
      {/* {screen === 'project' && <ProjectScreen />} */}
    </div>
  )
}

export default App
