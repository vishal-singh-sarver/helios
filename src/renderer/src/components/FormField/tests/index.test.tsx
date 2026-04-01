import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FormField from '../index'

describe('<FormField />', () => {
  it('renders label, required marker, and input value', () => {
    const mockFormik = {
      touched: {},
      errors: {},
      getFieldProps: (name: any) => ({ value: '12.3', onChange: vi.fn(), name }),
      submitForm: vi.fn()
    } as unknown as any

    render(
      <FormField
        label="Latitude"
        name="latitude"
        helpText="Latitude help text"
        isHelpVisible={false}
        helpAriaLabel="Show latitude help"
        formik={mockFormik}
        onHelpChange={vi.fn()}
      />
    )

    expect(screen.getByText('Latitude')).toBeInTheDocument()
    expect(screen.getByText('*')).toBeInTheDocument()
    expect(screen.getByDisplayValue('12.3')).toBeInTheDocument()
  })

  it('calls onChange when the input changes', async () => {
    const user = userEvent.setup()
    const mockOnChange = vi.fn()
    const mockFormik = {
      touched: {},
      errors: {},
      getFieldProps: (name: any) => ({ value: '', onChange: (e: any) => mockOnChange(e.target ? e.target.value : e), name }),
      submitForm: vi.fn()
    } as unknown as any

    render(
      <FormField
        label="Latitude"
        name="latitude"
        helpText="Latitude help text"
        isHelpVisible={false}
        helpAriaLabel="Show latitude help"
        formik={mockFormik}
        onHelpChange={vi.fn()}
      />
    )

    await user.type(screen.getByPlaceholderText('Enter'), '45')

    expect(mockOnChange).toHaveBeenCalled()
  })

  it('shows tooltip and validation error from props', () => {
    const mockFormik = {
      touched: { latitude: true },
      errors: { latitude: 'Latitude is invalid' },
      getFieldProps: (name: any) => ({ value: '', onChange: vi.fn(), name }),
      submitForm: vi.fn()
    } as unknown as any

    render(
      <FormField
        label="Latitude"
        name="latitude"
        helpText="Latitude help text"
        isHelpVisible
        helpAriaLabel="Show latitude help"
        formik={mockFormik}
        onHelpChange={vi.fn()}
      />
    )

    expect(screen.getByRole('tooltip')).toHaveTextContent('Latitude help text')
    expect(screen.getByText('Latitude is invalid')).toBeInTheDocument()
  })

  it('calls onHelpChange on hover and unhover', async () => {
    const user = userEvent.setup()
    const onHelpChange = vi.fn()
    const mockFormik = {
      touched: {},
      errors: {},
      getFieldProps: (name: any) => ({ value: '', onChange: vi.fn(), name }),
      submitForm: vi.fn()
    } as unknown as any

    render(
      <FormField
        label="Latitude"
        name="latitude"
        helpText="Latitude help text"
        isHelpVisible={false}
        helpAriaLabel="Show latitude help"
        formik={mockFormik}
        onHelpChange={onHelpChange}
      />
    )

    const helpButton = screen.getByRole('button', { name: 'Show latitude help' })
    await user.hover(helpButton)
    await user.unhover(helpButton)

    expect(onHelpChange).toHaveBeenNthCalledWith(1, true)
    expect(onHelpChange).toHaveBeenNthCalledWith(2, false)
  })
})
