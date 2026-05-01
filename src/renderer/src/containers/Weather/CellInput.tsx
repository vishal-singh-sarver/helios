import React from 'react'
import { useSelector } from 'react-redux'
import { makeSelectCellError } from './selectors'

interface CellInputProps {
  rowId: string
  colId: string
  value: string
  onCommit: (next: string) => void
}

function CellInput({ rowId, colId, value, onCommit }: CellInputProps): React.JSX.Element {
  const [draft, setDraft] = React.useState(value)
  React.useEffect(() => setDraft(value), [value])

  // Per-cell validation error pushed by handleCellBlur (manual edits) or by
  // the updateColumnWorker saga (after data type / unit changes).
  const selectError = React.useMemo(() => makeSelectCellError(rowId, colId), [rowId, colId])
  const error = useSelector(selectError)

  const inputCls = error
    ? 'w-full rounded border border-dashed border-red-500 bg-transparent px-1 outline-none'
    : 'w-full bg-transparent outline-none focus:ring-1 focus:ring-blue-500/40'

  return (
    <div className="flex w-full flex-col gap-0.5">
      <input
        type="text"
        aria-label={`${rowId} ${colId}`}
        aria-invalid={error ? true : undefined}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => onCommit(draft)}
        className={inputCls}
      />
      {error && (
        <span
          role="alert"
          className="block whitespace-normal break-words text-[11px] leading-tight text-red-500"
        >
          {error}
        </span>
      )}
    </div>
  )
}

export default CellInput
