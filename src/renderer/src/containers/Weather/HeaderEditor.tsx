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

export default HeaderEditor
