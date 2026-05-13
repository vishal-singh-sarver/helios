import infoIcon from '@renderer/assets/info.svg'
import Tooltip from '@renderer/components/Tooltip'
import React from 'react'
import { useSelector } from 'react-redux'
import { exceedsMaxDecimals, VALIDATION_MESSAGES } from 'utils/decimalValidation'
import { makeSelectCellError } from './selectors'

interface CellInputProps {
  rowId: string
  colId: string
  value: string
  onCommit: (next: string) => void
}

function CellInput({ rowId, colId, value, onCommit }: CellInputProps): React.JSX.Element {
  const [draft, setDraft] = React.useState(value)
  const [decimalValidationError, setDecimalValidationError] = React.useState<string | null>(null)
  React.useEffect(() => {
    setDraft(value)
    setDecimalValidationError(null)
  }, [value])

  // Per-cell validation error pushed by handleCellBlur (manual edits) or by
  // the updateColumnWorker saga (after data type / unit changes).
  const selectError = React.useMemo(() => makeSelectCellError(rowId, colId), [rowId, colId])
  const error = useSelector(selectError)

  // Combine backend validation error with decimal validation error
  const displayError = decimalValidationError || error

  // Error visual is the cell <td>'s red border (rendered by WeatherTable);
  // here we only reserve right-side room for the info icon when in error
  // and keep the blue focus ring for the editing state.
  const inputCls = `h-full w-full bg-transparent px-4 ${displayError ? 'pr-8' : ''} outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500/60`

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const newValue = e.target.value

    // Check if the new value exceeds max decimals
    if (exceedsMaxDecimals(newValue)) {
      // Show error but don't update draft
      setDecimalValidationError(VALIDATION_MESSAGES.MANUAL_INPUT)
      return
    }

    // Clear decimal validation error if the value is now valid
    if (decimalValidationError) {
      setDecimalValidationError(null)
    }

    setDraft(newValue)
  }

  const handleBlur = (): void => {
    // Clear decimal validation error on blur to allow the backend validation to take over
    setDecimalValidationError(null)
    onCommit(draft)
  }

  return (
    <div className="relative flex h-full w-full items-center">
      <input
        type="text"
        aria-label={`${rowId} ${colId}`}
        aria-invalid={displayError ? true : undefined}
        value={draft}
        onChange={handleChange}
        onBlur={handleBlur}
        className={inputCls}
      />
      {displayError && (
        <Tooltip
          text={displayError}
          ariaLabel={`Validation error: ${displayError}`}
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
