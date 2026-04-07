import React from 'react'
import FormAction from '../FormAction'

interface FormProps {
  onSubmit: () => void
  onCancel: () => void
  submitLabel: string
  cancelLabel: string
  children: React.ReactNode
}

function Form({ onSubmit, onCancel, submitLabel, cancelLabel, children }: FormProps): React.JSX.Element {
  return (
    <>
      {children}

      <div className="flex justify-end gap-2 pt-2">
        <FormAction label={cancelLabel} variant="secondary" onClick={onCancel} />
        <FormAction label={submitLabel} variant="primary" onClick={onSubmit} />
      </div>
    </>
  )
}

export default Form
