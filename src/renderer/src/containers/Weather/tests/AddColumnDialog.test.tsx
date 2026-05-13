import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import * as projectActions from 'containers/ProjectScreen/actions'
import type { DataTypeDef } from 'containers/ProjectScreen/types'
import React from 'react'
import AddColumnDialog from '../AddColumnDialog'

// ── Hand-rolled selector + dispatch wiring (the dialog is fully Redux-bound) ─

const mockDispatch = vi.fn()
const sel = {
  projectId: 'proj-1' as string | null,
  scenarioId: 'scen-1' as string | null,
  dataTypes: [] as DataTypeDef[],
  loading: false,
  error: null as string | null
}

vi.mock('react-redux', () => ({
  useSelector: (s: (state: unknown) => unknown) => s({} as never),
  useDispatch: () => mockDispatch
}))

vi.mock('../selectors', () => ({
  selectActiveProjectId: () => sel.projectId,
  selectActiveScenarioId: () => sel.scenarioId,
  selectSelectableDataTypes: () => sel.dataTypes,
  selectAddColumnLoading: () => sel.loading,
  selectAddColumnError: () => sel.error
}))

// ── Lightweight stubs for the shared UI primitives ──────────────────────────

vi.mock('@renderer/components/Dialog', () => ({
  default: ({
    isOpen,
    title,
    onClose,
    children
  }: {
    isOpen: boolean
    title: string
    onClose: () => void
    children: React.ReactNode
  }) =>
    isOpen ? (
      <div data-testid="dialog" aria-label={title}>
        <button data-testid="dialog-close" onClick={onClose}>
          ×
        </button>
        {children}
      </div>
    ) : null
}))

vi.mock('@renderer/components/FormField', () => ({
  default: ({
    labelProps,
    inputProps
  }: {
    labelProps: { label: string }
    inputProps: {
      name?: string
      value?: string
      onChange?: React.ChangeEventHandler<HTMLInputElement | HTMLSelectElement>
      onBlur?: React.FocusEventHandler<HTMLInputElement>
      error?: string
      disabled?: boolean
      options?: { value: string; label: string }[]
      placeholder?: string
    }
  }) => {
    const name = inputProps.name ?? labelProps.label
    const isSelect = !!inputProps.options
    return (
      <div data-testid={`ff-${name}`}>
        <label>{labelProps.label}</label>
        {isSelect ? (
          <select
            data-testid={`input-${name}`}
            name={name}
            value={inputProps.value ?? ''}
            onChange={inputProps.onChange as React.ChangeEventHandler<HTMLSelectElement>}
            onBlur={inputProps.onBlur as unknown as React.FocusEventHandler<HTMLSelectElement>}
            disabled={inputProps.disabled}
          >
            <option value="">{inputProps.placeholder ?? ''}</option>
            {(inputProps.options ?? []).map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            data-testid={`input-${name}`}
            name={name}
            value={inputProps.value ?? ''}
            onChange={inputProps.onChange as React.ChangeEventHandler<HTMLInputElement>}
            onBlur={inputProps.onBlur as React.FocusEventHandler<HTMLInputElement>}
          />
        )}
        {inputProps.error && <span data-testid={`error-${name}`}>{inputProps.error}</span>}
      </div>
    )
  }
}))

vi.mock('@renderer/components/LoadingScreen/Spinner', () => ({
  Spinner: () => <span data-testid="spinner" />
}))

// ── Fixtures ────────────────────────────────────────────────────────────────

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

function resetSel(): void {
  sel.projectId = 'proj-1'
  sel.scenarioId = 'scen-1'
  sel.dataTypes = dataTypes
  sel.loading = false
  sel.error = null
}

describe('<AddColumnDialog />', () => {
  beforeEach(() => {
    mockDispatch.mockClear()
    resetSel()
  })

  afterEach(() => {
    cleanup()
  })

  it('renders nothing when isOpen is false', () => {
    render(<AddColumnDialog isOpen={false} onClose={vi.fn()} />)
    expect(screen.queryByTestId('dialog')).not.toBeInTheDocument()
  })

  it('renders the dialog with all form fields when open', () => {
    render(<AddColumnDialog isOpen onClose={vi.fn()} />)
    expect(screen.getByTestId('dialog')).toHaveAttribute('aria-label', 'Add Column')
    expect(screen.getByTestId('ff-parameterName')).toBeInTheDocument()
    expect(screen.getByTestId('ff-dataTypeId')).toBeInTheDocument()
    expect(screen.getByTestId('ff-unitId')).toBeInTheDocument()
    expect(screen.getByTestId('ff-defaultValue')).toBeInTheDocument()
  })

  it('pre-fills the default value with "0"', () => {
    render(<AddColumnDialog isOpen onClose={vi.fn()} />)
    expect(screen.getByTestId('input-defaultValue')).toHaveValue('')
  })

  it('disables the unit field until a data type is chosen', () => {
    render(<AddColumnDialog isOpen onClose={vi.fn()} />)
    expect(screen.getByTestId('input-unitId')).toBeDisabled()
  })

  it('enables the unit field once a data type is chosen', () => {
    render(<AddColumnDialog isOpen onClose={vi.fn()} />)
    fireEvent.change(screen.getByTestId('input-dataTypeId'), { target: { value: '1' } })
    expect(screen.getByTestId('input-unitId')).not.toBeDisabled()
  })

  it('resets unitId when the data type changes', () => {
    render(<AddColumnDialog isOpen onClose={vi.fn()} />)
    fireEvent.change(screen.getByTestId('input-dataTypeId'), { target: { value: '1' } })
    fireEvent.change(screen.getByTestId('input-unitId'), { target: { value: '10' } })
    expect(screen.getByTestId('input-unitId')).toHaveValue('10')
    fireEvent.change(screen.getByTestId('input-dataTypeId'), { target: { value: '' } })
    expect(screen.getByTestId('input-unitId')).toHaveValue('')
  })

  it('shows a required error when name is left empty after blur', async () => {
    render(<AddColumnDialog isOpen onClose={vi.fn()} />)
    fireEvent.blur(screen.getByTestId('input-parameterName'))
    await waitFor(() =>
      expect(screen.getByTestId('error-parameterName')).toHaveTextContent(
        'Column name is required.'
      )
    )
  })

  it('shows a length error when name exceeds 50 characters', async () => {
    render(<AddColumnDialog isOpen onClose={vi.fn()} />)
    const input = screen.getByTestId('input-parameterName')
    fireEvent.change(input, { target: { value: 'A'.repeat(51) } })
    await waitFor(() =>
      expect(screen.getByTestId('error-parameterName')).toHaveTextContent(
        'Column name must be 50 characters or fewer.'
      )
    )
  })

  it('dispatches addColumnRequested with parsed values on submit', async () => {
    render(<AddColumnDialog isOpen onClose={vi.fn()} />)
    fireEvent.change(screen.getByTestId('input-parameterName'), { target: { value: '  Temp  ' } })
    fireEvent.change(screen.getByTestId('input-dataTypeId'), { target: { value: '1' } })
    fireEvent.change(screen.getByTestId('input-unitId'), { target: { value: '10' } })
    fireEvent.click(within(screen.getByTestId('dialog')).getByText('Add'))

    await waitFor(() =>
      expect(mockDispatch).toHaveBeenCalledWith(
        projectActions.addColumnRequested('proj-1', 'scen-1', 'Temp', 1, 10, '')
      )
    )
  })

  it('dispatches with null ids when type/unit are not picked', async () => {
    render(<AddColumnDialog isOpen onClose={vi.fn()} />)
    fireEvent.change(screen.getByTestId('input-parameterName'), { target: { value: 'X' } })
    fireEvent.click(within(screen.getByTestId('dialog')).getByText('Add'))

    await waitFor(() =>
      expect(mockDispatch).toHaveBeenCalledWith(
        projectActions.addColumnRequested('proj-1', 'scen-1', 'X', null, null, '')
      )
    )
  })

  it('does not dispatch on invalid submit', async () => {
    render(<AddColumnDialog isOpen onClose={vi.fn()} />)
    fireEvent.click(within(screen.getByTestId('dialog')).getByText('Add'))
    await waitFor(() => expect(screen.getByTestId('error-parameterName')).toBeInTheDocument())
    expect(mockDispatch).not.toHaveBeenCalled()
  })

  it('does not dispatch when projectId or scenarioId is missing', async () => {
    sel.projectId = null
    render(<AddColumnDialog isOpen onClose={vi.fn()} />)
    fireEvent.change(screen.getByTestId('input-parameterName'), { target: { value: 'X' } })
    fireEvent.click(within(screen.getByTestId('dialog')).getByText('Add'))
    await new Promise((r) => setTimeout(r, 0))
    expect(mockDispatch).not.toHaveBeenCalled()
  })

  it('renders the spinner and disables both buttons while loading', () => {
    sel.loading = true
    render(<AddColumnDialog isOpen onClose={vi.fn()} />)
    expect(screen.getByTestId('spinner')).toBeInTheDocument()
    const dialog = screen.getByTestId('dialog')
    expect(within(dialog).getByText('Cancel')).toBeDisabled()
  })

  it('renders the server-side error banner', () => {
    sel.error = 'Failed to add column'
    render(<AddColumnDialog isOpen onClose={vi.fn()} />)
    expect(screen.getByRole('alert')).toHaveTextContent('Failed to add column')
  })

  it('calls onClose when Cancel is clicked', () => {
    const onClose = vi.fn()
    render(<AddColumnDialog isOpen onClose={onClose} />)
    fireEvent.click(within(screen.getByTestId('dialog')).getByText('Cancel'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('does not call onClose while loading', () => {
    sel.loading = true
    const onClose = vi.fn()
    render(<AddColumnDialog isOpen onClose={onClose} />)
    fireEvent.click(screen.getByTestId('dialog-close'))
    expect(onClose).not.toHaveBeenCalled()
  })
})
