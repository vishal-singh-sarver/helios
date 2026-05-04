import deleteIcon from '@renderer/assets/delete.svg'
import {
  setAllRowsSelection,
  setRowSelection,
  updateCellLocal,
  updateColumnRequested
} from 'containers/ProjectScreen/actions'
import {
  CHECK_COL_NAME,
  DATE_COL_ID,
  DATE_TIME_COL_NAME,
  TIME_COL_ID,
  isReservedColId,
  type CellValue,
  type ColumnDef,
  type UpdateColumnPatch
} from 'containers/ProjectScreen/types'
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import CellInput from './CellInput'
import DateTimeHeader, { type DateFormat } from './DateTimeHeader'
import HeaderEditor from './HeaderEditor'
import { validateCellValue } from './validation'
import {
  selectActiveProject,
  selectActiveProjectId,
  selectActiveScenarioId,
  selectActiveWeatherTable,
  selectAllChecked,
  selectAllRowsSelected,
  selectCheckColId,
  selectColumnOrder,
  selectColumns,
  selectRowOrder,
  selectRowSelection,
  selectSelectableDataTypes
} from './selectors'

// A column is backend-managed (PATCH-able) when its id is a positive integer —
// the stringified WeatherDataHeader.id. Reserved date/time, upload-slug, and
// the seeded date-time/check columns fail this check and stay read-only.
function isBackendManagedCol(col: ColumnDef): boolean {
  if (isReservedColId(col.id)) return false
  if (col.name === DATE_TIME_COL_NAME || col.name === CHECK_COL_NAME) return false
  const n = Number(col.id)
  return Number.isFinite(n) && n > 0 && String(n) === col.id
}

// "2026-02-26" + "10:00:00" → "02/26/2026 10:00". Returns "" when either
// half is missing so the merged cell renders blank, matching how unfilled
// date/time cells render today.
function formatDateTime(
  date: CellValue,
  time: CellValue,
  format: DateFormat,
  utcOffset: string
): string {
  if (date == null || time == null) return ''
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date)
  if (!m) return ''
  const [, y, mo, d] = m
  const hhmm = time.slice(0, 5)
  if (!/^\d{2}:\d{2}$/.test(hhmm)) return ''
  const ss = /^\d{2}:\d{2}:(\d{2})/.exec(time)?.[1] ?? '00'
  switch (format) {
    case 'MM/DD/YYYY HH:MM':
      return `${mo}/${d}/${y} ${hhmm}`
    case 'DD/MM/YYYY HH:MM':
      return `${d}/${mo}/${y} ${hhmm}`
    case 'MM-DD-YYYY HH:MM':
      return `${mo}-${d}-${y} ${hhmm}`
    case 'DD-MM-YYYY HH:MM':
      return `${d}-${mo}-${y} ${hhmm}`
    case 'YYYY-MM-DD HH:MM':
      return `${y}-${mo}-${d} ${hhmm}`
    case 'YYYYMMDDHH':
      return `${y}${mo}${d}${hhmm.slice(0, 2)}`
    case 'YYYY-MM-DDTHH:MM:SS-HH:MM':
      return `${y}-${mo}-${d}T${hhmm}:${ss}${utcOffset || '+00:00'}`
    case 'YYYY-MM-DDTHH:MM:SSZ':
      return `${y}-${mo}-${d}T${hhmm}:${ss}`
  }
}

function WeatherTable(): React.JSX.Element {
  const dispatch = useDispatch()
  const projectId = useSelector(selectActiveProjectId)
  const scenarioId = useSelector(selectActiveScenarioId)
  const columns = useSelector(selectColumns)
  const columnOrder = useSelector(selectColumnOrder)
  const rowOrder = useSelector(selectRowOrder)
  const rowSelection = useSelector(selectRowSelection)
  const allSelected = useSelector(selectAllRowsSelected)
  const allChecked = useSelector(selectAllChecked)
  const checkColId = useSelector(selectCheckColId)
  const table = useSelector(selectActiveWeatherTable)
  const dataTypes = useSelector(selectSelectableDataTypes)
  const activeProject = useSelector(selectActiveProject)
  const [dateFormat, setDateFormat] = React.useState<DateFormat>('MM/DD/YYYY HH:MM')

  const toggleAll = (): void => {
    if (!scenarioId) return
    dispatch(setAllRowsSelection(scenarioId, !allSelected))
  }

  const toggleRow = (rowId: string): void => {
    if (!scenarioId) return
    dispatch(setRowSelection(scenarioId, rowId, !rowSelection[rowId]))
  }

  const handleCellBlur = (
    rowId: string,
    colId: string,
    newValue: string,
    originalValue: string
  ): void => {
    if (!projectId || !scenarioId || newValue === originalValue) return
    const col = columns[colId]
    const validationError = col
      ? validateCellValue(newValue, { col, dataTypes })
      : null
    dispatch(
      updateCellLocal({
        projectId,
        scenarioId,
        rowId,
        colId,
        value: newValue,
        validationError
      })
    )
  }

  const dispatchHeaderPatch = (
    col: ColumnDef,
    patch: UpdateColumnPatch
  ): void => {
    if (!projectId || !scenarioId) return
    const previous: UpdateColumnPatch = {}
    if (patch.name !== undefined) previous.name = col.name
    if (patch.dataTypeId !== undefined) previous.dataTypeId = col.dataTypeId
    if (patch.unitId !== undefined) previous.unitId = col.unitId
    dispatch(updateColumnRequested(projectId, scenarioId, col.id, patch, previous))
  }

  const dateTimeColId = React.useMemo(() => {
    for (const colId of Object.keys(columns)) {
      if (columns[colId]?.name === DATE_TIME_COL_NAME) return colId
    }
    return null
  }, [columns])

  // Columns rendered in the table body: hide check (rendered as the leftmost
  // checkbox column instead) and hide the raw date/time pseudo-columns when
  // the merged date-time column is present.
  const visibleColumnOrder = React.useMemo(
    () =>
      columnOrder.filter((colId) => {
        if (colId === checkColId) return false
        if (dateTimeColId != null && (colId === DATE_COL_ID || colId === TIME_COL_ID)) {
          return false
        }
        return true
      }),
    [columnOrder, checkColId, dateTimeColId]
  )

  // Per-row check-cell handler. Toggle flips "1" ↔ "0" via the same
  // optimistic UPDATE_CELL_LOCAL path the saga already handles for normal
  // cell edits — so the value persists round-trip.
  const toggleCheck = (rowId: string, currentValue: CellValue): void => {
    if (!projectId || !scenarioId || !checkColId) return
    const next = currentValue === '1' ? '0' : '1'
    dispatch(
      updateCellLocal({
        projectId,
        scenarioId,
        rowId,
        colId: checkColId,
        value: next,
        validationError: null
      })
    )
  }

  // Header select-all when the check column is present: dispatch one
  // UPDATE_CELL_LOCAL per row, flipping every row to match the inverse of
  // "are they all currently checked".
  const toggleAllCheck = (): void => {
    if (!projectId || !scenarioId || !checkColId) return
    const next = allChecked ? '0' : '1'
    for (const rowId of rowOrder) {
      dispatch(
        updateCellLocal({
          projectId,
          scenarioId,
          rowId,
          colId: checkColId,
          value: next,
          validationError: null
        })
      )
    }
  }

  // Vertical divider rendered as an absolutely-positioned pseudo-element so
  // the line can be shorter than the header cell — centered, ~60% of the
  // cell height, 2px wide. The cell needs `relative` to anchor it.
  const headerDivider =
    "relative after:absolute after:right-0 after:top-[20%] after:bottom-[20%] after:w-0.5 after:bg-white/40 after:content-['']"

  // Header lives outside the scroll container so the body's vertical
  // scrollbar starts beneath the header strip rather than extending up to
  // the very top. The strip uses `overflow-x: clip` (not `hidden`) so that
  // header dropdowns (DataTypeUnitPicker, DateTimeHeader) can extend
  // vertically below the strip without being clipped — a side effect of
  // the spec rule that `overflow-x: hidden` forces `overflow-y` to also
  // clip. Because `clip` disallows programmatic `scrollLeft`, we sync the
  // horizontal pan via CSS `translateX()` on the header table instead.
  const headerTableRef = React.useRef<HTMLTableElement>(null)
  const onBodyScroll = (e: React.UIEvent<HTMLDivElement>): void => {
    if (headerTableRef.current) {
      headerTableRef.current.style.transform = `translateX(-${e.currentTarget.scrollLeft}px)`
    }
  }

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-dark">
      {/* Header strip — overflow-x: clip so its own scrollbar never shows
          AND so dropdowns inside the header (Data Type / Date-Time) can
          extend vertically below the strip without being clipped. The
          horizontal pan is applied as a transform on the inner table. */}
      <div className="relative z-10 overflow-x-clip bg-neutral-900 pr-[22px]">
        <table ref={headerTableRef} className="w-full border-collapse text-sm text-neutral-200">
          <thead>
            <tr className="border-b border-app-border">
              <th className={`w-12 ${headerDivider} px-3 py-2 text-left align-middle`}>
                <input
                  type="checkbox"
                  aria-label="Select all rows"
                  checked={checkColId != null ? allChecked : allSelected}
                  onChange={checkColId != null ? toggleAllCheck : toggleAll}
                  className="h-4 w-4 accent-blue-600"
                />
              </th>
              {visibleColumnOrder.map((colId) => {
                const col = columns[colId]
                if (!col) return null
                const managed = isBackendManagedCol(col)
                const isDateTime = colId === dateTimeColId
                const widthCls = isDateTime
                  ? 'w-[269px] min-w-[269px] max-w-[269px]'
                  : managed
                    ? 'w-[162px] min-w-[162px] max-w-[162px]'
                    : 'w-32 min-w-32 max-w-32'
                const alignCls = managed ? 'align-top' : 'align-middle'
                return (
                  <th
                    key={colId}
                    className={`${widthCls} ${alignCls} ${headerDivider} px-3 py-2 text-left font-normal text-neutral-300`}
                  >
                    {managed ? (
                      <HeaderEditor
                        col={col}
                        dataTypes={dataTypes}
                        onPatch={(patch) => dispatchHeaderPatch(col, patch)}
                      />
                    ) : isDateTime ? (
                      <DateTimeHeader value={dateFormat} onChange={setDateFormat} />
                    ) : (
                      <span className="block truncate">{col.name}</span>
                    )}
                  </th>
                )
              })}
              <th className={`w-20 min-w-20 max-w-20 ${headerDivider} px-3 py-2 text-left align-middle font-normal text-neutral-300`}>
                Action
              </th>
              <th aria-hidden className="w-auto" />
            </tr>
          </thead>
        </table>
      </div>

      {/* Body — owns both scrollbars. */}
      <div className="scrollbar-custom flex-1 overflow-auto" onScroll={onBodyScroll}>
        <table className="w-full border-collapse text-sm text-neutral-200">
          <tbody>
            {rowOrder.map((rowId) => {
              const row = table?.rows[rowId] ?? {}
              const checkValue: CellValue =
                checkColId != null ? (row[checkColId] ?? null) : null
              return (
                <tr key={rowId} className="h-9 border-b border-app-border">
                  <td className="w-12 border-r border-app-border px-3 py-2">
                    <input
                      type="checkbox"
                      aria-label={`Select ${rowId}`}
                      checked={
                        checkColId != null
                          ? checkValue === '1'
                          : rowSelection[rowId] === true
                      }
                      onChange={
                        checkColId != null
                          ? () => toggleCheck(rowId, checkValue)
                          : () => toggleRow(rowId)
                      }
                      className="h-4 w-4 accent-blue-600"
                    />
                  </td>
                  {visibleColumnOrder.map((colId) => {
                    const value: CellValue = row[colId] ?? null
                    const isDateTime = colId === dateTimeColId
                    const display = isDateTime
                      ? formatDateTime(
                          row[DATE_COL_ID] ?? null,
                          row[TIME_COL_ID] ?? null,
                          dateFormat,
                          activeProject?.utc_offset ?? ''
                        )
                      : (value ?? '')
                    const readOnly = isReservedColId(colId) || isDateTime
                    const widthCls = isDateTime
                      ? 'w-[269px] min-w-[269px] max-w-[269px]'
                      : readOnly
                        ? 'w-32 min-w-32 max-w-32'
                        : 'w-[162px] min-w-[162px] max-w-[162px]'
                    // Error indicator uses `outline` (not `border`) so it
                    // doesn't get eaten by `border-collapse` at the shared
                    // edge with a left/right neighbor. `-outline-offset-1`
                    // pulls it 1px inside the cell so it sits exactly where
                    // a 1px border would render visually. The cell still
                    // renders its `border-r` column separator underneath —
                    // they coexist because outline is a separate paint layer.
                    // Read-only cells can never carry a validation error.
                    const cellError = readOnly
                      ? null
                      : (table?.validationErrors?.[rowId]?.[colId] ?? null)
                    const borderCls = cellError
                      ? 'border-r border-app-border outline outline-1 -outline-offset-1 outline-[#F04438]'
                      : 'border-r border-app-border'
                    return (
                      <td
                        key={colId}
                        className={`${widthCls} h-9 ${borderCls}`}
                      >
                        {readOnly ? (
                          <span className="block truncate px-3">{display}</span>
                        ) : (
                          <CellInput
                            rowId={rowId}
                            colId={colId}
                            value={display}
                            onCommit={(next) => handleCellBlur(rowId, colId, next, display)}
                          />
                        )}
                      </td>
                    )
                  })}
                  <td className="w-20 min-w-20 max-w-20 border-r border-app-border px-3 py-2">
                    <button
                      type="button"
                      aria-label={`Delete row ${rowId}`}
                      className="rounded p-1 hover:bg-neutral-800"
                    >
                      <img src={deleteIcon} alt="" className="h-4 w-4" />
                    </button>
                  </td>
                  <td aria-hidden className="w-auto" />
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default WeatherTable
