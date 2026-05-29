import React from 'react'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import HeaderEditor from '../HeaderEditor'
import { setColumnNameError } from 'containers/ProjectScreen/actions'
import type { ColumnDef, DataTypeDef } from 'containers/ProjectScreen/types'

// HeaderEditor reads the active scenario id and the per-column backend name
// error via useSelector, and dispatches a clear on edit. Mock react-redux +
// the selectors module so the test stays hermetic (mirrors CellInput.test).
let mockBackendNameError: string | null = null
const mockDispatch = vi.fn()

vi.mock('react-redux', () => ({
  useSelector: (selector: (state: unknown) => unknown) =>
    typeof selector === 'function' ? selector({}) : selector,
  useDispatch: () => mockDispatch
}))

vi.mock('../selectors', () => ({
  makeSelectColumnNameError: () => () => mockBackendNameError,
  selectActiveScenarioId: () => 'scen-1'
}))

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
  beforeEach(() => {
    mockBackendNameError = null
    mockDispatch.mockClear()
  })

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

  it('keeps the empty draft and shows the required error on blur (no silent revert)', () => {
    const onPatch = vi.fn()
    renderEditor({ onPatch })
    const input = screen.getByRole('textbox', { name: 'Column 1 name' })
    fireEvent.change(input, { target: { value: '   ' } })
    fireEvent.blur(input)
    expect(onPatch).not.toHaveBeenCalled()
    // The value is NOT reverted to the previous name…
    expect(input).toHaveValue('   ')
    // …and the validation error stays visible.
    expect(screen.getByText('Column name is required.')).toBeInTheDocument()
  })

  it('shows the backend name error inline while keeping the typed name', () => {
    mockBackendNameError = 'Name already exists'
    renderEditor({ col: { ...baseCol, name: 'humidity' } })
    expect(screen.getByRole('textbox', { name: 'Column 1 name' })).toHaveValue('humidity')
    expect(screen.getByText('Name already exists')).toBeInTheDocument()
  })

  it('clears the backend name error on a fresh edit', () => {
    mockBackendNameError = 'Name already exists'
    renderEditor()
    fireEvent.change(screen.getByRole('textbox', { name: 'Column 1 name' }), {
      target: { value: 'Renamed' }
    })
    expect(mockDispatch).toHaveBeenCalledWith(setColumnNameError('scen-1', '1', null))
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
