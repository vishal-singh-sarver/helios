import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import NewProjectDialog from '../index'

function renderDialog(overrides: Partial<React.ComponentProps<typeof NewProjectDialog>> = {}) {
  const props: React.ComponentProps<typeof NewProjectDialog> = {
    isOpen: true,
    projectName: '',
    latitude: '',
    longitude: '',
    formErrors: {},
    hoveredHelp: null,
    onClose: vi.fn(),
    onCreate: vi.fn(),
    onFieldChange: vi.fn(),
    onHelpChange: vi.fn(),
    ...overrides
  }

  const result = render(<NewProjectDialog {...props} />)
  return { ...result, props }
}

describe('<NewProjectDialog />', () => {
  it('does not render when closed', () => {
    renderDialog({ isOpen: false })

    expect(screen.queryByRole('dialog', { name: 'New Project' })).not.toBeInTheDocument()
  })

  it('renders dialog content when open', () => {
    renderDialog({
      projectName: 'Demo',
      latitude: '12.34',
      longitude: '56.78'
    })

    expect(screen.getByRole('dialog', { name: 'New Project' })).toBeInTheDocument()
    expect(screen.getByDisplayValue('Demo')).toBeInTheDocument()
    expect(screen.getByDisplayValue('12.34')).toBeInTheDocument()
    expect(screen.getByDisplayValue('56.78')).toBeInTheDocument()
  })

  it('calls onClose and onCreate from action buttons', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    const onCreate = vi.fn()

    renderDialog({ onClose, onCreate })

    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    await user.click(screen.getByRole('button', { name: 'Create' }))

    expect(onClose).toHaveBeenCalledTimes(1)
    expect(onCreate).toHaveBeenCalledTimes(1)
  })

  it('forwards field updates through onFieldChange', async () => {
    const user = userEvent.setup()
    const onFieldChange = vi.fn()

    renderDialog({ onFieldChange })

    const inputs = screen.getAllByPlaceholderText('Enter')
    await user.type(inputs[0], 'A')
    await user.type(inputs[1], '1')
    await user.type(inputs[2], '2')

    expect(onFieldChange).toHaveBeenCalledWith('projectName', 'A')
    expect(onFieldChange).toHaveBeenCalledWith('latitude', '1')
    expect(onFieldChange).toHaveBeenCalledWith('longitude', '2')
  })

  it('shows errors and the selected help tooltip from props', () => {
    renderDialog({
      formErrors: {
        projectName: 'Project name is required.'
      },
      hoveredHelp: 'latitude'
    })

    expect(screen.getByText('Project name is required.')).toBeInTheDocument()
    expect(
      screen.getByText(
        'Enter latitude in decimal degrees. Valid range: -90 <= latitude <= 90. Negative for South, positive for North.'
      )
    ).toBeInTheDocument()
  })
})
