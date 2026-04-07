import React, {useEffect, useRef } from 'react'
import { FormikProps } from 'formik'
import FormField from '../FormField'
import { FormValues } from '../../types/project'

interface NewProjectDialogProps {
  isOpen: boolean
  formik: FormikProps<FormValues>
  onClose: () => void
}

function NewProjectDialog({
  isOpen,
  formik,
  onClose
}: NewProjectDialogProps): React.JSX.Element {
  const dialogRef = useRef<HTMLDialogElement>(null)

  const handleClose = (): void => {
    formik.resetForm()
    onClose()
  }

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

    const handleCancel = (event: Event): void => {
      event.preventDefault()
      handleClose()
    }

    dialog.addEventListener('cancel', handleCancel)
    return () => dialog.removeEventListener('cancel', handleCancel)
  }, [formik, onClose])

  return (
    <dialog
      ref={dialogRef}
      aria-label="New Project"
      className="fixed inset-0 m-auto w-[420px] rounded border border-app-border bg-[#1f2126] p-0 backdrop:bg-black/50"
    >
      <header className="flex items-center justify-between bg-neutral-200 px-4 py-2">
        <h2 className="text-md font-medium text-black">New Project</h2>
        <button aria-label="Close dialog" onClick={handleClose} className="px-2 py-1 text-sm text-black hover:bg-neutral-300">
          ×
        </button>
      </header>

      <div className="space-y-3 p-4">
        <FormField
          labelProps={{
            label: 'Project Name',
            helpText: 'Enter a project name to identify your work.',
            helpAriaLabel: 'Show project name help'
          }}
          inputProps={{
            ...formik.getFieldProps('projectName'),
            error: formik.errors.projectName as string | undefined
          }}
        />
        <FormField
          labelProps={{
            label: 'Latitude',
            helpText: 'Enter latitude in decimal degrees. Valid range: -90 <= latitude <= 90. Negative for South, positive for North.',
            helpAriaLabel: 'Show latitude help'
          }}
          inputProps={{
            ...formik.getFieldProps('latitude'),
            error: formik.errors.latitude as string | undefined,
            type: 'number'
          }}
        />
        <FormField
          labelProps={{
            label: 'Longitude',
            helpText: 'Enter longitude in decimal degrees. Valid range: -180 <= longitude <= 180. Negative for West, positive for East.',
            helpAriaLabel: 'Show longitude help'
          }}
          inputProps={{
            ...formik.getFieldProps('longitude'),
            error: formik.errors.longitude as string | undefined,
            type: 'number'
          }}
        />

        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={handleClose}
            className="rounded bg-neutral-200 px-3 py-1 text-sm text-black hover:bg-neutral-100"
          >
            Cancel
          </button>
          <button
            onClick={() => formik.submitForm()}
            className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-500"
          >
            Create
          </button>
        </div>
      </div>
    </dialog>
  )
}

export default NewProjectDialog
