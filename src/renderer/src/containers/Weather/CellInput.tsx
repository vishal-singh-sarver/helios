import infoIcon from '@renderer/assets/info.svg'
import Tooltip from '@renderer/components/Tooltip'
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

  // On error: persistent red ring around the cell + reserved right-side
  // room (pr-8) for the info icon. Text color stays normal so the value
  // remains readable.
  const inputCls = error
    ? 'h-full w-full bg-transparent px-3 pr-8 outline-none ring-2 ring-inset ring-red-500'
    : 'h-full w-full bg-transparent px-3 outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500/60'

  return (
    <div className="relative flex h-full w-full items-center">
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
        <Tooltip
          text={error}
          ariaLabel={`Validation error: ${error}`}
          className="absolute right-2 top-1/2 -translate-y-1/2"
        >
          <img src={infoIcon} alt="" className="h-4 w-4" />
        </Tooltip>
      )}
    </div>
  )
}

export default CellInput
