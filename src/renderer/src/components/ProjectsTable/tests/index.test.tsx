import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { formatBytes } from 'utils/format'
import type { RecentProjectItem } from '../../../containers/HomePage/types'
import ProjectsTable from '../index'

// ── Mocks ───────────────────────────────────────────────────────────────────

// EmptyState has its own suite — shallow it here so we can verify wiring only.
vi.mock('../../EmptyState', () => ({
  default: ({ onCreateNew }: { onCreateNew: () => void }) => (
    <div data-testid="empty-state">
      <button onClick={onCreateNew}>Add New</button>
    </div>
  )
}))

// The table imports two SVG assets; stub them so the bundler does not choke
// and so we can assert className changes on them in render output.
vi.mock('@renderer/assets/delete.svg', () => ({ default: 'delete.svg' }))
vi.mock('@renderer/assets/edit.svg', () => ({ default: 'edit.svg' }))
vi.mock('@renderer/assets/Kebab Menu.svg', () => ({ default: 'kebab.svg' }))
vi.mock('@renderer/assets/Sort 3.svg', () => ({ default: 'sort.svg' }))

// ── Fixtures ────────────────────────────────────────────────────────────────

const MOCK_PROJECTS: RecentProjectItem[] = [
  { id: 'p-alpha', name: 'Alpha Project', last_updated: '2026-03-29T09:15:00Z', size: 128_400_000 },
  { id: 'p-beta', name: 'Beta Project', last_updated: '2026-03-27T14:42:00Z', size: 86_100_000 },
  { id: 'p-gamma', name: 'Gamma Project', last_updated: '2026-03-24T18:05:00Z', size: 214_900_000 }
]

describe('<ProjectsTable />', () => {
  const defaultProps = {
    projects: MOCK_PROJECTS,
    emptyIcon: 'search.svg',
    onCreateNew: vi.fn(),
    onRequestDelete: vi.fn(),
    onRequestRename: vi.fn(),
    deletingIds: [] as string[]
  }

  afterEach(() => {
    vi.clearAllMocks()
    cleanup()
  })

  // ── Rendering ──────────────────────────────────────────────────────────────

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

  it('renders all three sortable column headers', () => {
    render(<ProjectsTable {...defaultProps} />)
    expect(screen.getByRole('button', { name: /^name/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^last updated/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^size/i })).toBeInTheDocument()
  })

  it('renders a row for every project', () => {
    render(<ProjectsTable {...defaultProps} />)
    expect(screen.getByText('Alpha Project')).toBeInTheDocument()
    expect(screen.getByText('Beta Project')).toBeInTheDocument()
    expect(screen.getByText('Gamma Project')).toBeInTheDocument()
  })

  it('formats the size column with formatBytes', () => {
    render(<ProjectsTable {...defaultProps} />)
    expect(screen.getByText(formatBytes(128_400_000))).toBeInTheDocument()
    expect(screen.getByText(formatBytes(86_100_000))).toBeInTheDocument()
    expect(screen.getByText(formatBytes(214_900_000))).toBeInTheDocument()
  })

  // ── Row action buttons ────────────────────────────────────────────────────

  it('exposes an "Open project" button for each row with an accessible label', () => {
    render(<ProjectsTable {...defaultProps} />)
    expect(screen.getByRole('button', { name: 'Open project Alpha Project' })).toBeInTheDocument()
  })

  it('exposes an actions button for each row with an accessible label', () => {
    render(<ProjectsTable {...defaultProps} />)
    expect(
      screen.getByRole('button', { name: 'Open actions for Alpha Project' })
    ).toBeInTheDocument()
  })

  it('opens a menu with Rename and Delete when the actions button is clicked', () => {
    render(<ProjectsTable {...defaultProps} />)
    fireEvent.click(screen.getByRole('button', { name: 'Open actions for Alpha Project' }))
    expect(screen.getByRole('menu', { name: 'Actions for Alpha Project' })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: 'Rename' })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: 'Delete' })).toBeInTheDocument()
  })

  it('calls onRequestDelete with the project when the delete button is clicked', () => {
    const onRequestDelete = vi.fn()
    render(<ProjectsTable {...defaultProps} onRequestDelete={onRequestDelete} />)
    fireEvent.click(screen.getByRole('button', { name: 'Open actions for Beta Project' }))
    fireEvent.click(screen.getByRole('menuitem', { name: 'Delete' }))
    expect(onRequestDelete).toHaveBeenCalledTimes(1)
    expect(onRequestDelete).toHaveBeenCalledWith(MOCK_PROJECTS.find((p) => p.id === 'p-beta'))
  })

  it('calls onRequestRename with the project when the rename menu item is clicked', () => {
    const onRequestRename = vi.fn()
    render(<ProjectsTable {...defaultProps} onRequestRename={onRequestRename} />)
    fireEvent.click(screen.getByRole('button', { name: 'Open actions for Gamma Project' }))
    fireEvent.click(screen.getByRole('menuitem', { name: 'Rename' }))
    expect(onRequestRename).toHaveBeenCalledTimes(1)
    expect(onRequestRename).toHaveBeenCalledWith(MOCK_PROJECTS.find((p) => p.id === 'p-gamma'))
  })

  it('disables the actions button for projects listed in deletingIds', () => {
    render(<ProjectsTable {...defaultProps} deletingIds={['p-alpha']} />)
    const btn = screen.getByRole('button', { name: 'Open actions for Alpha Project' })
    expect(btn).toBeDisabled()
  })

  it('does not fire onRequestDelete when a disabled delete button is clicked', () => {
    const onRequestDelete = vi.fn()
    render(
      <ProjectsTable
        {...defaultProps}
        deletingIds={['p-alpha']}
        onRequestDelete={onRequestDelete}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: 'Open actions for Alpha Project' }))
    expect(onRequestDelete).not.toHaveBeenCalled()
  })

  it('closes the menu on Escape', () => {
    render(<ProjectsTable {...defaultProps} />)
    fireEvent.click(screen.getByRole('button', { name: 'Open actions for Alpha Project' }))
    expect(screen.getByRole('menu')).toBeInTheDocument()
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  // ── Empty state ──────────────────────────────────────────────────────────

  it('renders EmptyState when projects array is empty', () => {
    render(<ProjectsTable {...defaultProps} projects={[]} />)
    expect(screen.getByTestId('empty-state')).toBeInTheDocument()
  })

  it('calls onCreateNew when EmptyState CTA is clicked', () => {
    const onCreateNew = vi.fn()
    render(<ProjectsTable {...defaultProps} projects={[]} onCreateNew={onCreateNew} />)
    fireEvent.click(screen.getByText('Add New'))
    expect(onCreateNew).toHaveBeenCalledTimes(1)
  })

  it('does not render EmptyState when projects exist', () => {
    render(<ProjectsTable {...defaultProps} />)
    expect(screen.queryByTestId('empty-state')).not.toBeInTheDocument()
  })

  // ── Default sort ─────────────────────────────────────────────────────────

  // Default sort is `last_updated` descending — newest first.
  it('defaults to sorting by Last Updated descending (newest first)', () => {
    render(<ProjectsTable {...defaultProps} />)
    const header = screen.getByRole('columnheader', { name: /last updated/i })
    expect(header).toHaveAttribute('aria-sort', 'descending')

    const rows = screen.getAllByRole('button', { name: /^Open project/i })
    expect(rows[0]).toHaveTextContent('Alpha Project') // 2026-03-29
    expect(rows[1]).toHaveTextContent('Beta Project') // 2026-03-27
    expect(rows[2]).toHaveTextContent('Gamma Project') // 2026-03-24
  })

  // ── Sorting by name ───────────────────────────────────────────────────────

  it('sorts by name ascending when the Name header is clicked', () => {
    render(<ProjectsTable {...defaultProps} />)
    fireEvent.click(screen.getByRole('button', { name: /^name/i }))

    expect(screen.getByRole('columnheader', { name: /name/i })).toHaveAttribute(
      'aria-sort',
      'ascending'
    )

    const rows = screen.getAllByRole('button', { name: /^Open project/i })
    expect(rows[0]).toHaveTextContent('Alpha Project')
    expect(rows[1]).toHaveTextContent('Beta Project')
    expect(rows[2]).toHaveTextContent('Gamma Project')
  })

  it('toggles name sort to descending on the second click', () => {
    render(<ProjectsTable {...defaultProps} />)
    const nameHeader = screen.getByRole('button', { name: /^name/i })
    fireEvent.click(nameHeader)
    fireEvent.click(nameHeader)

    expect(screen.getByRole('columnheader', { name: /name/i })).toHaveAttribute(
      'aria-sort',
      'descending'
    )

    const rows = screen.getAllByRole('button', { name: /^Open project/i })
    expect(rows[0]).toHaveTextContent('Gamma Project')
    expect(rows[1]).toHaveTextContent('Beta Project')
    expect(rows[2]).toHaveTextContent('Alpha Project')
  })

  // ── Sorting by date ──────────────────────────────────────────────────────

  it('toggles Last Updated to ascending on click (oldest first)', () => {
    render(<ProjectsTable {...defaultProps} />)
    fireEvent.click(screen.getByRole('button', { name: /^last updated/i }))

    expect(screen.getByRole('columnheader', { name: /last updated/i })).toHaveAttribute(
      'aria-sort',
      'ascending'
    )

    const rows = screen.getAllByRole('button', { name: /^Open project/i })
    expect(rows[0]).toHaveTextContent('Gamma Project') // Mar 24
    expect(rows[1]).toHaveTextContent('Beta Project') // Mar 27
    expect(rows[2]).toHaveTextContent('Alpha Project') // Mar 29
  })

  // ── Sorting by size — must be numeric, not lexicographic ──────────────────

  it('sorts by Size numerically ascending', () => {
    render(<ProjectsTable {...defaultProps} />)
    fireEvent.click(screen.getByRole('button', { name: /^size/i }))

    expect(screen.getByRole('columnheader', { name: /size/i })).toHaveAttribute(
      'aria-sort',
      'ascending'
    )

    const rows = screen.getAllByRole('button', { name: /^Open project/i })
    expect(rows[0]).toHaveTextContent('Beta Project') // 86.1M
    expect(rows[1]).toHaveTextContent('Alpha Project') // 128.4M
    expect(rows[2]).toHaveTextContent('Gamma Project') // 214.9M
  })

  it('sorts by Size numerically descending on the second click', () => {
    render(<ProjectsTable {...defaultProps} />)
    const sizeHeader = screen.getByRole('button', { name: /^size/i })
    fireEvent.click(sizeHeader)
    fireEvent.click(sizeHeader)

    const rows = screen.getAllByRole('button', { name: /^Open project/i })
    expect(rows[0]).toHaveTextContent('Gamma Project') // 214.9M
    expect(rows[1]).toHaveTextContent('Alpha Project') // 128.4M
    expect(rows[2]).toHaveTextContent('Beta Project') // 86.1M
  })

  // ── aria-sort on inactive columns ─────────────────────────────────────────

  it('reports aria-sort="none" on columns that are not the active sort key', () => {
    render(<ProjectsTable {...defaultProps} />)
    // default sort is last_updated
    expect(screen.getByRole('columnheader', { name: /name/i })).toHaveAttribute('aria-sort', 'none')
    expect(screen.getByRole('columnheader', { name: /size/i })).toHaveAttribute('aria-sort', 'none')
  })

  it('switches aria-sort back to "none" on the previously active column when sort key changes', () => {
    render(<ProjectsTable {...defaultProps} />)
    fireEvent.click(screen.getByRole('button', { name: /^size/i }))

    expect(screen.getByRole('columnheader', { name: /size/i })).toHaveAttribute(
      'aria-sort',
      'ascending'
    )
    expect(screen.getByRole('columnheader', { name: /last updated/i })).toHaveAttribute(
      'aria-sort',
      'none'
    )
  })

  // ── Sort indicator arrow (visual class on the img) ───────────────────────

  // The sort icon uses alt="" and aria-hidden="true", so it is accessibly
  // a presentational img — we query the DOM element directly.
  it('rotates the sort icon on the active column when sorted descending', () => {
    render(<ProjectsTable {...defaultProps} />)
    const lastUpdatedHeader = screen.getByRole('columnheader', { name: /last updated/i })
    // default is last_updated desc
    const icon = lastUpdatedHeader.querySelector('img')
    expect(icon).not.toBeNull()
    expect(icon).toHaveClass('rotate-180')
    expect(icon).toHaveClass('opacity-100')
  })

  it('does not rotate the sort icon when sorted ascending', () => {
    render(<ProjectsTable {...defaultProps} />)
    fireEvent.click(screen.getByRole('button', { name: /^name/i }))
    const nameHeader = screen.getByRole('columnheader', { name: /name/i })
    const icon = nameHeader.querySelector('img')
    expect(icon).not.toBeNull()
    expect(icon).not.toHaveClass('rotate-180')
    expect(icon).toHaveClass('opacity-100')
  })

  it('shows a dimmed (opacity-60) icon on inactive columns', () => {
    render(<ProjectsTable {...defaultProps} />)
    const nameHeader = screen.getByRole('columnheader', { name: /name/i })
    const icon = nameHeader.querySelector('img')
    expect(icon).not.toBeNull()
    expect(icon).toHaveClass('opacity-60')
  })

  // ── Stable ordering & defensive cases ─────────────────────────────────────

  it('preserves insertion order for rows with equal sort keys (stable sort)', () => {
    const projects: RecentProjectItem[] = [
      { id: 'p-a', name: 'A', last_updated: '2026-03-29T00:00:00Z', size: 100_000_000 },
      { id: 'p-b', name: 'B', last_updated: '2026-03-29T00:00:00Z', size: 100_000_000 }
    ]

    render(<ProjectsTable {...defaultProps} projects={projects} />)

    const rows = screen.getAllByRole('button', { name: /^Open project/i })
    // default sort: last_updated desc. Equal timestamps → insertion order retained.
    expect(rows[0]).toHaveTextContent('A')
    expect(rows[1]).toHaveTextContent('B')
  })

  it('does not throw when a size is NaN', () => {
    const projects: RecentProjectItem[] = [
      { id: 'p-a', name: 'A', last_updated: '2026-03-29T00:00:00Z', size: Number.NaN },
      { id: 'p-b', name: 'B', last_updated: '2026-03-28T00:00:00Z', size: 100_000_000 }
    ]

    render(<ProjectsTable {...defaultProps} projects={projects} />)
    fireEvent.click(screen.getByRole('button', { name: /^size/i }))

    expect(screen.getByText('A')).toBeInTheDocument()
    expect(screen.getByText('B')).toBeInTheDocument()
  })

  // ── Snapshots ────────────────────────────────────────────────────────────

  it('matches the snapshot when populated', () => {
    const { container } = render(<ProjectsTable {...defaultProps} />)
    expect(container.firstChild).toMatchSnapshot()
  })

  it('matches the snapshot when empty', () => {
    const { container } = render(<ProjectsTable {...defaultProps} projects={[]} />)
    expect(container.firstChild).toMatchSnapshot()
  })
})
