import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import DataTypeUnitPicker from '../DataTypeUnitPicker'
import type { ColumnDef, DataTypeDef } from 'containers/ProjectScreen/types'

const tempType: DataTypeDef = {
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
      min: null,
      max: null,
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
      min: null,
      max: null,
      to_base_factor: 1,
      to_base_offset: -273.15,
      is_base: false,
      created_at: '',
      updated_at: ''
    }
  ]
}

const speedType: DataTypeDef = {
  id: 2,
  data_type: 'Speed',
  description: '',
  created_at: '',
  updated_at: '',
  units: [
    {
      id: 20,
      unit: 'm/s',
      alias: '',
      data_type_id: 2,
      min: 0,
      max: null,
      to_base_factor: 1,
      to_base_offset: 0,
      is_base: false,
      created_at: '',
      updated_at: ''
    },
    {
      id: 21,
      unit: 'km/h',
      alias: '',
      data_type_id: 2,
      min: 0,
      max: null,
      to_base_factor: 0.27778,
      to_base_offset: 0,
      is_base: true,
      created_at: '',
      updated_at: ''
    }
  ]
}

const dataTypes = [tempType, speedType]

const colWithType: ColumnDef = { id: '1', name: 'col', dataTypeId: 1, unitId: 10 }
const colNoType: ColumnDef = { id: '1', name: 'col', dataTypeId: null, unitId: null }

describe('<DataTypeUnitPicker />', () => {
  afterEach(() => {
    cleanup()
  })

  // ── Closed-state button label ────────────────────────────────────────────

  it('shows "Data Type" when no data type is set', () => {
    render(
      <DataTypeUnitPicker
        col={colNoType}
        dataTypes={dataTypes}
        currentDataType={undefined}
        unitsForType={[]}
        onPatch={vi.fn()}
      />
    )
    expect(screen.getByRole('button', { name: /data type and unit/i })).toHaveTextContent(
      'Data Type'
    )
  })

  it('shows the data type name when a type is set without a unit', () => {
    const col = { ...colWithType, unitId: null }
    render(
      <DataTypeUnitPicker
        col={col}
        dataTypes={dataTypes}
        currentDataType={tempType}
        unitsForType={tempType.units}
        onPatch={vi.fn()}
      />
    )
    expect(screen.getByRole('button', { name: /data type and unit/i })).toHaveTextContent(
      'Temperature'
    )
  })

  it('shows only the unit when both type and unit are set and alias exists', () => {
    render(
      <DataTypeUnitPicker
        col={colWithType}
        dataTypes={dataTypes}
        currentDataType={tempType}
        unitsForType={tempType.units}
        onPatch={vi.fn()}
      />
    )
    expect(screen.getByRole('button', { name: /data type and unit/i })).toHaveTextContent('C')
  })

  it('shows just the unit when alias is empty', () => {
    const col = { ...colWithType, unitId: 11 }
    render(
      <DataTypeUnitPicker
        col={col}
        dataTypes={dataTypes}
        currentDataType={tempType}
        unitsForType={tempType.units}
        onPatch={vi.fn()}
      />
    )
    expect(screen.getByRole('button', { name: /data type and unit/i })).toHaveTextContent('K')
  })

  // ── Popover open/close ──────────────────────────────────────────────────

  it('opens the listbox on button click', () => {
    render(
      <DataTypeUnitPicker
        col={colNoType}
        dataTypes={dataTypes}
        currentDataType={undefined}
        unitsForType={[]}
        onPatch={vi.fn()}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: /data type and unit/i }))
    expect(screen.getByRole('listbox')).toBeInTheDocument()
  })

  it('closes the listbox on outside mousedown', () => {
    render(
      <DataTypeUnitPicker
        col={colNoType}
        dataTypes={dataTypes}
        currentDataType={undefined}
        unitsForType={[]}
        onPatch={vi.fn()}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: /data type and unit/i }))
    fireEvent.mouseDown(document.body)
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  // ── View transitions ────────────────────────────────────────────────────

  it('opens to the type view when no data type is set', () => {
    render(
      <DataTypeUnitPicker
        col={colNoType}
        dataTypes={dataTypes}
        currentDataType={undefined}
        unitsForType={[]}
        onPatch={vi.fn()}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: /data type and unit/i }))
    expect(screen.getByRole('option', { name: 'Temperature' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Speed' })).toBeInTheDocument()
  })

  it('opens to the unit view when a data type is set', () => {
    render(
      <DataTypeUnitPicker
        col={colWithType}
        dataTypes={dataTypes}
        currentDataType={tempType}
        unitsForType={tempType.units}
        onPatch={vi.fn()}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: /data type and unit/i }))
    expect(screen.getByText('‹ Back to Assign Type')).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'C (°C)' })).toBeInTheDocument()
  })

  it('marks the base unit as Default in the unit view', () => {
    render(
      <DataTypeUnitPicker
        col={colWithType}
        dataTypes={dataTypes}
        currentDataType={tempType}
        unitsForType={tempType.units}
        onPatch={vi.fn()}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: /data type and unit/i }))
    expect(screen.getByText('Default')).toBeInTheDocument()
  })

  it('switches back to the type view from "Back to Assign Type" and clears the assignment', () => {
    const onPatch = vi.fn()
    render(
      <DataTypeUnitPicker
        col={colWithType}
        dataTypes={dataTypes}
        currentDataType={tempType}
        unitsForType={tempType.units}
        onPatch={onPatch}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: /data type and unit/i }))
    fireEvent.click(screen.getByText(/Back to Assign Type/))
    expect(onPatch).toHaveBeenCalledWith({ dataTypeId: null, unitId: null })
    expect(screen.getByRole('option', { name: 'Temperature' })).toBeInTheDocument()
  })

  // ── Picking a data type ─────────────────────────────────────────────────

  it('picking a different data type patches dataTypeId and a base unit, then advances to unit view', () => {
    const onPatch = vi.fn()
    render(
      <DataTypeUnitPicker
        col={colWithType}
        dataTypes={dataTypes}
        currentDataType={tempType}
        unitsForType={tempType.units}
        onPatch={onPatch}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: /data type and unit/i }))
    fireEvent.click(screen.getByText(/Back to Assign Type/))
    fireEvent.click(screen.getByRole('option', { name: 'Speed' }))
    // km/h is the is_base unit for speedType.
    expect(onPatch).toHaveBeenCalledWith({ dataTypeId: 2, unitId: 21 })
  })

  it('picking the same data type does not patch and just advances to unit view', () => {
    const onPatch = vi.fn()
    render(
      <DataTypeUnitPicker
        col={colWithType}
        dataTypes={dataTypes}
        currentDataType={tempType}
        unitsForType={tempType.units}
        onPatch={onPatch}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: /data type and unit/i }))
    fireEvent.click(screen.getByText(/Back to Assign Type/))
    onPatch.mockClear()
    fireEvent.click(screen.getByRole('option', { name: 'Temperature' }))
    expect(onPatch).not.toHaveBeenCalled()
  })

  it('falls back to the first unit when no unit is flagged is_base', () => {
    // Build a type whose units have no base — picker should pick units[0].
    const noBaseType: DataTypeDef = {
      id: 3,
      data_type: 'NoBase',
      description: '',
      created_at: '',
      updated_at: '',
      units: [
        {
          id: 30,
          unit: 'a',
          alias: '',
          data_type_id: 3,
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
    const onPatch = vi.fn()
    render(
      <DataTypeUnitPicker
        col={colNoType}
        dataTypes={[noBaseType]}
        currentDataType={undefined}
        unitsForType={[]}
        onPatch={onPatch}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: /data type and unit/i }))
    fireEvent.click(screen.getByRole('option', { name: 'NoBase' }))
    expect(onPatch).toHaveBeenCalledWith({ dataTypeId: 3, unitId: 30 })
  })

  // ── Picking a unit ──────────────────────────────────────────────────────

  it('picking a different unit patches unitId and closes the popover', () => {
    const onPatch = vi.fn()
    render(
      <DataTypeUnitPicker
        col={colWithType}
        dataTypes={dataTypes}
        currentDataType={tempType}
        unitsForType={tempType.units}
        onPatch={onPatch}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: /data type and unit/i }))
    fireEvent.click(screen.getByRole('option', { name: 'K' }))
    expect(onPatch).toHaveBeenCalledWith({ unitId: 11 })
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('picking the same unit closes the popover without patching', () => {
    const onPatch = vi.fn()
    render(
      <DataTypeUnitPicker
        col={colWithType}
        dataTypes={dataTypes}
        currentDataType={tempType}
        unitsForType={tempType.units}
        onPatch={onPatch}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: /data type and unit/i }))
    fireEvent.click(screen.getByRole('option', { name: 'C (°C)' }))
    expect(onPatch).not.toHaveBeenCalled()
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('shows "No units" when the unit view has nothing to render', () => {
    render(
      <DataTypeUnitPicker
        col={{ ...colWithType, unitId: null }}
        dataTypes={dataTypes}
        currentDataType={tempType}
        unitsForType={[]}
        onPatch={vi.fn()}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: /data type and unit/i }))
    expect(screen.getByText('No units')).toBeInTheDocument()
  })
})
