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
    ? currentUnit.unit
    : currentDataType
      ? currentDataType.data_type
      : 'Data Type'

  const pickDataType = (dtId: number): void => {
    if (dtId !== col.dataTypeId) {
      // The currently-selected unit belongs to the previous data type, so
      // we must replace it in the same patch — the backend rejects mixed
      // pairs like {data_type: Y, unit_id: <unit-of-X>} and treats null as
      // "leave alone", so we can't clear it. Pick the new type's base unit
      // (or the first one if no base is flagged) as a sensible default.
      // The picker advances to the unit step so the user can override.
      const newType = dataTypes.find((dt) => dt.id === dtId)
      const baseUnit = newType?.units.find((u) => u.is_base) ?? newType?.units[0]
      const patch: UpdateColumnPatch = { dataTypeId: dtId }
      if (baseUnit) patch.unitId = baseUnit.id
      onPatch(patch)
    }
    setView('unit')
  }

  const pickUnit = (unitId: number): void => {
    if (unitId !== col.unitId) onPatch({ unitId })
    setOpen(false)
  }

  const handleBackToAssignType = (): void => {
    const clearAssignment: UpdateColumnPatch = { dataTypeId: null, unitId: null }
    onPatch(clearAssignment)
    setView('type')
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
          className="scrollbar-custom-thin absolute left-0 top-full z-20 mt-1 max-h-[260px] w-[216px] overflow-y-auto overflow-x-hidden rounded border border-app-border bg-[#1f1f1f] py-1 shadow-lg"
        >
          {view === 'unit' && (
            <button
              type="button"
              onClick={handleBackToAssignType}
              className="mb-1 flex h-8 w-full items-center gap-1 bg-neutral-200 px-3 text-left text-xs text-[#245AC5] hover:bg-neutral-100"
            >
              <span
                className="h-5 w-[134px] font-['Geist'] text-[14px] font-medium leading-5 tracking-normal text-[#245AC5]"
              >
                ‹ Back to Assign Type
              </span>
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
                className={`block h-[42px] w-full truncate px-3 text-left text-xs leading-[42px] hover:bg-[#2b2b2b] ${
                  dt.id === col.dataTypeId ? 'bg-[#111111] text-neutral-100' : 'text-neutral-300'
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
                  className={`flex h-[42px] w-full items-center justify-between gap-3 px-3 text-left text-xs hover:bg-[#2b2b2b] ${
                    u.id === col.unitId ? 'bg-[#111111] text-neutral-100' : 'text-neutral-300'
                  }`}
                >
                  <span className="truncate">{u.alias ? `${u.unit} (${u.alias})` : u.unit}</span>
                  {u.is_base && (
                    <span
                      aria-hidden="true"
                      className="h-[15px] w-[41px] shrink-0 bg-transparent text-center text-[12px] font-normal leading-[15px] tracking-normal text-[#B2C9F5]"
                    >
                      Default
                    </span>
                  )}
                </button>
              ))
            ))}
        </div>
      )}
    </div>
  )
}

export default DataTypeUnitPicker
