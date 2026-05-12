import React, { useEffect, useRef } from 'react'

interface DialogProps {
  isOpen: boolean
  title: string
  onClose: () => void
  children: React.ReactNode
  className?: string
  headerClassName?: string
  bodyClassName?: string
}

function Dialog({
  isOpen,
  title,
  onClose,
  children,
  className = 'w-[420px] rounded border border-app-border bg-[#1f2126]',
  headerClassName = 'bg-neutral-200 px-4 py-2',
  bodyClassName = 'space-y-3 p-4'
}: DialogProps): React.JSX.Element {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (isOpen && !dialog.open) {
      dialog.showModal()
      const firstFocusable = dialog.querySelector<HTMLElement>(
        'button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      firstFocusable?.focus()
    } else if (!isOpen && dialog.open) {
      dialog.close()
    }
  }, [isOpen])

  return (
    <dialog
      ref={dialogRef}
      aria-label={title}
      onCancel={(e) => {
        e.preventDefault()
        onClose()
      }}
      className={`fixed inset-0 m-auto ${className} p-0 backdrop:bg-black/50`}
    >
      <header className={`flex items-center justify-between ${headerClassName}`}>
        <h2 className="text-md font-medium text-black">{title}</h2>
        <button
          aria-label="Close dialog"
          onClick={onClose}
          className="px-2 py-1 text-sm text-black hover:bg-neutral-300"
        >
          ×
        </button>
      </header>

      <div className={bodyClassName}>{children}</div>
    </dialog>
  )
}

export default Dialog
