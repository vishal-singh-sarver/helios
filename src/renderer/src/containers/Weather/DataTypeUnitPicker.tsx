import {
  type ColumnDef,
  type DataTypeDef,
  type UpdateColumnPatch
} from 'containers/ProjectScreen/types'
import React from 'react'

// One button + popover. The popover has two steps:
//   1. Data type list (shown when no data type is set, or after the user clicks
//      "Back to Assign Type").
//   2. Unit list for the chosen data type, with a "Back to Assign Type" header
//      link that returns to step 1.
// Picking a data type does not auto-clear the unit (per saga contract); it
// patches dataTypeId only and advances to step 2. Picking a unit patches
// unitId and closes the popover.

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

export default DataTypeUnitPicker
