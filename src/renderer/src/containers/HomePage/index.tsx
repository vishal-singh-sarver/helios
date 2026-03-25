import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useInjectReducer } from 'utils/injectReducer'
import { useInjectSaga } from 'utils/injectSaga'
import reducer from './reducer'
import saga from './saga'
import * as actions from './actions'
import {
  selectStatus,
  selectLoading,
  selectError,
  selectStreaming,
  selectStreamLog
} from './selectors'

export function HomePage(): React.JSX.Element {
  useInjectReducer({ key: 'homePage', reducer })
  useInjectSaga({ key: 'homePage', saga })

  const dispatch  = useDispatch()
  const status    = useSelector(selectStatus)
  const loading   = useSelector(selectLoading)
  const error     = useSelector(selectError)
  const streaming = useSelector(selectStreaming)
  const streamLog = useSelector(selectStreamLog)

  // Fetch backend status on mount
  useEffect(() => {
    dispatch(actions.fetchStatus())
  }, [dispatch])

  const handleStreamToggle = () => {
    if (streaming) {
      dispatch(actions.sseDisconnect())
    } else {
      dispatch(actions.sseConnect())
    }
  }

  return (
    <div className="flex flex-col h-full p-6 gap-6">

      {/* Header */}
      <h1 className="text-2xl font-semibold text-neutral-100">
        Welcome to Electron App
      </h1>

      {/* Status card */}
      <section className="bg-panel border border-app-border rounded-lg p-4 flex flex-col gap-2">
        <h2 className="text-sm font-medium text-neutral-400 uppercase tracking-wide">
          Backend Status
        </h2>

        {loading && (
          <p className="text-neutral-400 text-sm">Loading…</p>
        )}

        {error && (
          <p className="text-red-400 text-sm">{error}</p>
        )}

        {status && !loading && (
          <dl className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm">
            <dt className="text-neutral-400">Version</dt>
            <dd className="text-neutral-100 font-mono">{status.version}</dd>
            <dt className="text-neutral-400">Uptime</dt>
            <dd className="text-neutral-100 font-mono">{status.uptime}s</dd>
          </dl>
        )}

        <button
          onClick={() => dispatch(actions.fetchStatus())}
          disabled={loading}
          className="mt-2 self-start px-3 py-1.5 text-xs bg-dark border border-app-border rounded hover:bg-app-border disabled:opacity-50 disabled:cursor-not-allowed text-neutral-200"
        >
          Refresh
        </button>
      </section>

      {/* SSE stream */}
      <section className="bg-panel border border-app-border rounded-lg p-4 flex flex-col gap-3 flex-1 min-h-0">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-neutral-400 uppercase tracking-wide">
            Live Stream
          </h2>
          <button
            onClick={handleStreamToggle}
            className={[
              'px-3 py-1.5 text-xs rounded border',
              streaming
                ? 'border-red-500 text-red-400 hover:bg-red-500/10'
                : 'border-app-border text-neutral-200 hover:bg-app-border'
            ].join(' ')}
          >
            {streaming ? 'Disconnect' : 'Connect'}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto font-mono text-xs text-neutral-300 bg-dark rounded p-3 space-y-1 min-h-0">
          {streamLog.length === 0 ? (
            <p className="text-neutral-500">
              {streaming ? 'Waiting for events…' : 'Stream not connected.'}
            </p>
          ) : (
            streamLog.map((event, i) => (
              <div key={i} className="flex gap-3">
                <span className="text-neutral-500 shrink-0">
                  {new Date(event.timestamp).toLocaleTimeString()}
                </span>
                <span className="text-neutral-400 shrink-0">[{event.type}]</span>
                <span className="text-neutral-200 break-all">
                  {typeof event.data === 'string'
                    ? event.data
                    : JSON.stringify(event.data)}
                </span>
              </div>
            ))
          )}
        </div>
      </section>

    </div>
  )
}

export default HomePage
