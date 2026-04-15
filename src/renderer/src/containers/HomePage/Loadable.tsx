import LoadingScreen from '@renderer/components/LoadingScreen'
import loadable from 'utils/loadable'

export default loadable(() => import('./index'), {
  fallback: <LoadingScreen fullScreen label="Loading workspace…" />
})
