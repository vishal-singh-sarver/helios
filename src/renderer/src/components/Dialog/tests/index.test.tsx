// components/Dialog/tests/index.test.tsx
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import Dialog from '../index'

// jsdom does not support HTMLDialogElement — mock showModal and close
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) {
    this.setAttribute('open', '')
  })
  HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
    this.removeAttribute('open')
  })
})

describe('<Dialog />', () => {
  const defaultProps = {
    isOpen: true,
    title: 'Test Dialog',
    onClose: vi.fn(),
    children: <p>Dialog content</p>
  }

  // Smoke test — component mounts without throwing
  it('renders without error', () => {
    render(<Dialog {...defaultProps} />)
  })

  // Verifies the dialog title is rendered in the header
  it('renders the title', () => {
    render(<Dialog {...defaultProps} />)
    expect(screen.getByText('Test Dialog')).toBeInTheDocument()
  })

  // Verifies children are rendered inside the dialog body
  it('renders children content', () => {
    render(<Dialog {...defaultProps} />)
    expect(screen.getByText('Dialog content')).toBeInTheDocument()
  })

  // Verifies the dialog element has the correct aria-label
  it('has correct aria-label', () => {
    render(<Dialog {...defaultProps} />)
    expect(screen.getByLabelText('Test Dialog')).toBeInTheDocument()
  })

  // Verifies showModal is called when isOpen is true
  it('calls showModal when isOpen is true', () => {
    render(<Dialog {...defaultProps} />)
    expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalled()
  })

  // Verifies close is called when isOpen changes from true to false
  it('calls close when isOpen becomes false', () => {
    const { rerender } = render(<Dialog {...defaultProps} />)
    rerender(<Dialog {...defaultProps} isOpen={false} />)
    expect(HTMLDialogElement.prototype.close).toHaveBeenCalled()
  })

  // Verifies showModal is NOT called when isOpen starts as false
  it('does not call showModal when isOpen is false', () => {
    vi.mocked(HTMLDialogElement.prototype.showModal).mockClear()
    render(<Dialog {...defaultProps} isOpen={false} />)
    expect(HTMLDialogElement.prototype.showModal).not.toHaveBeenCalled()
  })

  // Verifies onClose is called when the close (×) button is clicked
  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn()
    render(<Dialog {...defaultProps} onClose={onClose} />)
    fireEvent.click(screen.getByLabelText('Close dialog'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  // Verifies the native cancel event (ESC key) is prevented and onClose is called
  it('calls onClose on cancel event and prevents default', () => {
    const onClose = vi.fn()
    render(<Dialog {...defaultProps} onClose={onClose} />)
    const dialog = screen.getByLabelText('Test Dialog')
    const cancelEvent = new Event('cancel', { bubbles: true, cancelable: true })
    const preventDefaultSpy = vi.spyOn(cancelEvent, 'preventDefault')
    dialog.dispatchEvent(cancelEvent)
    expect(preventDefaultSpy).toHaveBeenCalled()
    expect(onClose).toHaveBeenCalled()
  })

  // Verifies the close button shows the × character
  it('renders the close button with × symbol', () => {
    render(<Dialog {...defaultProps} />)
    expect(screen.getByLabelText('Close dialog')).toHaveTextContent('×')
  })

  // Snapshot regression guard — open state
  it('should match the snapshot (open)', () => {
    const { container } = render(<Dialog {...defaultProps} />)
    expect(container.firstChild).toMatchSnapshot()
  })

  // Snapshot regression guard — closed state
  it('should match the snapshot (closed)', () => {
    const { container } = render(<Dialog {...defaultProps} isOpen={false} />)
    expect(container.firstChild).toMatchSnapshot()
  })
})