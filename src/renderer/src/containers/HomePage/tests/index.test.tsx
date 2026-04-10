import React from 'react'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import HomePage from '../index'

// ── Mock all child components to isolate HomePage logic ──
// Each child has its own test file — we only care about how HomePage orchestrates them

vi.mock('@renderer/components/MenuBar', () => ({
  default: ({
    items,
    onItemSelect
  }: {
    items: Record<string, string[]>
    onItemSelect: (item: string) => void
  }) => (
    <div data-testid="menubar">
      {Object.values(items)
        .flat()
        .map((item) => (
          <button key={item} data-testid={`menu-${item}`} onClick={() => onItemSelect(item)}>
            {item}
          </button>
        ))}
    </div>
  )
}))

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

vi.mock('@renderer/components/Header', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <header data-testid="header">{children}</header>
  )
}))

vi.mock('@renderer/components/SearchBar', () => ({
  default: ({ value, onChange }: { value: string; onChange: (val: string) => void }) => (
    <input data-testid="searchbar" value={value} onChange={(e) => onChange(e.target.value)} />
  )
}))

vi.mock('@renderer/components/Sidebar', () => ({
  default: ({
    items,
    activeLabel,
    onSelect
  }: {
    items: { label: string; onAction: () => void }[]
    activeLabel: string
    onSelect: (item: { label: string; onAction: () => void }) => void
  }) => (
    <aside data-testid="sidebar">
      {items.map((item) => (
        <button
          key={item.label}
          data-testid={`sidebar-${item.label}`}
          data-active={item.label === activeLabel}
          onClick={() => onSelect(item)}
        >
          {item.label}
        </button>
      ))}
    </aside>
  )
}))

vi.mock('@renderer/components/ProjectsTable', () => ({
  default: ({
    projects,
    onCreateNew
  }: {
    projects: { name: string }[]
    onCreateNew: () => void
  }) => (
    <div data-testid="projects-table">
      {projects.map((p) => (
        <span key={p.name} data-testid={`project-${p.name}`}>
          {p.name}
        </span>
      ))}
      <button data-testid="table-create-new" onClick={onCreateNew}>
        Create
      </button>
    </div>
  )
}))

vi.mock('@renderer/components/FormField', () => ({
  default: ({
    labelProps,
    inputProps
  }: {
    labelProps: { label: string }
    inputProps: {
      name: string
      value: string
      onChange: React.ChangeEventHandler<HTMLInputElement>
      onBlur: React.FocusEventHandler<HTMLInputElement>
      error?: string
      type?: string
    }
  }) => (
    <div data-testid={`formfield-${inputProps.name}`}>
      <label>{labelProps.label}</label>
      <input
        data-testid={`input-${inputProps.name}`}
        name={inputProps.name}
        value={inputProps.value}
        onChange={inputProps.onChange}
        onBlur={inputProps.onBlur}
        type={inputProps.type || 'text'}
      />
      {inputProps.error && <span data-testid={`error-${inputProps.name}`}>{inputProps.error}</span>}
    </div>
  )
}))

// Mock all SVG imports so they resolve to plain strings
vi.mock('@renderer/assets/home.svg', () => ({ default: 'home.svg' }))
vi.mock('@renderer/assets/new_project.svg', () => ({ default: 'new_project.svg' }))
vi.mock('@renderer/assets/open_project.svg', () => ({ default: 'open_project.svg' }))
vi.mock('@renderer/assets/search.svg', () => ({ default: 'search.svg' }))

describe('<HomePage />', () => {
  // ── Basic rendering ──

  // Smoke test — the full container mounts without throwing
  it('renders without error', () => {
    render(<HomePage />)
  })

  // Verifies Header, MenuBar, SearchBar, Sidebar, and ProjectsTable all mount
  it('renders all major child components', () => {
    render(<HomePage />)
    expect(screen.getByTestId('header')).toBeInTheDocument()
    expect(screen.getByTestId('menubar')).toBeInTheDocument()
    expect(screen.getByTestId('searchbar')).toBeInTheDocument()
    expect(screen.getByTestId('sidebar')).toBeInTheDocument()
    expect(screen.getByTestId('projects-table')).toBeInTheDocument()
  })

  // Verifies the dialog is NOT shown on initial render
  it('does not show dialog on initial render', () => {
    render(<HomePage />)
    expect(screen.queryByTestId('dialog')).not.toBeInTheDocument()
  })

  // ── Sidebar rendering ──

  // Verifies all three sidebar items are rendered
  it('renders all sidebar items', () => {
    render(<HomePage />)
    expect(screen.getByTestId('sidebar-Home')).toBeInTheDocument()
    expect(screen.getByTestId('sidebar-New Project')).toBeInTheDocument()
    expect(screen.getByTestId('sidebar-Open project')).toBeInTheDocument()
  })

  // Verifies "Home" is the default active sidebar item
  it('sets Home as the default active sidebar item', () => {
    render(<HomePage />)
    expect(screen.getByTestId('sidebar-Home')).toHaveAttribute('data-active', 'true')
  })

  // ── Sidebar interaction ──

  // Verifies clicking a sidebar item updates the active state
  it('updates active sidebar when a different item is clicked', () => {
    render(<HomePage />)
    fireEvent.click(screen.getByTestId('sidebar-Open project'))
    expect(screen.getByTestId('sidebar-Open project')).toHaveAttribute('data-active', 'true')
    expect(screen.getByTestId('sidebar-Home')).toHaveAttribute('data-active', 'false')
  })

  // ── Open dialog via sidebar ──

  // Verifies clicking "New Project" in sidebar opens the new project dialog
  it('opens dialog when New Project sidebar item is clicked', () => {
    render(<HomePage />)
    fireEvent.click(screen.getByTestId('sidebar-New Project'))
    expect(screen.getByTestId('dialog')).toBeInTheDocument()
  })

  // ── Open dialog via menu bar ──

  // Verifies clicking "New Project" in the menu bar dropdown opens the dialog
  it('opens dialog when New Project menu item is clicked', () => {
    render(<HomePage />)
    fireEvent.click(screen.getByTestId('menu-New Project'))
    expect(screen.getByTestId('dialog')).toBeInTheDocument()
  })

  // ── Open dialog via projects table empty state ──

  // Verifies clicking the create button in ProjectsTable opens the dialog
  it('opens dialog when ProjectsTable create new is clicked', () => {
    render(<HomePage />)
    fireEvent.click(screen.getByTestId('table-create-new'))
    expect(screen.getByTestId('dialog')).toBeInTheDocument()
  })

  // ── Close dialog ──

  // Verifies clicking the close button in the dialog closes it
  it('closes dialog when close button is clicked', () => {
    render(<HomePage />)
    fireEvent.click(screen.getByTestId('menu-New Project'))
    expect(screen.getByTestId('dialog')).toBeInTheDocument()

    fireEvent.click(screen.getByTestId('dialog-close'))
    expect(screen.queryByTestId('dialog')).not.toBeInTheDocument()
  })

  // ── Dialog form fields ──

  // Verifies all three form fields are rendered inside the dialog
  it('renders all form fields when dialog is open', () => {
    render(<HomePage />)
    fireEvent.click(screen.getByTestId('menu-New Project'))
    expect(screen.getByTestId('formfield-projectName')).toBeInTheDocument()
    expect(screen.getByTestId('formfield-latitude')).toBeInTheDocument()
    expect(screen.getByTestId('formfield-longitude')).toBeInTheDocument()
  })

  // Verifies the Cancel and Create buttons are rendered in the dialog
  it('renders Cancel and Create buttons in dialog', () => {
    render(<HomePage />)
    fireEvent.click(screen.getByTestId('menu-New Project'))
    const dialog = screen.getByTestId('dialog')
    expect(within(dialog).getByText('Cancel')).toBeInTheDocument()
    expect(within(dialog).getByText('Create')).toBeInTheDocument()
  })

  // ── Dialog Cancel button ──

  // Verifies clicking Cancel closes the dialog
  it('closes dialog when Cancel button is clicked', () => {
    render(<HomePage />)
    fireEvent.click(screen.getByTestId('menu-New Project'))
    fireEvent.click(screen.getByText('Cancel'))
    expect(screen.queryByTestId('dialog')).not.toBeInTheDocument()
  })

  // ── Form input ──

  // Verifies typing into the project name field updates its value
  it('updates project name field on input', () => {
    render(<HomePage />)
    fireEvent.click(screen.getByTestId('menu-New Project'))
    const input = screen.getByTestId('input-projectName')
    fireEvent.change(input, { target: { value: 'My Project' } })
    expect(input).toHaveValue('My Project')
  })

  // Verifies typing into latitude field updates its value
  it('updates latitude field on input', () => {
    render(<HomePage />)
    fireEvent.click(screen.getByTestId('menu-New Project'))
    const input = screen.getByTestId('input-latitude')
    fireEvent.change(input, { target: { value: '45.5' } })
    // type="number" inputs return numeric value via jest-dom's toHaveValue
    expect(input).toHaveValue(45.5)
  })

  // Verifies typing into longitude field updates its value
  it('updates longitude field on input', () => {
    render(<HomePage />)
    fireEvent.click(screen.getByTestId('menu-New Project'))
    const input = screen.getByTestId('input-longitude')
    fireEvent.change(input, { target: { value: '-122.6' } })
    // type="number" inputs return numeric value via jest-dom's toHaveValue
    expect(input).toHaveValue(-122.6)
  })

  // ── Form validation — empty fields ──

  // Verifies project name shows error when left empty and blurred
  it('shows error for empty project name after blur', async () => {
    render(<HomePage />)
    fireEvent.click(screen.getByTestId('menu-New Project'))
    const input = screen.getByTestId('input-projectName')
    fireEvent.blur(input)
    await waitFor(() => {
      expect(screen.getByTestId('error-projectName')).toHaveTextContent('Project name is required.')
    })
  })

  // Verifies latitude shows error when left empty and blurred
  it('shows error for empty latitude after blur', async () => {
    render(<HomePage />)
    fireEvent.click(screen.getByTestId('menu-New Project'))
    const input = screen.getByTestId('input-latitude')
    fireEvent.blur(input)
    await waitFor(() => {
      expect(screen.getByTestId('error-latitude')).toHaveTextContent('Latitude is required.')
    })
  })

  // Verifies longitude shows error when left empty and blurred
  it('shows error for empty longitude after blur', async () => {
    render(<HomePage />)
    fireEvent.click(screen.getByTestId('menu-New Project'))
    const input = screen.getByTestId('input-longitude')
    fireEvent.blur(input)
    await waitFor(() => {
      expect(screen.getByTestId('error-longitude')).toHaveTextContent('Longitude is required.')
    })
  })

  // ── Form validation — invalid values ──

  // Verifies project name over 30 characters shows a length error
  it('shows error when project name exceeds 30 characters', async () => {
    render(<HomePage />)
    fireEvent.click(screen.getByTestId('menu-New Project'))
    const input = screen.getByTestId('input-projectName')
    fireEvent.change(input, { target: { value: 'A'.repeat(31) } })
    fireEvent.blur(input)
    await waitFor(() => {
      expect(screen.getByTestId('error-projectName')).toHaveTextContent(
        'Project name must be 30 characters or fewer.'
      )
    })
  })

  // Verifies latitude outside -90 to 90 range shows a range error
  it('shows error for latitude out of range', async () => {
    render(<HomePage />)
    fireEvent.click(screen.getByTestId('menu-New Project'))
    const input = screen.getByTestId('input-latitude')
    fireEvent.change(input, { target: { value: '100' } })
    fireEvent.blur(input)
    await waitFor(() => {
      expect(screen.getByTestId('error-latitude')).toHaveTextContent('Invalid latitude')
    })
  })

  // Verifies longitude outside -180 to 180 range shows a range error
  it('shows error for longitude out of range', async () => {
    render(<HomePage />)
    fireEvent.click(screen.getByTestId('menu-New Project'))
    const input = screen.getByTestId('input-longitude')
    fireEvent.change(input, { target: { value: '200' } })
    fireEvent.blur(input)
    await waitFor(() => {
      expect(screen.getByTestId('error-longitude')).toHaveTextContent('Invalid longitude')
    })
  })

  // NOTE: A "non-numeric latitude" test was removed here.
  // The latitude input is type="number", and jsdom (like real browsers) rejects
  // non-numeric input — the value becomes an empty string before Formik sees it,
  // so the "Invalid latitude" branch in the validator is unreachable through the DOM.
  // If that validator branch needs coverage, test the validate function directly
  // in a unit test rather than via fireEvent on a number input.

  // ── Form validation — valid values (no error) ──

  // Verifies no error is shown when project name is valid
  it('shows no error for valid project name', async () => {
    render(<HomePage />)
    fireEvent.click(screen.getByTestId('menu-New Project'))
    const input = screen.getByTestId('input-projectName')
    fireEvent.change(input, { target: { value: 'Valid Name' } })
    fireEvent.blur(input)
    await waitFor(() => {
      expect(screen.queryByTestId('error-projectName')).not.toBeInTheDocument()
    })
  })

  // Verifies no error for latitude at boundary value -90
  it('shows no error for latitude at -90', async () => {
    render(<HomePage />)
    fireEvent.click(screen.getByTestId('menu-New Project'))
    const input = screen.getByTestId('input-latitude')
    fireEvent.change(input, { target: { value: '-90' } })
    fireEvent.blur(input)
    await waitFor(() => {
      expect(screen.queryByTestId('error-latitude')).not.toBeInTheDocument()
    })
  })

  // Verifies no error for longitude at boundary value 180
  it('shows no error for longitude at 180', async () => {
    render(<HomePage />)
    fireEvent.click(screen.getByTestId('menu-New Project'))
    const input = screen.getByTestId('input-longitude')
    fireEvent.change(input, { target: { value: '180' } })
    fireEvent.blur(input)
    await waitFor(() => {
      expect(screen.queryByTestId('error-longitude')).not.toBeInTheDocument()
    })
  })

  // ── Form submission ──

  // Verifies successful form submission closes the dialog and resets form
  it('closes dialog and resets form on valid submission', async () => {
    render(<HomePage />)
    fireEvent.click(screen.getByTestId('menu-New Project'))

    // Fill all fields with valid values
    fireEvent.change(screen.getByTestId('input-projectName'), {
      target: { value: 'Test Project' }
    })
    fireEvent.change(screen.getByTestId('input-latitude'), {
      target: { value: '45.0' }
    })
    fireEvent.change(screen.getByTestId('input-longitude'), {
      target: { value: '-122.0' }
    })

    // Click Create (scoped to the dialog — ProjectsTable mock also has a "Create" button)
    fireEvent.click(within(screen.getByTestId('dialog')).getByText('Create'))

    // Dialog should close
    await waitFor(() => {
      expect(screen.queryByTestId('dialog')).not.toBeInTheDocument()
    })
  })

  // Verifies form does NOT submit when validation errors exist
  it('does not close dialog when form has validation errors', async () => {
    render(<HomePage />)
    fireEvent.click(screen.getByTestId('menu-New Project'))

    // Leave all fields empty and click Create (scoped to dialog)
    fireEvent.click(within(screen.getByTestId('dialog')).getByText('Create'))

    // Dialog should remain open because validation fails
    await waitFor(() => {
      expect(screen.getByTestId('dialog')).toBeInTheDocument()
    })
  })

  // ── Form reset on reopen ──

  // Verifies form fields are reset when dialog is closed and reopened
  it('resets form fields when dialog is closed and reopened', async () => {
    render(<HomePage />)

    // Open dialog and fill in a value
    fireEvent.click(screen.getByTestId('menu-New Project'))
    fireEvent.change(screen.getByTestId('input-projectName'), {
      target: { value: 'Leftover Value' }
    })

    // Close dialog via Cancel
    fireEvent.click(screen.getByText('Cancel'))

    // Reopen dialog
    fireEvent.click(screen.getByTestId('menu-New Project'))

    // Field should be empty — form was reset on reopen
    expect(screen.getByTestId('input-projectName')).toHaveValue('')
  })

  // ── Search filtering ──

  // Verifies all 5 hardcoded projects are shown initially
  it('shows all projects initially', () => {
    render(<HomePage />)
    expect(screen.getByTestId('project-Coastal Survey Alpha')).toBeInTheDocument()
    expect(screen.getByTestId('project-Delta Wind Farm')).toBeInTheDocument()
    expect(screen.getByTestId('project-Northern Grid Scan')).toBeInTheDocument()
    expect(screen.getByTestId('project-River Basin Mapping')).toBeInTheDocument()
    expect(screen.getByTestId('project-Urban Heat Island Study')).toBeInTheDocument()
  })

  // Verifies typing in searchbar filters projects by name
  it('filters projects by name when searching', () => {
    render(<HomePage />)
    fireEvent.change(screen.getByTestId('searchbar'), { target: { value: 'Coastal' } })
    expect(screen.getByTestId('project-Coastal Survey Alpha')).toBeInTheDocument()
    expect(screen.queryByTestId('project-Delta Wind Farm')).not.toBeInTheDocument()
  })

  // Verifies search is case-insensitive
  it('filters projects case-insensitively', () => {
    render(<HomePage />)
    fireEvent.change(screen.getByTestId('searchbar'), { target: { value: 'coastal' } })
    expect(screen.getByTestId('project-Coastal Survey Alpha')).toBeInTheDocument()
  })

  // Verifies search matches against size values
  it('filters projects by size', () => {
    render(<HomePage />)
    fireEvent.change(screen.getByTestId('searchbar'), { target: { value: '214.9' } })
    expect(screen.getByTestId('project-Northern Grid Scan')).toBeInTheDocument()
    expect(screen.queryByTestId('project-Coastal Survey Alpha')).not.toBeInTheDocument()
  })

  // Verifies search matches against date values
  it('filters projects by date', () => {
    render(<HomePage />)
    fireEvent.change(screen.getByTestId('searchbar'), { target: { value: '2026-03-29' } })
    expect(screen.getByTestId('project-Coastal Survey Alpha')).toBeInTheDocument()
    expect(screen.queryByTestId('project-Delta Wind Farm')).not.toBeInTheDocument()
  })

  // Verifies no projects are shown when search matches nothing
  it('shows no projects when search matches nothing', () => {
    render(<HomePage />)
    fireEvent.change(screen.getByTestId('searchbar'), { target: { value: 'zzzzz' } })
    expect(screen.queryByTestId('project-Coastal Survey Alpha')).not.toBeInTheDocument()
    expect(screen.queryByTestId('project-Delta Wind Farm')).not.toBeInTheDocument()
  })

  // Verifies clearing the search restores all projects
  it('restores all projects when search is cleared', () => {
    render(<HomePage />)
    fireEvent.change(screen.getByTestId('searchbar'), { target: { value: 'Coastal' } })
    fireEvent.change(screen.getByTestId('searchbar'), { target: { value: '' } })
    expect(screen.getByTestId('project-Coastal Survey Alpha')).toBeInTheDocument()
    expect(screen.getByTestId('project-Delta Wind Farm')).toBeInTheDocument()
  })

  // Verifies search trims whitespace before filtering
  it('trims whitespace from search input', () => {
    render(<HomePage />)
    fireEvent.change(screen.getByTestId('searchbar'), { target: { value: '  Coastal  ' } })
    expect(screen.getByTestId('project-Coastal Survey Alpha')).toBeInTheDocument()
  })

  // ── Snapshot ──

  // Snapshot regression guard — initial state with dialog closed
  it('should match the snapshot', () => {
    const { container } = render(<HomePage />)
    expect(container.firstChild).toMatchSnapshot()
  })
})
