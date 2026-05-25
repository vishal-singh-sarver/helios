import { fireEvent, render, screen } from '@testing-library/react'
import StepFilePreview from '../StepFilePreview'

describe('<StepFilePreview />', () => {
  const baseProps = {
    filename: null,
    fileLoading: false,
    fileError: null,
    parseError: null,
    onBrowse: vi.fn()
  }

  it('renders the file label and an empty filename input', () => {
    render(<StepFilePreview {...baseProps} />)
    expect(screen.getByText('Weather Data File')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('No file selected')).toHaveValue('')
  })

  it('shows the filename when one is supplied', () => {
    render(<StepFilePreview {...baseProps} filename="sample.csv" />)
    expect(screen.getByDisplayValue('sample.csv')).toBeInTheDocument()
  })

  it('Browse button calls onBrowse', () => {
    const onBrowse = vi.fn()
    render(<StepFilePreview {...baseProps} onBrowse={onBrowse} />)
    fireEvent.click(screen.getByText('Browse'))
    expect(onBrowse).toHaveBeenCalledTimes(1)
  })

  it('shows "Opening…" and disables the Browse button while fileLoading', () => {
    render(<StepFilePreview {...baseProps} fileLoading />)
    const btn = screen.getByText('Opening…')
    expect(btn).toBeDisabled()
  })

  it('renders a "Could not open file" banner on fileError', () => {
    render(<StepFilePreview {...baseProps} fileError="permission denied" />)
    expect(screen.getByText(/Could not open file/)).toBeInTheDocument()
    expect(screen.getByText(/permission denied/)).toBeInTheDocument()
  })

  it('renders an "Invalid file" banner on parseError', () => {
    render(<StepFilePreview {...baseProps} parseError="row 5 column mismatch" />)
    expect(screen.getByText(/Invalid file/)).toBeInTheDocument()
    expect(screen.getByText(/row 5 column mismatch/)).toBeInTheDocument()
  })

  it('renders nothing in the error region when there is no error', () => {
    render(<StepFilePreview {...baseProps} />)
    expect(screen.queryByText(/Invalid file/)).not.toBeInTheDocument()
    expect(screen.queryByText(/Could not open file/)).not.toBeInTheDocument()
  })
})
