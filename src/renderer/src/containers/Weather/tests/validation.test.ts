import { validateCellValue } from '../validation'
import type { ColumnDef, DataTypeDef } from 'containers/ProjectScreen/types'

// Build a minimal DataTypeDef list shaped like the wire response. Fields not
// touched by the validator are filled with cheap defaults so the fixture
// doesn't drift if the type grows.
function makeDataTypes(): DataTypeDef[] {
  return [
    {
      id: 1,
      data_type: 'Temperature',
      description: '',
      created_at: '',
      updated_at: '',
      units: [
        {
          id: 10,
          unit: 'C',
          alias: '°C',
          data_type_id: 1,
          min: -50,
          max: 50,
          to_base_factor: 1,
          to_base_offset: 0,
          is_base: true,
          created_at: '',
          updated_at: ''
        },
        {
          id: 11,
          unit: 'K',
          alias: '',
          data_type_id: 1,
          min: 0,
          max: null,
          to_base_factor: 1,
          to_base_offset: -273.15,
          is_base: false,
          created_at: '',
          updated_at: ''
        },
        {
          id: 12,
          unit: 'pct',
          alias: '%',
          data_type_id: 1,
          min: null,
          max: 100,
          to_base_factor: 1,
          to_base_offset: 0,
          is_base: false,
          created_at: '',
          updated_at: ''
        },
        {
          id: 13,
          unit: 'free',
          alias: 'free',
          data_type_id: 1,
          min: null,
          max: null,
          to_base_factor: 1,
          to_base_offset: 0,
          is_base: false,
          created_at: '',
          updated_at: ''
        }
      ]
    }
  ]
}

const baseCol: ColumnDef = {
  id: 'temp',
  name: 'Temperature',
  dataTypeId: 1,
  unitId: 10
}

describe('validateCellValue', () => {
  // ── Empty / unconfigured cases — short-circuit to null ────────────────────

  it('returns null for an empty value', () => {
    expect(validateCellValue('', { col: baseCol, dataTypes: makeDataTypes() })).toBeNull()
  })

  it('returns null for whitespace-only value (treated as empty)', () => {
    expect(validateCellValue('   ', { col: baseCol, dataTypes: makeDataTypes() })).toBeNull()
  })

  it('returns null when column has no dataTypeId', () => {
    const col = { ...baseCol, dataTypeId: null }
    expect(validateCellValue('999', { col, dataTypes: makeDataTypes() })).toBeNull()
  })

  it('returns null when column has no unitId', () => {
    const col = { ...baseCol, unitId: null }
    expect(validateCellValue('999', { col, dataTypes: makeDataTypes() })).toBeNull()
  })

  it('returns null when dataType id does not exist in catalog', () => {
    const col = { ...baseCol, dataTypeId: 999 }
    expect(validateCellValue('5', { col, dataTypes: makeDataTypes() })).toBeNull()
  })

  it('returns null when unit id does not exist in catalog', () => {
    const col = { ...baseCol, unitId: 999 }
    expect(validateCellValue('5', { col, dataTypes: makeDataTypes() })).toBeNull()
  })

  it('returns null when the unit has neither min nor max', () => {
    const col = { ...baseCol, unitId: 13 }
    expect(validateCellValue('999', { col, dataTypes: makeDataTypes() })).toBeNull()
  })

  // ── NaN / non-numeric input ──────────────────────────────────────────────

  it('flags non-numeric input with an alias-led message', () => {
    expect(validateCellValue('abc', { col: baseCol, dataTypes: makeDataTypes() })).toBe(
      '°C must be a number'
    )
  })

  it('falls back to raw unit string when alias is missing', () => {
    const col = { ...baseCol, unitId: 11 }
    expect(validateCellValue('abc', { col, dataTypes: makeDataTypes() })).toBe(
      'K must be a number'
    )
  })

  // ── Bounded ranges ───────────────────────────────────────────────────────

  it('returns null when value is within both min and max', () => {
    expect(validateCellValue('25', { col: baseCol, dataTypes: makeDataTypes() })).toBeNull()
  })

  it('returns null at the lower bound (inclusive)', () => {
    expect(validateCellValue('-50', { col: baseCol, dataTypes: makeDataTypes() })).toBeNull()
  })

  it('returns null at the upper bound (inclusive)', () => {
    expect(validateCellValue('50', { col: baseCol, dataTypes: makeDataTypes() })).toBeNull()
  })

  it('flags value below min with the two-sided range message', () => {
    expect(validateCellValue('-100', { col: baseCol, dataTypes: makeDataTypes() })).toBe(
      '°C must be in -50–50'
    )
  })

  it('flags value above max with the two-sided range message', () => {
    expect(validateCellValue('100', { col: baseCol, dataTypes: makeDataTypes() })).toBe(
      '°C must be in -50–50'
    )
  })

  // ── One-sided ranges ─────────────────────────────────────────────────────

  it('uses ≥ format when only min is set', () => {
    const col = { ...baseCol, unitId: 11 }
    expect(validateCellValue('-1', { col, dataTypes: makeDataTypes() })).toBe(
      'K must be ≥ 0'
    )
  })

  it('returns null when value is at or above min and there is no max', () => {
    const col = { ...baseCol, unitId: 11 }
    expect(validateCellValue('999', { col, dataTypes: makeDataTypes() })).toBeNull()
  })

  it('uses ≤ format when only max is set', () => {
    const col = { ...baseCol, unitId: 12 }
    expect(validateCellValue('150', { col, dataTypes: makeDataTypes() })).toBe(
      '% must be ≤ 100'
    )
  })

  it('returns null when value is at or below max and there is no min', () => {
    const col = { ...baseCol, unitId: 12 }
    expect(validateCellValue('-50', { col, dataTypes: makeDataTypes() })).toBeNull()
  })

  // ── Whitespace handling — values are trimmed before parsing ──────────────

  it('trims surrounding whitespace before parsing', () => {
    expect(validateCellValue('  25  ', { col: baseCol, dataTypes: makeDataTypes() })).toBeNull()
  })
})
