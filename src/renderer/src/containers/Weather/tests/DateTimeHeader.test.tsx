import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import type { DataTypeDef, DataUnitDef } from 'containers/ProjectScreen/types'
import DateTimeHeader from '../DateTimeHeader'

vi.mock('@renderer/assets/ChevronDownIcon.svg', () => ({ default: 'ChevronDownIcon.svg' }))

// ── Fixtures ─────────────────────────────────────────────────────────────────
//
// DateTimeHeader is catalog-driven: it lists the `units[]` of the `date_time`
// data type as selectable formats. Each unit's `unit` string is a display
// pattern ("MM/DD/YYYY HH:MM"); picking one PATCHes (dataTypeId, unitId).

function makeUnit(id: number, unit: string): DataUnitDef {
  return {
    id,
    unit,
    alias: unit,
    data_type_id: 7,
    min: null,
    max: null,
    to_base_factor: 1,
    to_base_offset: 0,
    is_base: id === 1,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z'
  }
}

const UNITS: DataUnitDef[] = [
  makeUnit(1, 'MM/DD/YYYY HH:MM'),
  makeUnit(2, 'DD/MM/YYYY HH:MM'),
  makeUnit(3, 'YYYY-MM-DDTHH:MM:SSZ')
]

const DATE_TIME_TYPE: DataTypeDef = {
  id: 7,
  data_type: 'date_time',
  description: 'Date and time',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
  units: UNITS
}

describe('<DateTimeHeader />', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders the trigger button labelled "Date-Time"', () => {
    render(<DateTimeHeader dataType={DATE_TIME_TYPE} currentUnitId={1} onPatch={vi.fn()} />)
    expect(screen.getByRole('button', { name: /date-time/i })).toBeInTheDocument()
  })

  it('does not render the listbox by default', () => {
    render(<DateTimeHeader dataType={DATE_TIME_TYPE} currentUnitId={1} onPatch={vi.fn()} />)
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('opens the listbox on trigger click and shows every unit', () => {
    render(<DateTimeHeader dataType={DATE_TIME_TYPE} currentUnitId={1} onPatch={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: /date-time/i }))
    expect(screen.getByRole('listbox')).toBeInTheDocument()
    for (const u of UNITS) {
      expect(screen.getByRole('option', { name: u.unit })).toBeInTheDocument()
    }
  })

  it('shows the empty-state message when the data type has no units', () => {
    render(<DateTimeHeader dataType={undefined} currentUnitId={null} onPatch={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: /date-time/i }))
    expect(screen.getByText('No formats')).toBeInTheDocument()
  })

  it('marks the current unit as aria-selected', () => {
    render(<DateTimeHeader dataType={DATE_TIME_TYPE} currentUnitId={2} onPatch={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: /date-time/i }))
    expect(screen.getByRole('option', { name: UNITS[1].unit })).toHaveAttribute(
      'aria-selected',
      'true'
    )
  })

  it('PATCHes (dataTypeId, unitId) and closes when a new unit is picked', () => {
    const onPatch = vi.fn()
    render(<DateTimeHeader dataType={DATE_TIME_TYPE} currentUnitId={1} onPatch={onPatch} />)
    fireEvent.click(screen.getByRole('button', { name: /date-time/i }))
    fireEvent.click(screen.getByRole('option', { name: UNITS[2].unit }))
    expect(onPatch).toHaveBeenCalledWith({ dataTypeId: 7, unitId: 3 })
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('does not PATCH when the already-selected unit is picked, just closes', () => {
    const onPatch = vi.fn()
    render(<DateTimeHeader dataType={DATE_TIME_TYPE} currentUnitId={1} onPatch={onPatch} />)
    fireEvent.click(screen.getByRole('button', { name: /date-time/i }))
    fireEvent.click(screen.getByRole('option', { name: UNITS[0].unit }))
    expect(onPatch).not.toHaveBeenCalled()
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('toggles closed when the trigger is clicked twice', () => {
    render(<DateTimeHeader dataType={DATE_TIME_TYPE} currentUnitId={1} onPatch={vi.fn()} />)
    const btn = screen.getByRole('button', { name: /date-time/i })
    fireEvent.click(btn)
    fireEvent.click(btn)
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('closes when the user mousedowns outside the popover', () => {
    render(<DateTimeHeader dataType={DATE_TIME_TYPE} currentUnitId={1} onPatch={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: /date-time/i }))
    fireEvent.mouseDown(document.body)
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })
})
