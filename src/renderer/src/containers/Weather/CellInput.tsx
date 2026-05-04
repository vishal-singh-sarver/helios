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

  // Error visual is the cell <td>'s red border (rendered by WeatherTable);
  // here we only reserve right-side room for the info icon when in error
  // and keep the blue focus ring for the editing state.
  const inputCls = `h-full w-full bg-transparent px-4 ${error ? 'pr-8' : ''} outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500/60`

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
