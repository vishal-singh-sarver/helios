import infoIcon from '@renderer/assets/info.svg'
import Tooltip from '@renderer/components/Tooltip'
import { setCellValidationError } from 'containers/ProjectScreen/actions'
import type { ColumnDef, DataTypeDef } from 'containers/ProjectScreen/types'
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { exceedsMaxDecimals, VALIDATION_MESSAGES } from 'utils/decimalValidation'
import { makeSelectCellError } from './selectors'
import {
  GLOBAL_CELL_MAX,
  GLOBAL_CELL_MIN,
  GLOBAL_RANGE_MESSAGE,
  validateCellValue
} from './validation'

interface CellInputProps {
  rowId: string
  colId: string
  value: string
  // col / dataTypes / scenarioId used to live as per-cell useSelector calls.
  // Each visible row × column added 3 store subscriptions; at ~300 cells that
  // meant ~900 extra subscriptions notified on every dispatch. Lifted to the
  // parent (WeatherTable) which selects them once and passes stable refs down.
  col: ColumnDef | undefined
  dataTypes: DataTypeDef[]
  scenarioId: string | null
  onCommit: (next: string) => void
}

// True when the parsed number would breach the global ±1e6 bound. Partial
// inputs like "" or "-" parse to NaN and are allowed through so the user can
// keep typing.
function exceedsGlobalBound(raw: string): boolean {
  const num = Number(raw.trim())
  if (!Number.isFinite(num)) return false
  return num < GLOBAL_CELL_MIN || num > GLOBAL_CELL_MAX
}

function CellInput({
  rowId,
  colId,
  value,
  col,
  dataTypes,
  scenarioId,
  onCommit
}: CellInputProps): React.JSX.Element {
  const dispatch = useDispatch()

  const [draft, setDraft] = React.useState(value)
  const [decimalValidationError, setDecimalValidationError] = React.useState<string | null>(null)
  // Local-only error for the global ±1e6 keystroke block. We reject the
  // character before it reaches `draft`, so this error isn't reflected in the
  // redux validationError map — using local state keeps it isolated from the
  // committed value's validation lifecycle.
  const [globalBoundError, setGlobalBoundError] = React.useState<string | null>(null)
  React.useEffect(() => {
    setDraft(value)
    setDecimalValidationError(null)
    setGlobalBoundError(null)
  }, [value])

  // Per-cell validation error pushed by handleCellBlur (manual edits), by
  // the updateColumnWorker saga (after data type / unit changes), and by
  // the live keystroke validator below (via SET_CELL_VALIDATION_ERROR).
  const selectError = React.useMemo(() => makeSelectCellError(rowId, colId), [rowId, colId])
  const error = useSelector(selectError)

  // Combine backend / redux validation error with local guards. The global
  // bound takes precedence because the keystroke that triggered it never
  // made it into `draft`.
  const displayError = globalBoundError || decimalValidationError || error

  // Error visual is the cell <td>'s red border (rendered by WeatherTable);
  // here we only reserve right-side room for the info icon when in error
  // and keep the blue focus ring for the editing state.
  const inputCls = `h-full w-full bg-transparent px-4 ${displayError ? 'pr-8' : ''} outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500/60`

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const newValue = e.target.value

    // Block #1 — too many decimal places (existing behavior).
    if (exceedsMaxDecimals(newValue)) {
      setDecimalValidationError(VALIDATION_MESSAGES.MANUAL_INPUT)
      return
    }
    if (decimalValidationError) {
      setDecimalValidationError(null)
    }

    // Block #2 — global ±1e6 hard bound. Refuse the keystroke so the value
    // can never reach blur / backend in a state that violates the bound.
    if (exceedsGlobalBound(newValue)) {
      setGlobalBoundError(GLOBAL_RANGE_MESSAGE)
      return
    }
    if (globalBoundError) {
      setGlobalBoundError(null)
    }

    setDraft(newValue)

    // Live unit-range / number-format validation. Does NOT block — we just
    // surface the error through redux so the red <td> outline + tooltip
    // update while typing. Re-uses the same validationErrors slot that
    // handleCellBlur writes on commit, so on blur the slot is overwritten
    // with the final result (no stale live error survives).
    if (scenarioId && col) {
      const liveError = validateCellValue(newValue, { col, dataTypes })
      dispatch(setCellValidationError(scenarioId, rowId, colId, liveError))
    }
  }

  const handleBlur = (): void => {
    // Clear local guards so the redux/backend error becomes the single
    // source of truth for displayError.
    setDecimalValidationError(null)
    setGlobalBoundError(null)
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

// Memoized so a parent re-render (e.g. another row's cell changes, or the
// scroll handler updating the visible window) doesn't reconcile cells whose
// props are referentially unchanged. With ~300 visible cells this is the
// difference between reconciling 300 inputs per scroll tick and reconciling 0.
export default React.memo(CellInput)
