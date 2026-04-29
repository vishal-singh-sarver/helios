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
            <th className="w-12 px-3 py-2 text-left">
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
              return (
                <th
                  key={colId}
                  className="px-3 py-2 text-left font-normal text-neutral-300 align-top"
                >
                  {isBackendManagedCol(colId) ? (
                    <HeaderEditor
                      col={col}
                      dataTypes={dataTypes}
                      onPatch={(patch) => dispatchHeaderPatch(col, patch)}
                    />
                  ) : (
                    <span>{col.name}</span>
                  )}
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {rowOrder.map((rowId) => {
            const row = table?.rows[rowId] ?? {}
            return (
              <tr key={rowId} className="border-b border-app-border">
                <td className="w-12 px-3 py-2">
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
                  return (
                    <td key={colId} className="px-3 py-2">
                      {readOnly ? (
                        <span>{display}</span>
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

  const handleDataTypeChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    const next = e.target.value === '' ? null : Number(e.target.value)
    if (next === col.dataTypeId) return
    onPatch({ dataTypeId: next })
  }

  const handleUnitChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    const next = e.target.value === '' ? null : Number(e.target.value)
    if (next === col.unitId) return
    onPatch({ unitId: next })
  }

  return (
    <div className="flex flex-col gap-1 min-w-32">
      <input
        type="text"
        aria-label={`Column ${col.id} name`}
        value={nameDraft}
        onChange={(e) => setNameDraft(e.target.value)}
        onBlur={handleNameBlur}
        className="w-full rounded border border-app-border bg-dark px-2 py-1 text-sm text-neutral-200 outline-none focus:border-neutral-500"
      />
      <div className="flex gap-1">
        <select
          aria-label={`Column ${col.id} data type`}
          value={col.dataTypeId == null ? '' : String(col.dataTypeId)}
          onChange={handleDataTypeChange}
          className="flex-1 rounded border border-app-border bg-dark px-2 py-1 text-xs text-neutral-200 outline-none focus:border-neutral-500"
        >
          <option value="">Data type</option>
          {dataTypes.map((dt) => (
            <option key={dt.id} value={String(dt.id)}>
              {dt.data_type}
            </option>
          ))}
        </select>
        <select
          aria-label={`Column ${col.id} unit`}
          value={col.unitId == null ? '' : String(col.unitId)}
          onChange={handleUnitChange}
          disabled={col.dataTypeId == null}
          className="flex-1 rounded border border-app-border bg-dark px-2 py-1 text-xs text-neutral-200 outline-none focus:border-neutral-500 disabled:opacity-50"
        >
          <option value="">{col.dataTypeId == null ? '—' : 'Unit'}</option>
          {unitsForType.map((u) => (
            <option key={u.id} value={String(u.id)}>
              {u.alias ? `${u.unit} (${u.alias})` : u.unit}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

export default WeatherTable
