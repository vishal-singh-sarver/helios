// src/renderer/components/FormField.tsx

import React from 'react'
import { FormikProps } from 'formik'
import Tooltip from '../ToolTip'

interface FormValues {
  projectName: string
  latitude: string
  longitude: string
}

interface FormFieldProps {
  label: string
  name: keyof FormValues
  helpText: string
  isHelpVisible: boolean
  helpAriaLabel: string
  formik: FormikProps<FormValues>
  onHelpChange: (visible: boolean) => void
}

function FormField({
  label,
  name,
  helpText,
  isHelpVisible,
  helpAriaLabel,
  formik,
  onHelpChange
}: FormFieldProps): React.JSX.Element {
  const error = formik.touched[name] ? formik.errors[name] : undefined

  return (
    <label className="block text-sm text-neutral-300">
      <span className="flex items-center gap-1">
        {label}
        <span className="text-red-400">*</span>

      
        <Tooltip
          text={helpText}
          isVisible={isHelpVisible}
          ariaLabel={helpAriaLabel}
          onHoverChange={onHelpChange}
        />

      </span>

      <input
        placeholder="Enter"
        {...formik.getFieldProps(name)}
        className="mt-1 h-9 w-full rounded border border-app-border bg-dark 
        px-3 text-sm text-white outline-none focus:border-neutral-500"
      />

      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </label>
  )
}

export default FormField
