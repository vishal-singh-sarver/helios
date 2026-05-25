import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import './index.css'

// Resolve backend URL from main process *before* importing App (and therefore
// before constants.ts/api.ts initialize their module-level BASE_URL constant
// and axios baseURL). The main process picks the actual port the backend
// bound to — which may differ from 8008 if it was busy. Without this, the
// renderer would use the stale build-time VITE_BACKEND_URL.
async function bootstrap() {
  try {
    const url = await window.api.getBackendUrl()
    if (url) {
      window.__APP_BASE_URL__ = url
    }
  } catch (err) {
    console.error('Failed to resolve backend URL from main process:', err)
  }

  // Dynamic imports run after __APP_BASE_URL__ is set, so the constants module
  // captures the right value when it's first evaluated.
  const { default: App } = await import('./App')
  const { default: configureStore } = await import('./store/configureStore')

  const store = configureStore()

  ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
      <Provider store={store}>
        <App />
      </Provider>
    </React.StrictMode>
  )

  // window.api.appReady() is fired by the initial screen (HomePage /
  // ProjectScreen) from its own mount effect, so the splash holds until the
  // screen has actually painted rather than guessing a timeout from here.
}

bootstrap()
