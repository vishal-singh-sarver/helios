import React from 'react'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import HeaderEditor from '../HeaderEditor'
import type { ColumnDef, DataTypeDef } from 'containers/ProjectScreen/types'

// DataTypeUnitPicker is exercised by its own test — here we replace it with a
// stub that exposes the props HeaderEditor wires through, so the assertions
// stay focused on this component's behaviour.
vi.mock('../DataTypeUnitPicker', () => ({
  default: ({ col }: { col: ColumnDef }) => (
    <div data-testid="picker" data-col-id={col.id} data-data-type-id={String(col.dataTypeId)} />
  )
}))

vi.mock('@renderer/assets/delete.svg', () => ({ default: 'delete.svg' }))

const dataTypes: DataTypeDef[] = [
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
      }
    ]
  }
]

const baseCol: ColumnDef = { id: '1', name: 'Air Temp', dataTypeId: 1, unitId: 10 }

describe('<HeaderEditor />', () => {
  afterEach(() => {
    cleanup()
  })

  const renderEditor = (
    props: Partial<React.ComponentProps<typeof HeaderEditor>> = {}
  ): ReturnType<typeof render> =>
    render(
      <HeaderEditor
        col={baseCol}
        dataTypes={dataTypes}
        onPatch={vi.fn()}
        onDelete={vi.fn()}
        {...props}
      />
    )

  it('renders the column name in the input', () => {
    renderEditor()
    expect(screen.getByRole('textbox', { name: 'Column 1 name' })).toHaveValue('Air Temp')
  })

  it('renders the picker with the column wired through', () => {
    renderEditor()
    expect(screen.getByTestId('picker')).toHaveAttribute('data-col-id', '1')
  })

  it('renders the delete button', () => {
    renderEditor()
    expect(screen.getByRole('button', { name: 'Delete column 1' })).toBeInTheDocument()
  })

  it('calls onDelete when the delete button is clicked', () => {
    const onDelete = vi.fn()
    renderEditor({ onDelete })
    fireEvent.click(screen.getByRole('button', { name: 'Delete column 1' }))
    expect(onDelete).toHaveBeenCalledTimes(1)
  })

  it('updates the local name draft on change without committing', () => {
    const onPatch = vi.fn()
    renderEditor({ onPatch })
    const input = screen.getByRole('textbox', { name: 'Column 1 name' })
    fireEvent.change(input, { target: { value: 'Renamed' } })
    expect(input).toHaveValue('Renamed')
    expect(onPatch).not.toHaveBeenCalled()
  })

  it('commits a trimmed name patch on blur', () => {
    const onPatch = vi.fn()
    renderEditor({ onPatch })
    const input = screen.getByRole('textbox', { name: 'Column 1 name' })
    fireEvent.change(input, { target: { value: '  Renamed  ' } })
    fireEvent.blur(input)
    expect(onPatch).toHaveBeenCalledWith({ name: 'Renamed' })
  })

  it('does not commit when blur leaves the name unchanged', () => {
    const onPatch = vi.fn()
    renderEditor({ onPatch })
    const input = screen.getByRole('textbox', { name: 'Column 1 name' })
    fireEvent.blur(input)
    expect(onPatch).not.toHaveBeenCalled()
  })

  it('does not commit and reverts the draft when blurred while empty', () => {
    const onPatch = vi.fn()
    renderEditor({ onPatch })
    const input = screen.getByRole('textbox', { name: 'Column 1 name' })
    fireEvent.change(input, { target: { value: '   ' } })
    fireEvent.blur(input)
    expect(onPatch).not.toHaveBeenCalled()
    expect(input).toHaveValue('Air Temp')
  })

  it('re-syncs the draft when col.name changes externally (rollback)', () => {
    const { rerender } = renderEditor()
    rerender(
      <HeaderEditor
        col={{ ...baseCol, name: 'External' }}
        dataTypes={dataTypes}
        onPatch={vi.fn()}
        onDelete={vi.fn()}
      />
    )
    expect(screen.getByRole('textbox', { name: 'Column 1 name' })).toHaveValue('External')
  })
})
