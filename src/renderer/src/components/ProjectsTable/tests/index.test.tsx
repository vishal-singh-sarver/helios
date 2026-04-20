import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import ProjectsTable from '../index'
import type { RecentProjectItem } from '../../../containers/HomePage/types'

// Mock EmptyState to isolate ProjectsTable — EmptyState has its own tests
vi.mock('../../EmptyState', () => ({
  default: ({ onCreateNew }: { onCreateNew: () => void }) => (
    <div data-testid="empty-state">
      <button onClick={onCreateNew}>Add New</button>
    </div>
  )
}))

// NOTE: Runtime assertions in this file were written against the old flat
// string-typed shape. They will fail until each expected display value is
// updated to match the new ISO-date/byte-formatted render. Fixtures were
// renamed only to unblock typecheck — behavioural refresh is a separate pass.
const MOCK_PROJECTS: RecentProjectItem[] = [
  { id: 'p-alpha', name: 'Alpha Project', last_updated: '2026-03-29T09:15:00Z', size: 128_400_000 },
  { id: 'p-beta',  name: 'Beta Project',  last_updated: '2026-03-27T14:42:00Z', size: 86_100_000 },
  { id: 'p-gamma', name: 'Gamma Project', last_updated: '2026-03-24T18:05:00Z', size: 214_900_000 }
]

describe('<ProjectsTable />', () => {
  const defaultProps = {
    projects: MOCK_PROJECTS,
    emptyIcon: 'search.svg',
    onCreateNew: vi.fn()
  }

  // ── Rendering ──

  // Smoke test — component mounts without throwing
  it('renders without error', () => {
    render(<ProjectsTable {...defaultProps} />)
  })

  // ── onRowClick ──

  // Verifies clicking a row button fires onRowClick with that project's id
  it('fires onRowClick with the project id when a row is clicked', () => {
    const onRowClick = vi.fn()
    render(<ProjectsTable {...defaultProps} onRowClick={onRowClick} />)
    fireEvent.click(screen.getByRole('button', { name: 'Open project Alpha Project' }))
    expect(onRowClick).toHaveBeenCalledWith('p-alpha')
  })

  // Verifies the component does not throw when no onRowClick is provided
  it('does not throw when clicking a row with no onRowClick prop', () => {
    render(<ProjectsTable {...defaultProps} />)
    expect(() =>
      fireEvent.click(screen.getByRole('button', { name: 'Open project Alpha Project' }))
    ).not.toThrow()
  })

  // Verifies the page heading is displayed
  it('renders the heading', () => {
    render(<ProjectsTable {...defaultProps} />)
    expect(screen.getByText('Recent Projects')).toBeInTheDocument()
  })

  // Verifies all three column headers are present
  it('renders all column headers', () => {
    render(<ProjectsTable {...defaultProps} />)
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Last Updated')).toBeInTheDocument()
    expect(screen.getByText('Size')).toBeInTheDocument()
  })

  // Verifies every project name appears as a table row
  it('renders all project rows', () => {
    render(<ProjectsTable {...defaultProps} />)
    expect(screen.getByText('Alpha Project')).toBeInTheDocument()
    expect(screen.getByText('Beta Project')).toBeInTheDocument()
    expect(screen.getByText('Gamma Project')).toBeInTheDocument()
  })

  // Verifies date and size details are shown in the row
  it('displays project details in each row', () => {
    render(<ProjectsTable {...defaultProps} />)
    expect(screen.getByText('2026-03-29 09:15')).toBeInTheDocument()
    expect(screen.getByText('128.4 MB')).toBeInTheDocument()
  })

  // ── Empty state ──

  // Verifies EmptyState is rendered when no projects are passed
  it('renders EmptyState when projects array is empty', () => {
    render(<ProjectsTable {...defaultProps} projects={[]} />)
    expect(screen.getByTestId('empty-state')).toBeInTheDocument()
  })

  // Verifies onCreateNew fires when the EmptyState CTA is clicked
  it('calls onCreateNew when EmptyState button is clicked', () => {
    const onCreateNew = vi.fn()
    render(<ProjectsTable {...defaultProps} projects={[]} onCreateNew={onCreateNew} />)
    fireEvent.click(screen.getByText('Add New'))
    expect(onCreateNew).toHaveBeenCalledTimes(1)
  })

  // Verifies EmptyState is NOT rendered when projects exist
  it('does not render EmptyState when projects exist', () => {
    render(<ProjectsTable {...defaultProps} />)
    expect(screen.queryByTestId('empty-state')).not.toBeInTheDocument()
  })

  // ── Sorting by name ──

  // Verifies default sort is by name ascending (A → Z)
  it('sorts by name ascending by default', () => {
    render(<ProjectsTable {...defaultProps} />)
    const rows = screen.getAllByRole('row')
    expect(rows[1]).toHaveTextContent('Alpha Project')
    expect(rows[2]).toHaveTextContent('Beta Project')
    expect(rows[3]).toHaveTextContent('Gamma Project')
  })

  // Verifies clicking Name header toggles to descending (Z → A)
  it('toggles name sort to descending on second click', () => {
    render(<ProjectsTable {...defaultProps} />)
    fireEvent.click(screen.getByText('Name'))
    const rows = screen.getAllByRole('row')
    expect(rows[1]).toHaveTextContent('Gamma Project')
    expect(rows[2]).toHaveTextContent('Beta Project')
    expect(rows[3]).toHaveTextContent('Alpha Project')
  })

  // ── Sorting by date ──

  // Verifies clicking Last Updated sorts oldest first
  it('sorts by Last Updated ascending when clicked', () => {
    render(<ProjectsTable {...defaultProps} />)
    fireEvent.click(screen.getByText('Last Updated'))
    const rows = screen.getAllByRole('row')
    expect(rows[1]).toHaveTextContent('Gamma Project') // Mar 24
    expect(rows[2]).toHaveTextContent('Beta Project') // Mar 27
    expect(rows[3]).toHaveTextContent('Alpha Project') // Mar 29
  })

  // Verifies double-clicking Last Updated sorts newest first
  it('sorts by Last Updated descending on second click', () => {
    render(<ProjectsTable {...defaultProps} />)
    fireEvent.click(screen.getByText('Last Updated'))
    fireEvent.click(screen.getByText('Last Updated'))
    const rows = screen.getAllByRole('row')
    expect(rows[1]).toHaveTextContent('Alpha Project') // Mar 29
    expect(rows[2]).toHaveTextContent('Beta Project') // Mar 27
    expect(rows[3]).toHaveTextContent('Gamma Project') // Mar 24
  })

  // ── Sorting by size (must be numeric, not lexicographic) ──

  // Verifies size sort is numeric: 86.1 < 128.4 < 214.9
  it('sorts by Size numerically ascending', () => {
    render(<ProjectsTable {...defaultProps} />)
    fireEvent.click(screen.getByText('Size'))
    const rows = screen.getAllByRole('row')
    expect(rows[1]).toHaveTextContent('Beta Project') // 86.1
    expect(rows[2]).toHaveTextContent('Alpha Project') // 128.4
    expect(rows[3]).toHaveTextContent('Gamma Project') // 214.9
  })

  // Verifies double-clicking Size sorts largest first
  it('sorts by Size numerically descending on second click', () => {
    render(<ProjectsTable {...defaultProps} />)
    fireEvent.click(screen.getByText('Size'))
    fireEvent.click(screen.getByText('Size'))
    const rows = screen.getAllByRole('row')
    expect(rows[1]).toHaveTextContent('Gamma Project') // 214.9
    expect(rows[2]).toHaveTextContent('Alpha Project') // 128.4
    expect(rows[3]).toHaveTextContent('Beta Project') // 86.1
  })

  // ── Sort indicator arrows ──

  // Verifies active column shows directional arrow, others show neutral ↑↓
  it('shows active sort arrow on the current sort column', () => {
    render(<ProjectsTable {...defaultProps} />)
    const nameBtn = screen.getByText('Name').closest('button')
    expect(nameBtn).toHaveTextContent('↑')

    const sizeBtn = screen.getByText('Size').closest('button')
    expect(sizeBtn).toHaveTextContent('↑↓')
  })

  // Verifies arrow changes to ↓ after toggling sort direction
  it('shows down arrow after toggling to descending', () => {
    render(<ProjectsTable {...defaultProps} />)
    fireEvent.click(screen.getByText('Name'))
    const nameBtn = screen.getByText('Name').closest('button')
    expect(nameBtn).toHaveTextContent('↓')
  })

  // Verifies switching to a different column resets arrow to ↑
  it('resets arrow to ascending when switching columns', () => {
    render(<ProjectsTable {...defaultProps} />)
    fireEvent.click(screen.getByText('Size'))
    const sizeBtn = screen.getByText('Size').closest('button')
    expect(sizeBtn).toHaveTextContent('↑')

    const nameBtn = screen.getByText('Name').closest('button')
    expect(nameBtn).toHaveTextContent('↑↓')
  })

  // ── Snapshots ──

  // Snapshot regression guard — populated table
  it('should match the snapshot with projects', () => {
    const { container } = render(<ProjectsTable {...defaultProps} />)
    expect(container.firstChild).toMatchSnapshot()
  })

  // Snapshot regression guard — empty table
  it('should match the snapshot with empty projects', () => {
    const { container } = render(<ProjectsTable {...defaultProps} projects={[]} />)
    expect(container.firstChild).toMatchSnapshot()
  })

  it('maintains stable order for equal values', () => {
    const projects: RecentProjectItem[] = [
      { id: 'p-a', name: 'A', last_updated: '2026-03-29T00:00:00Z', size: 100_000_000 },
      { id: 'p-b', name: 'B', last_updated: '2026-03-29T00:00:00Z', size: 100_000_000 }
    ]

    render(<ProjectsTable {...defaultProps} projects={projects} />)

    const rows = screen.getAllByRole('row')
    expect(rows[1]).toHaveTextContent('A')
    expect(rows[2]).toHaveTextContent('B')
  })

  it('handles invalid size values gracefully', () => {
    const projects: RecentProjectItem[] = [
      { id: 'p-a', name: 'A', last_updated: '2026-03-29T00:00:00Z', size: Number.NaN },
      { id: 'p-b', name: 'B', last_updated: '2026-03-28T00:00:00Z', size: 100_000_000 }
    ]

    render(<ProjectsTable {...defaultProps} projects={projects} />)

    fireEvent.click(screen.getByRole('button', { name: /size/i }))

    expect(screen.getByText('A')).toBeInTheDocument()
  })
})
