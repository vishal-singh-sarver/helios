import {
  DATE_COL_ID,
  TIME_COL_ID,
  type CellValue,
  type ColId,
  type DataTypeDef,
  type DataUnitDef,
  type RowId,
  type WeatherTable
} from 'containers/ProjectScreen/types'
import { truncateToMaxDecimals } from 'utils/decimalValidation'

export interface ConvertedColumnValues {
  values: Array<{ date: string; time: string; value: string }>
  valuesByRowId: Record<RowId, CellValue>
  previousValuesByRowId: Record<RowId, CellValue>
}

interface ConvertWeatherValueArgs {
  value: CellValue | string
  dataType: DataTypeDef
  fromUnit: DataUnitDef
  toUnit: DataUnitDef
}

interface BuildConvertedColumnValuesArgs {
  table: WeatherTable
  colId: ColId
  dataType: DataTypeDef
  fromUnit: DataUnitDef
  toUnit: DataUnitDef
}

function formatConvertedNumber(value: number): string {
  const rounded = Number(value.toFixed(12))
  const truncated = truncateToMaxDecimals(String(rounded)).value
  return truncated.includes('.') ? truncated.replace(/\.?0+$/, '') : truncated
}

function canUseCatalogUnit(unit: DataUnitDef): boolean {
  return (
    Number.isFinite(unit.to_base_factor) &&
    Number.isFinite(unit.to_base_offset) &&
    unit.to_base_factor !== 0
  )
}

function convertByCatalog(value: number, fromUnit: DataUnitDef, toUnit: DataUnitDef): number {
  const baseValue = value * fromUnit.to_base_factor + fromUnit.to_base_offset
  return (baseValue - toUnit.to_base_offset) / toUnit.to_base_factor
}

export function canConvertWeatherUnit(
  dataType: DataTypeDef,
  fromUnit: DataUnitDef,
  toUnit: DataUnitDef
): boolean {
  if (fromUnit.id === toUnit.id) return false
  if (fromUnit.data_type_id !== dataType.id || toUnit.data_type_id !== dataType.id) return false
  return canUseCatalogUnit(fromUnit) && canUseCatalogUnit(toUnit)
}

export function convertWeatherValue({
  value,
  dataType,
  fromUnit,
  toUnit
}: ConvertWeatherValueArgs): string {
  if (value == null) return 'NAN'

  const raw = String(value).trim()
  if (raw === '' || raw.toUpperCase() === 'NAN') return 'NAN'

  const numericValue = Number(raw)
  if (!Number.isFinite(numericValue)) return raw

  if (!canConvertWeatherUnit(dataType, fromUnit, toUnit)) return raw

  const convertedValue = convertByCatalog(numericValue, fromUnit, toUnit)
  if (!Number.isFinite(convertedValue)) return raw
  return formatConvertedNumber(convertedValue)
}

export function buildConvertedColumnValues({
  table,
  colId,
  dataType,
  fromUnit,
  toUnit
}: BuildConvertedColumnValuesArgs): ConvertedColumnValues | null {
  if (!canConvertWeatherUnit(dataType, fromUnit, toUnit)) return null

  const values: ConvertedColumnValues['values'] = []
  const valuesByRowId: Record<RowId, CellValue> = {}
  const previousValuesByRowId: Record<RowId, CellValue> = {}

  for (const rowId of table.rowOrder) {
    const row = table.rows[rowId]
    if (!row) continue
    const date = row[DATE_COL_ID]
    const time = row[TIME_COL_ID]
    if (date == null || time == null) continue

    const previousValue = row[colId] ?? null
    const convertedValue = convertWeatherValue({
      value: previousValue,
      dataType,
      fromUnit,
      toUnit
    })

    previousValuesByRowId[rowId] = previousValue
    valuesByRowId[rowId] = convertedValue === 'NAN' ? null : convertedValue
    values.push({ date, time, value: convertedValue })
  }

  return { values, valuesByRowId, previousValuesByRowId }
}
