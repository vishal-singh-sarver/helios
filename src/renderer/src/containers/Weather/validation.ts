// Cell value validation against the catalog's per-unit min/max range.
//
// Returns null when the value is acceptable (or when validation cannot run —
// empty cell, no data type / unit assigned, or the catalog hasn't published
// a range for this unit yet). The error message format mirrors the spec:
//   "{column name} must be between {min} and {max} {unit symbol}"

import type { ColumnDef, DataTypeDef, DataUnitDef } from 'containers/ProjectScreen/types'

// Cell-wide hard bound applied regardless of data type / unit. The live
// CellInput keystroke guard refuses input that would put the value outside
// this range, but the bound is also enforced here so non-keystroke paths
// (paste, import, saga revalidation on data-type/unit change) reject the
// same values.
export const GLOBAL_CELL_MIN = -1_000_000
export const GLOBAL_CELL_MAX = 1_000_000
export const GLOBAL_RANGE_MESSAGE = 'Value should be between -1000000 and 1000000.'
export const NON_NUMERIC_MESSAGE = 'Value must be a number'

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
  
  if (min != null && max != null) return `Value should be between ${min} and ${max}`
  if (min != null) return `Values should be ≥ ${min}`
  return `Values should be ≤ ${max}`
}

export function validateCellValue(rawValue: string, ctx: CellValidationContext): string | null {
  const trimmed = rawValue.trim()
  if (trimmed === '') return null

  const unit = findUnit(ctx.dataTypes, ctx.col.dataTypeId, ctx.col.unitId)
  const num = Number(trimmed)

  // No unit configured yet, but weather cells are always numeric (the backend
  // stores floats), so non-numeric input is rejected here too — this backstops
  // the partial states the CellInput keystroke gate lets through ("-", "1e").
  if (!unit) {
    if (!Number.isFinite(num)) return NON_NUMERIC_MESSAGE
    if (num < GLOBAL_CELL_MIN || num > GLOBAL_CELL_MAX) return GLOBAL_RANGE_MESSAGE
    return null
  }

  if (!Number.isFinite(num)) {
    return `${unitLabel(unit)} must be a number`
  }

  // Global bound wins over unit-specific range when both would trip — the
  // global rule is the hard floor/ceiling for any cell.
  if (num < GLOBAL_CELL_MIN || num > GLOBAL_CELL_MAX) {
    return GLOBAL_RANGE_MESSAGE
  }

  if (unit.min == null && unit.max == null) return null

  if (unit.min != null && num < unit.min) {
    return formatRangeMessage(unit, unit.min, unit.max)
  }
  if (unit.max != null && num > unit.max) {
    return formatRangeMessage(unit, unit.min, unit.max)
  }
  return null
}
