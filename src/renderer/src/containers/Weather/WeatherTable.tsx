import chevronIcon from '@renderer/assets/chevron.svg'
import {
  setAllRowsSelection,
  setRowSelection,
  updateCellLocal
} from 'containers/ProjectScreen/actions'
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { DATETIME_COLUMN_NAME } from 'utils/weatherTable'
import {
  selectActiveScenarioId,
  selectActiveWeatherTable,
  selectAllRowsSelected,
  selectColumnOrder,
  selectColumns,
  selectRowOrder,
  selectRowSelection
} from './selectors'

function WeatherTable(): React.JSX.Element {
  const dispatch = useDispatch()
  const scenarioId = useSelector(selectActiveScenarioId)
  const columns = useSelector(selectColumns)
  const columnOrder = useSelector(selectColumnOrder)
  const rowOrder = useSelector(selectRowOrder)
  const rowSelection = useSelector(selectRowSelection)
  const allSelected = useSelector(selectAllRowsSelected)
  const table = useSelector(selectActiveWeatherTable)

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
    if (!scenarioId || newValue === originalValue) return
    dispatch(
      updateCellLocal({
        scenarioId,
        rowId,
        colId,
        value: newValue,
        validationError: null
      })
    )
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
              const label = col.unit ? `${col.name} (${col.unit})` : col.name
              return (
                <th
                  key={colId}
                  className="px-3 py-2 text-left font-normal text-neutral-300"
                >
                  <span className="inline-flex items-center gap-1">
                    {label}
                    <img src={chevronIcon} alt="" aria-hidden="true" className="h-3 w-3" />
                  </span>
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
                  const col = columns[colId]
                  const value = row[colId] ?? ''
                  const readOnly = col?.name === DATETIME_COLUMN_NAME
                  return (
                    <td key={colId} className="px-3 py-2">
                      {readOnly ? (
                        <span>{value}</span>
                      ) : (
                        <CellInput
                          rowId={rowId}
                          colId={colId}
                          value={value}
                          onCommit={(next) => handleCellBlur(rowId, colId, next, value)}
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

export default WeatherTable
