import deleteIcon from '@renderer/assets/delete.svg'
import {
  setAllRowsSelection,
  setRowSelection,
  updateCellLocal,
  updateColumnRequested
} from 'containers/ProjectScreen/actions'
import {
  isReservedColId,
  type CellValue,
  type ColumnDef,
  type DataTypeDef,
  type UpdateColumnPatch
} from 'containers/ProjectScreen/types'
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  selectActiveProjectId,
  selectActiveScenarioId,
  selectActiveWeatherTable,
  selectAllDataTypes,
  selectAllRowsSelected,
  selectColumnOrder,
  selectColumns,
  selectRowOrder,
  selectRowSelection
} from './selectors'

// A column is backend-managed (PATCH-able) when its id is a positive integer —
// the stringified WeatherDataHeader.id. Reserved date/time and upload-slug
// columns fail this check and stay read-only.
function isBackendManagedCol(colId: string): boolean {
  if (isReservedColId(colId)) return false
  const n = Number(colId)
  return Number.isFinite(n) && n > 0 && String(n) === colId
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
  const table = useSelector(selectActiveWeatherTable)
  const dataTypes = useSelector(selectAllDataTypes)

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
    dispatch(
      updateCellLocal({
        projectId,
        scenarioId,
        rowId,
        colId,
        value: newValue,
        validationError: null
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

  return (
    <div className="scrollbar-custom flex-1 overflow-auto bg-dark">
      <table className="w-full border-collapse text-sm text-neutral-200">
        <thead className="bg-neutral-900">
          <tr className="border-b border-app-border">
            <th className="w-12 border-r border-app-border px-3 py-2 text-left align-middle">
              <input
                type="checkbox"
                aria-label="Select all rows"
                checked={allSelected}
                onChange={toggleAll}
                className="h-4 w-4 accent-blue-600"
              />
            </th>
            {columnOrder.map((colId) => {
              const col = columns[colId]
              if (!col) return null
              const managed = isBackendManagedCol(colId)
              const widthCls = managed ? 'w-40 min-w-40 max-w-40' : 'w-32 min-w-32 max-w-32'
              const alignCls = managed ? 'align-top' : 'align-middle'
              return (
                <th
                  key={colId}
                  className={`${widthCls} ${alignCls} border-r border-app-border px-3 py-2 text-left font-normal text-neutral-300`}
                >
                  {managed ? (
                    <HeaderEditor
                      col={col}
                      dataTypes={dataTypes}
                      onPatch={(patch) => dispatchHeaderPatch(col, patch)}
                    />
                  ) : (
                    <span className="block truncate">{col.name}</span>
                  )}
                </th>
              )
            })}
            <th className="w-20 min-w-20 max-w-20 border-r border-app-border px-3 py-2 text-left align-middle font-normal text-neutral-300">
              Action
            </th>
            <th aria-hidden className="w-auto" />
          </tr>
        </thead>
        <tbody>
          {rowOrder.map((rowId) => {
            const row = table?.rows[rowId] ?? {}
            return (
              <tr key={rowId} className="h-9 border-b border-app-border">
                <td className="w-12 border-r border-app-border px-3 py-2">
                  <input
                    type="checkbox"
                    aria-label={`Select ${rowId}`}
                    checked={rowSelection[rowId] === true}
                    onChange={() => toggleRow(rowId)}
                    className="h-4 w-4 accent-blue-600"
                  />
                </td>
                {columnOrder.map((colId) => {
                  const value: CellValue = row[colId] ?? null
                  const display = value ?? ''
                  const readOnly = isReservedColId(colId)
                  const widthCls = readOnly
                    ? 'w-32 min-w-32 max-w-32'
                    : 'w-40 min-w-40 max-w-40'
                  return (
                    <td
                      key={colId}
                      className={`${widthCls} border-r border-app-border px-3 py-2`}
                    >
                      {readOnly ? (
                        <span className="block truncate">{display}</span>
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
  )
}

interface CellInputProps {
  rowId: string
  colId: string
  value: string
  onCommit: (next: string) => void
}

function CellInput({ rowId, colId, value, onCommit }: CellInputProps): React.JSX.Element {
  const [draft, setDraft] = React.useState(value)
  React.useEffect(() => setDraft(value), [value])

  return (
    <input
      type="text"
      aria-label={`${rowId} ${colId}`}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => onCommit(draft)}
      className="w-full bg-transparent outline-none focus:ring-1 focus:ring-blue-500/40"
    />
  )
}

// ── Header editor ────────────────────────────────────────────────────────────
//
// Three controls per backend-managed column header: name (text input, commits
// on blur), data type (select, commits on change), unit (select, commits on
// change; disabled when no data type is set). Each commit fires one PATCH —
// the saga + reducer handle optimistic apply / rollback. Per task constraints,
// changing the data type does not auto-clear or auto-pick a unit.

interface HeaderEditorProps {
  col: ColumnDef
  dataTypes: DataTypeDef[]
  onPatch: (patch: UpdateColumnPatch) => void
}

function HeaderEditor({ col, dataTypes, onPatch }: HeaderEditorProps): React.JSX.Element {
  const [nameDraft, setNameDraft] = React.useState(col.name)
  // Re-sync when the canonical column name changes (rollback, external update).
  React.useEffect(() => setNameDraft(col.name), [col.name])

  const currentDataType = React.useMemo(
    () =>
      col.dataTypeId == null
        ? undefined
        : dataTypes.find((dt) => dt.id === col.dataTypeId),
    [dataTypes, col.dataTypeId]
  )

  const unitsForType = currentDataType?.units ?? []

  const handleNameBlur = (): void => {
    const trimmed = nameDraft.trim()
    if (trimmed === '' || trimmed === col.name) {
      setNameDraft(col.name)
      return
    }
    onPatch({ name: trimmed })
  }

  return (
    <div className="flex w-full flex-col gap-1">
      <input
        type="text"
        aria-label={`Column ${col.id} name`}
        value={nameDraft}
        onChange={(e) => setNameDraft(e.target.value)}
        onBlur={handleNameBlur}
        className="w-full rounded border border-app-border bg-dark px-2 py-1 text-sm text-neutral-200 outline-none focus:border-neutral-500"
      />
      <div className="flex items-center gap-1">
        <DataTypeUnitPicker
          col={col}
          dataTypes={dataTypes}
          currentDataType={currentDataType}
          unitsForType={unitsForType}
          onPatch={onPatch}
        />
        <button
          type="button"
          aria-label={`Delete column ${col.id}`}
          className="shrink-0 rounded p-1 hover:bg-neutral-800"
        >
          <img src={deleteIcon} alt="" className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

// ── Combined data-type / unit picker ────────────────────────────────────────
//
// One button + popover. The popover has two steps:
//   1. Data type list (shown when no data type is set, or after the user clicks
//      "Back to Assign Type").
//   2. Unit list for the chosen data type, with a "Back to Assign Type" header
//      link that returns to step 1.
// Picking a data type does not auto-clear the unit (per saga contract); it
// patches dataTypeId only and advances to step 2. Picking a unit patches unitId
// and closes the popover.

interface DataTypeUnitPickerProps {
  col: ColumnDef
  dataTypes: DataTypeDef[]
  currentDataType: DataTypeDef | undefined
  unitsForType: DataTypeDef['units']
  onPatch: (patch: UpdateColumnPatch) => void
}

function DataTypeUnitPicker({
  col,
  dataTypes,
  currentDataType,
  unitsForType,
  onPatch
}: DataTypeUnitPickerProps): React.JSX.Element {
  const [open, setOpen] = React.useState(false)
  const [view, setView] = React.useState<'type' | 'unit'>(
    col.dataTypeId == null ? 'type' : 'unit'
  )
  const wrapRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!open) return
    setView(col.dataTypeId == null ? 'type' : 'unit')
  }, [open, col.dataTypeId])

  React.useEffect(() => {
    if (!open) return
    const onDocClick = (e: MouseEvent): void => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [open])

  const currentUnit = currentDataType?.units.find((u) => u.id === col.unitId)

  const buttonLabel = currentUnit
    ? currentUnit.alias
      ? `${currentUnit.unit} (${currentUnit.alias})`
      : currentUnit.unit
    : currentDataType
      ? currentDataType.data_type
      : 'Data Type'

  const pickDataType = (dtId: number): void => {
    if (dtId !== col.dataTypeId) onPatch({ dataTypeId: dtId })
    setView('unit')
  }

  const pickUnit = (unitId: number): void => {
    if (unitId !== col.unitId) onPatch({ unitId })
    setOpen(false)
  }

  return (
    <div ref={wrapRef} className="relative min-w-0 flex-1">
      <button
        type="button"
        aria-label={`Column ${col.id} data type and unit`}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-1 rounded border border-app-border bg-dark px-2 py-1 text-xs text-neutral-200 outline-none hover:border-neutral-500 focus:border-neutral-500"
      >
        <span className="truncate">{buttonLabel}</span>
        <span aria-hidden className="text-neutral-400">▾</span>
      </button>
      {open && (
        <div
          role="listbox"
          className="absolute left-0 top-full z-20 mt-1 max-h-64 w-48 overflow-auto rounded border border-app-border bg-neutral-900 shadow-lg"
        >
          {view === 'unit' && (
            <button
              type="button"
              onClick={() => setView('type')}
              className="flex w-full items-center gap-1 border-b border-app-border px-3 py-2 text-left text-xs text-blue-400 hover:bg-neutral-800"
            >
              <span aria-hidden>‹</span> Back to Assign Type
            </button>
          )}
          {view === 'type' &&
            dataTypes.map((dt) => (
              <button
                key={dt.id}
                type="button"
                role="option"
                aria-selected={dt.id === col.dataTypeId}
                onClick={() => pickDataType(dt.id)}
                className={`block w-full px-3 py-2 text-left text-xs hover:bg-neutral-800 ${
                  dt.id === col.dataTypeId ? 'text-neutral-100' : 'text-neutral-300'
                }`}
              >
                {dt.data_type}
              </button>
            ))}
          {view === 'unit' &&
            (unitsForType.length === 0 ? (
              <div className="px-3 py-2 text-xs text-neutral-500">No units</div>
            ) : (
              unitsForType.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  role="option"
                  aria-selected={u.id === col.unitId}
                  onClick={() => pickUnit(u.id)}
                  className={`block w-full px-3 py-2 text-left text-xs hover:bg-neutral-800 ${
                    u.id === col.unitId ? 'text-neutral-100' : 'text-neutral-300'
                  }`}
                >
                  {u.alias ? `${u.unit} (${u.alias})` : u.unit}
                </button>
              ))
            ))}
        </div>
      )}
    </div>
  )
}

export default WeatherTable
