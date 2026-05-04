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

  // The error indicator reuses the same ring treatment as the focus state
  // — only the color and the always-on flag change. Focus state (no error):
  // 2px inset blue ring on focus. Error state: 2px inset red ring (#F04438
  // from the Figma "Border error" token), shown unconditionally.
  const inputCls = error
    ? 'h-full w-full bg-transparent px-4 pr-8 outline-none ring-2 ring-inset ring-[#F04438]'
    : 'h-full w-full bg-transparent px-4 outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500/60'

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
          textColor="#e5e5e5"
        >
          <img src={infoIcon} alt="" className="h-4 w-4" />
        </Tooltip>
      )}
    </div>
  )
}

export default CellInput
