import type { ColId, ColumnDef } from 'containers/ProjectScreen/types'

// The header metadata column whose `name` matches this string is treated as
// the date-time column. Its value is populated by clubbing each raw row's
// separate `date` and `time` fields.
export const DATETIME_COLUMN_NAME = 'date_time' as const

// Raw shape returned by GET /api/weather/data — date and time are separate
// fields; every other column comes back keyed by its ColId.
export interface RawDataRow {
  date: string
  time: string
  [colId: string]: string
}

export function findDateTimeColId(columns: ColumnDef[]): ColId | null {
  const col = columns.find((c) => c.name === DATETIME_COLUMN_NAME)
  return col ? col.id : null
}

// Merges raw rows' separate `date` + `time` into the date-time ColId from
// metadata, leaving every other column value verbatim. Returns the array
// shape the reducer expects in LOAD_SCENARIO_SUCCEEDED / ADD_ROW_SUCCEEDED.
export function mergeDateTimeIntoRows(
  columns: ColumnDef[],
  rawRows: RawDataRow[]
): Array<Record<ColId, string>> {
  const datetimeColId = findDateTimeColId(columns)

  return rawRows.map((raw) => {
    const merged: Record<ColId, string> = {}

    if (datetimeColId) {
      merged[datetimeColId] = `${raw.date} ${raw.time}`
    }

    for (const col of columns) {
      if (col.id === datetimeColId) continue
      const v = raw[col.id]
      if (v !== undefined) merged[col.id] = v
    }

    return merged
  })
}

// Splits a clubbed "<date> <time>" string back into pieces. Used by the
// cell-edit saga to recover the row's natural backend key (date + time)
// from the client-side WeatherTable.
export function splitDateTime(combined: string): { date: string; time: string } {
  const idx = combined.indexOf(' ')
  if (idx < 0) return { date: combined, time: '' }
  return { date: combined.slice(0, idx), time: combined.slice(idx + 1) }
}
