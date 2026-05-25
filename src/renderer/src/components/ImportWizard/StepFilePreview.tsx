import React from 'react'
import { AlertTriangleIcon } from './Icons'
import type { StepFilePreviewProps } from './types'

export default function StepFilePreview({
  filename,
  fileLoading,
  fileError,
  parseError,
  onBrowse
}: StepFilePreviewProps): React.JSX.Element {
  const error = fileError ?? parseError
  return (
    <div className="px-6 pb-2">
      <label className="mb-2 block text-sm text-neutral-200">Weather Data File</label>
      <div className="flex gap-3">
        <input
          readOnly
          tabIndex={-1}
          spellCheck={false}
          value={filename ?? ''}
          placeholder="No file selected"
          style={{
            backgroundColor: '#424242',
            outline: 'none',
            boxShadow: 'none',
            textDecoration: 'none'
          }}
          className="flex-1 cursor-default rounded border border-app-border px-3 py-2 text-sm text-neutral-300 no-underline focus:outline-none focus-visible:outline-none focus:ring-0 focus:border-app-border"
        />
        <button
          type="button"
          onClick={onBrowse}
          disabled={fileLoading}
          className="rounded-[4px] bg-white px-5 py-2 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {fileLoading ? 'Opening…' : 'Browse'}
        </button>
      </div>

      {error && (
        <div className="mt-3 flex items-start gap-2 rounded border border-red-900/40 bg-red-900/20 px-3 py-2 text-sm text-red-300">
          <AlertTriangleIcon className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <strong className="font-semibold">
              {fileError ? 'Could not open file. ' : 'Invalid file. '}
            </strong>
            {error}
          </div>
        </div>
      )}
    </div>
  )
}
