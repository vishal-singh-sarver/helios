import deleteIcon from '@renderer/assets/delete.svg'
import {
  type ColumnDef,
  type DataTypeDef,
  type UpdateColumnPatch
} from 'containers/ProjectScreen/types'
import React from 'react'
import DataTypeUnitPicker from './DataTypeUnitPicker'

// Three controls per backend-managed column header: name (text input,
// commits on blur), data type (select, commits on change), unit (select,
// commits on change; disabled when no data type is set). Each commit fires
// one PATCH — the saga + reducer handle optimistic apply / rollback. Per
// task constraints, changing the data type does not auto-clear or
// auto-pick a unit.

interface HeaderEditorProps {
  col: ColumnDef
  dataTypes: DataTypeDef[]
  onPatch: (patch: UpdateColumnPatch) => void
}

function HeaderEditor({ col, dataTypes, onPatch }: HeaderEditorProps): React.JSX.Element {
  const [nameDraft, setNameDraft] = React.useState(col.name)
  const [nameError, setNameError] = React.useState<string | null>(null)
  // Re-sync when the canonical column name changes (rollback, external update).
  React.useEffect(() => {
    setNameDraft(col.name)
    setNameError(null)
  }, [col.name])

  const currentDataType = React.useMemo(
    () =>
      col.dataTypeId == null
        ? undefined
        : dataTypes.find((dt) => dt.id === col.dataTypeId),
    [dataTypes, col.dataTypeId]
  )

  const unitsForType = currentDataType?.units ?? []

  const validateColumnName = (name: string): string | null => {
    const trimmed = name.trim()
    if (!trimmed) {
      return 'Column name is required.'
    }
    if (trimmed.length > 30) {
      return 'Column name must be 30 characters or fewer.'
    }
    return null
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value
    setNameDraft(value)
    const error = validateColumnName(value)
    setNameError(error)
  }

  const handleNameBlur = (): void => {
    const trimmed = nameDraft.trim()
    const error = validateColumnName(trimmed)
    setNameError(error)
    
    if (error || trimmed === col.name) {
      setNameDraft(col.name)
      return
    }
    onPatch({ name: trimmed })
  }

  return (
    <div className="flex w-full flex-col gap-1">
      <div>
        <input
          type="text"
          aria-label={`Column ${col.id} name`}
          value={nameDraft}
          onChange={handleNameChange}
          onBlur={handleNameBlur}
          className={`w-full rounded border bg-dark px-2 py-1 text-sm text-neutral-200 outline-none ${
            nameError
              ? 'border-red-500 focus:border-red-600'
              : 'border-app-border focus:border-neutral-500'
          }`}
        />
        {nameError && (
          <p className="pt-1 text-xs text-red-500">{nameError}</p>
        )}
      </div>
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

export default HeaderEditor
