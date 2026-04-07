import React, { useEffect, useRef, useCallback } from 'react'

interface DialogProps {
  isOpen: boolean
  title: string
  onClose: () => void
  children: React.ReactNode
}

function Dialog({ isOpen, title, onClose, children }: DialogProps): React.JSX.Element {
  const dialogRef = useRef<HTMLDialogElement>(null)

  const handleCancel = useCallback(
    (event: Event): void => {
      event.preventDefault()
      onClose()
    },
    [onClose]
  )

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (isOpen) {
      dialog.showModal()
      const firstFocusable = dialog.querySelector<HTMLElement>(
        'button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      firstFocusable?.focus()
    } else {
      dialog.close()
    }
  }, [isOpen])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    dialog.addEventListener('cancel', handleCancel)
    return () => dialog.removeEventListener('cancel', handleCancel)
  }, [handleCancel])

  return (
    <dialog
      ref={dialogRef}
      aria-label={title}
      className="fixed inset-0 m-auto w-[420px] rounded border border-app-border bg-[#1f2126] p-0 backdrop:bg-black/50"
    >
      <header className="flex items-center justify-between bg-neutral-200 px-4 py-2">
        <h2 className="text-md font-medium text-black">{title}</h2>
        <button aria-label="Close dialog" onClick={onClose} className="px-2 py-1 text-sm text-black hover:bg-neutral-300">
          ×
        </button>
      </header>

      <div className="space-y-3 p-4">
        {children}
      </div>
    </dialog>
  )
}

export default Dialog
