// Cell value validation against the catalog's per-unit min/max range.
//
// Returns null when the value is acceptable (or when validation cannot run —
// empty cell, no data type / unit assigned, or the catalog hasn't published
// a range for this unit yet). The error message format mirrors the spec:
//   "{column name} must be between {min} and {max} {unit symbol}"

import type { ColumnDef, DataTypeDef, DataUnitDef } from 'containers/ProjectScreen/types'

export interface CellValidationContext {
  col: ColumnDef
  dataTypes: DataTypeDef[]
}

function findUnit(
  dataTypes: DataTypeDef[],
  dataTypeId: number | null,
  unitId: number | null
): DataUnitDef | null {
  if (dataTypeId == null || unitId == null) return null
  const dt = dataTypes.find((d) => d.id === dataTypeId)
  if (!dt) return null
  return dt.units.find((u) => u.id === unitId) ?? null
}

// Prefer the alias (proper Unicode, e.g. "W/m²") over the raw unit string
// (which carries ASCII like "W/m^2"). Fall back when alias is missing.
function unitLabel(unit: DataUnitDef): string {
  return unit.alias || unit.unit
}

// Verbose, unit-led format: "{unit} must be in {min}–{max}". One-sided
// variants use ≥ / ≤. Cell uses break-words as a safety net.
function formatRangeMessage(unit: DataUnitDef, min: number | null, max: number | null): string {
  const label = unitLabel(unit)
  if (min != null && max != null) return `${label} must be in ${min}–${max}`
  if (min != null) return `${label} must be ≥ ${min}`
  return `${label} must be ≤ ${max}`
}

export function validateCellValue(rawValue: string, ctx: CellValidationContext): string | null {
  const trimmed = rawValue.trim()
  if (trimmed === '') return null

  const unit = findUnit(ctx.dataTypes, ctx.col.dataTypeId, ctx.col.unitId)
  if (!unit) return null
  if (unit.min == null && unit.max == null) return null

  const num = Number(trimmed)
  if (!Number.isFinite(num)) {
    return `${unitLabel(unit)} must be a number`
  }

  if (unit.min != null && num < unit.min) {
    return formatRangeMessage(unit, unit.min, unit.max)
  }
  if (unit.max != null && num > unit.max) {
    return formatRangeMessage(unit, unit.min, unit.max)
  }
  return null
}
