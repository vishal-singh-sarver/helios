import React from 'react'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import CellInput from '../CellInput'

// CellInput reads its per-cell error through useSelector(makeSelectCellError…).
// We mock react-redux directly so the test stays hermetic — no store, no
// reducer wiring needed.
let mockError: string | null = null

vi.mock('react-redux', () => ({
  useSelector: (selector: (state: unknown) => unknown) =>
    // The factory selector returned by makeSelectCellError ultimately reads
    // from the RootState. We bypass it and feed back the configured error.
    typeof selector === 'function' ? mockError : mockError
}))

vi.mock('../selectors', () => ({
  makeSelectCellError: () => () => mockError
}))

vi.mock('@renderer/components/Tooltip', () => ({
  default: ({ text, children }: { text: string; children: React.ReactNode }) => (
    <span data-testid="tooltip" data-text={text}>
      {children}
    </span>
  )
}))

vi.mock('@renderer/assets/info.svg', () => ({ default: 'info.svg' }))

describe('<CellInput />', () => {
  beforeEach(() => {
    mockError = null
  })

  afterEach(() => {
    cleanup()
  })

  it('renders the initial value', () => {
    render(<CellInput rowId="r1" colId="c1" value="42" onCommit={vi.fn()} />)
    expect(screen.getByRole('textbox')).toHaveValue('42')
  })

  it('uses rowId/colId as the aria-label', () => {
    render(<CellInput rowId="r1" colId="c1" value="" onCommit={vi.fn()} />)
    expect(screen.getByLabelText('r1 c1')).toBeInTheDocument()
  })

  it('updates the local draft on change without committing', () => {
    const onCommit = vi.fn()
    render(<CellInput rowId="r1" colId="c1" value="" onCommit={onCommit} />)
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'hello' } })
    expect(input).toHaveValue('hello')
    expect(onCommit).not.toHaveBeenCalled()
  })

  it('commits the draft on blur', () => {
    const onCommit = vi.fn()
    render(<CellInput rowId="r1" colId="c1" value="" onCommit={onCommit} />)
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: '99' } })
    fireEvent.blur(input)
    expect(onCommit).toHaveBeenCalledWith('99')
  })

  it('re-syncs the draft when the canonical value changes externally', () => {
    const { rerender } = render(<CellInput rowId="r1" colId="c1" value="1" onCommit={vi.fn()} />)
    expect(screen.getByRole('textbox')).toHaveValue('1')
    rerender(<CellInput rowId="r1" colId="c1" value="2" onCommit={vi.fn()} />)
    expect(screen.getByRole('textbox')).toHaveValue('2')
  })

  it('does not render the tooltip when there is no error', () => {
    mockError = null
    render(<CellInput rowId="r1" colId="c1" value="" onCommit={vi.fn()} />)
    expect(screen.queryByTestId('tooltip')).not.toBeInTheDocument()
    expect(screen.getByRole('textbox')).not.toHaveAttribute('aria-invalid')
  })

  it('renders the tooltip and marks aria-invalid when an error is present', () => {
    mockError = 'must be in 0–100'
    render(<CellInput rowId="r1" colId="c1" value="" onCommit={vi.fn()} />)
    expect(screen.getByTestId('tooltip')).toHaveAttribute('data-text', 'must be in 0–100')
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true')
  })
})
