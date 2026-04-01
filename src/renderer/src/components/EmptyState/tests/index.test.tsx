import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import EmptyState from '../index'

describe('<EmptyState />', () => {
  it('renders the empty-state content', () => {
    render(<EmptyState icon="search.svg" onCreateNew={vi.fn()} />)

    expect(screen.getByText('No Projects Found')).toBeInTheDocument()
    expect(screen.getByText('No Projects Found. Please add a new Project.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '+ Add New Project' })).toBeInTheDocument()
  })

  it('calls onCreateNew when the action is clicked', async () => {
    const user = userEvent.setup()
    const onCreateNew = vi.fn()

    render(<EmptyState icon="search.svg" onCreateNew={onCreateNew} />)
    await user.click(screen.getByRole('button', { name: '+ Add New Project' }))

    expect(onCreateNew).toHaveBeenCalledTimes(1)
  })
})
