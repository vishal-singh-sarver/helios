import type { DataTypeDef, DataUnitDef, WeatherTable } from 'containers/ProjectScreen/types'
import { buildConvertedColumnValues, convertWeatherValue } from '../unitConversion'

function unit(
  id: number,
  unitName: string,
  alias = '',
  toBaseFactor = 1,
  toBaseOffset = 0
): DataUnitDef {
  return {
    id,
    unit: unitName,
    alias,
    data_type_id: 1,
    min: null,
    max: null,
    to_base_factor: toBaseFactor,
    to_base_offset: toBaseOffset,
    is_base: false,
    created_at: '',
    updated_at: ''
  }
}

function dataType(data_type: string, units: DataUnitDef[]): DataTypeDef {
  return {
    id: 1,
    data_type,
    description: '',
    created_at: '',
    updated_at: '',
    units
  }
}

describe('unitConversion', () => {
  it('converts temperature values through Kelvin', () => {
    const k = unit(1, 'K')
    const c = unit(2, 'C', '°C', 1, 273.15)
    const f = unit(3, 'F', '°F', 5 / 9, 255.3722222222222)
    const dt = dataType('Temperature', [k, c, f])

    expect(convertWeatherValue({ value: '300', dataType: dt, fromUnit: k, toUnit: c })).toBe(
      '26.85'
    )
    expect(convertWeatherValue({ value: '0', dataType: dt, fromUnit: c, toUnit: f })).toBe('32')
  })

  it('converts pressure, wind, humidity, radiation, and CO2 values', () => {
    expect(
      convertWeatherValue({
        value: '1000',
        dataType: dataType('Air Pressure', [unit(1, 'hPa', '', 100), unit(2, 'Pa')]),
        fromUnit: unit(1, 'hPa', '', 100),
        toUnit: unit(2, 'Pa')
      })
    ).toBe('100000')

    expect(
      convertWeatherValue({
        value: '10',
        dataType: dataType('Wind Speed', [unit(1, 'm/s'), unit(2, 'km/h', '', 1 / 3.6)]),
        fromUnit: unit(1, 'm/s'),
        toUnit: unit(2, 'km/h', '', 1 / 3.6)
      })
    ).toBe('36')

    expect(
      convertWeatherValue({
        value: '50',
        dataType: dataType('Air Humidity', [unit(1, '0-100', 'percent', 0.01), unit(2, '0-1')]),
        fromUnit: unit(1, '0-100', 'percent', 0.01),
        toUnit: unit(2, '0-1')
      })
    ).toBe('0.5')

    expect(
      convertWeatherValue({
        value: '1000',
        dataType: dataType('DNR', [unit(1, 'W/m²'), unit(2, 'kW/m²', '', 1000)]),
        fromUnit: unit(1, 'W/m²'),
        toUnit: unit(2, 'kW/m²', '', 1000)
      })
    ).toBe('1')

    expect(
      convertWeatherValue({
        value: '400',
        dataType: dataType('Air CO2 Concentration', [unit(1, 'ppm'), unit(2, 'ppb', '', 0.001)]),
        fromUnit: unit(1, 'ppm'),
        toUnit: unit(2, 'ppb', '', 0.001)
      })
    ).toBe('400000')
  })

  it('preserves NAN, null, and unsupported values safely', () => {
    const dt = dataType('Turbidity', [unit(1, 'normalized'), unit(2, 'extended')])

    expect(
      convertWeatherValue({
        value: null,
        dataType: dt,
        fromUnit: unit(1, 'x'),
        toUnit: unit(2, 'y')
      })
    ).toBe('NAN')
    expect(
      convertWeatherValue({
        value: 'abc',
        dataType: dataType('Temperature', [unit(1, 'K'), unit(2, 'C')]),
        fromUnit: unit(1, 'K'),
        toUnit: unit(2, 'C')
      })
    ).toBe('abc')
    expect(
      convertWeatherValue({
        value: '2',
        dataType: dt,
        fromUnit: unit(1, 'x'),
        toUnit: unit(2, 'y')
      })
    ).toBe('2')
  })

  it('builds updateCol values and row-local values in one pass', () => {
    const k = unit(1, 'K')
    const c = unit(2, 'C', '°C', 1, 273.15)
    const dt = dataType('Temperature', [k, c])
    const table: WeatherTable = {
      columns: {
        date: { id: 'date', name: 'date', dataTypeId: null, unitId: null },
        time: { id: 'time', name: 'time', dataTypeId: null, unitId: null },
        '15': { id: '15', name: 'temp', dataTypeId: 1, unitId: 2 }
      },
      columnOrder: ['date', 'time', '15'],
      rows: {
        row_0: { date: '2026-01-01', time: '10:00:00', '15': '300' },
        row_1: { date: '2026-01-01', time: '11:00:00', '15': null },
        row_2: { date: '2026-01-01', time: null, '15': '301' }
      },
      rowOrder: ['row_0', 'row_1', 'row_2'],
      validationErrors: {},
      columnNameErrors: {},
      cellSync: {},
      rowSelection: {}
    }

    expect(
      buildConvertedColumnValues({ table, colId: '15', dataType: dt, fromUnit: k, toUnit: c })
    ).toEqual({
      values: [
        { date: '2026-01-01', time: '10:00:00', value: '26.85' },
        { date: '2026-01-01', time: '11:00:00', value: 'NAN' }
      ],
      valuesByRowId: { row_0: '26.85', row_1: null },
      previousValuesByRowId: { row_0: '300', row_1: null }
    })
  })
})
