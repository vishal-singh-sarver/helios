import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ProjectsTable from '../index'

describe('<ProjectsTable />', () => {
  it('renders the empty state when there are no projects', () => {
    render(<ProjectsTable projects={[]} emptyIcon="search.svg" onCreateNew={vi.fn()} />)

    expect(screen.getByText('Recent Projects')).toBeInTheDocument()
    expect(screen.getByText('No Projects Found')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '+ Add New Project' })).toBeInTheDocument()
  })

  it('calls onCreateNew from the empty state action', async () => {
    const user = userEvent.setup()
    const onCreateNew = vi.fn()

    render(<ProjectsTable projects={[]} emptyIcon="search.svg" onCreateNew={onCreateNew} />)
    await user.click(screen.getByRole('button', { name: '+ Add New Project' }))

    expect(onCreateNew).toHaveBeenCalledTimes(1)
  })

  it('renders project rows when data exists', () => {
    render(
      <ProjectsTable
        projects={[
          { name: 'Alpha', lastUpdated: 'Today', size: '12 MB' },
          { name: 'Bravo', lastUpdated: 'Yesterday', size: '8 MB' }
        ]}
        emptyIcon="search.svg"
        onCreateNew={vi.fn()}
      />
    )

    expect(screen.getByText('Alpha')).toBeInTheDocument()
    expect(screen.getByText('Bravo')).toBeInTheDocument()
    expect(screen.queryByText('No Projects Found')).not.toBeInTheDocument()
  })
})
