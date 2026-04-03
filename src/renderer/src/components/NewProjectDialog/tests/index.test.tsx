import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import NewProjectDialog from '../index'

function renderDialog(overrides: Partial<React.ComponentProps<typeof NewProjectDialog>> = {}) {
  const mockOnFieldChange = vi.fn()
  const baseValues = { projectName: '', latitude: '', longitude: '' }

  const mockFormik = {
    touched: (overrides as any).initialTouched ?? {},
    errors: (overrides as any).initialErrors ?? {},
    getFieldProps: (name: any) => ({
      value: (overrides as any).initialValues?.[name] ?? baseValues[name as keyof typeof baseValues],
      onChange: (e: any) => mockOnFieldChange(name, e.target ? e.target.value : e),
      name
    }),
    submitForm: vi.fn()
  } as unknown as any

  const props: React.ComponentProps<typeof NewProjectDialog> = {
    isOpen: true,
    formik: mockFormik,
    onClose: vi.fn(),
    ...overrides
  }

  const result = render(<NewProjectDialog {...props} />)
  return { ...result, props, mockFormik, mockOnFieldChange }
}

describe('<NewProjectDialog />', () => {
  it('does not render when closed', () => {
    renderDialog({ isOpen: false })

    expect(screen.queryByRole('dialog', { name: 'New Project' })).not.toBeInTheDocument()
  })

  it('renders dialog content when open', () => {
    renderDialog({ initialValues: { projectName: 'Demo', latitude: '12.34', longitude: '56.78' } } as any)

    expect(screen.getByRole('dialog', { name: 'New Project' })).toBeInTheDocument()
    expect(screen.getByDisplayValue('Demo')).toBeInTheDocument()
    expect(screen.getByDisplayValue('12.34')).toBeInTheDocument()
    expect(screen.getByDisplayValue('56.78')).toBeInTheDocument()
  })

  it('calls onClose and submits form on Create', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()

    const { mockFormik } = renderDialog({ onClose } as any)

    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onClose).toHaveBeenCalledTimes(1)

    await user.click(screen.getByRole('button', { name: 'Create' }))
    expect(mockFormik.submitForm).toHaveBeenCalledTimes(1)
  })

  it('forwards field updates through formik getFieldProps onChange', async () => {
    const user = userEvent.setup()

    const { mockOnFieldChange } = renderDialog()

    const inputs = screen.getAllByPlaceholderText('Enter')
    await user.type(inputs[0], 'A')
    await user.type(inputs[1], '1')
    await user.type(inputs[2], '2')

    expect(mockOnFieldChange).toHaveBeenCalledWith('projectName', 'A')
    expect(mockOnFieldChange).toHaveBeenCalledWith('latitude', '1')
    expect(mockOnFieldChange).toHaveBeenCalledWith('longitude', '2')
  })

  it('shows errors and the selected help tooltip', async () => {
    const user = userEvent.setup()
    renderDialog({ initialTouched: { projectName: true }, initialErrors: { projectName: 'Project name is required.' } } as any)

    expect(screen.getByText('Project name is required.')).toBeInTheDocument()

    const latitudeHelpButton = screen.getByRole('img', { name: 'Show latitude help' })
    await user.hover(latitudeHelpButton)
    expect(
      screen.getByText(
        'Enter latitude in decimal degrees. Valid range: -90 <= latitude <= 90. Negative for South, positive for North.'
      )
    ).toBeInTheDocument()
  })
})
