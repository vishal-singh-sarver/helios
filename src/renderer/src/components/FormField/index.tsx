import React from 'react'
import Tooltip from '../ToolTip'

export interface FormFieldLabelProps {
  label: string
  helpText: string
  helpAriaLabel: string
}

export interface FormFieldInputProps {
  name: string
  value: string
  onChange: React.ChangeEventHandler<HTMLInputElement>
  onBlur: React.FocusEventHandler<HTMLInputElement>
  error?: string
  type?: string
  placeholder?: string
  disabled?: boolean
}

interface FormFieldProps {
  labelProps: FormFieldLabelProps
  inputProps: FormFieldInputProps
}

function FormField({ labelProps, inputProps }: FormFieldProps): React.JSX.Element {
  // console.log(`FormField label ${label}`)
  // console.log(`FormField value ${value}`)
  
  const { label, helpText, helpAriaLabel } = labelProps
  const { error, type = 'text', placeholder = 'Enter', disabled = false, ...restInputProps } = inputProps


  return (
    <label className="block text-sm text-neutral-300">
      <span className="flex items-center gap-1">
        {label}
        <span className="text-red-400">*</span>
        <Tooltip
          text={helpText}
          ariaLabel={helpAriaLabel}
        />
      </span>

      <input
        {...restInputProps}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        className="mt-1 h-9 w-full rounded border border-app-border bg-dark 
        px-3 text-sm text-white outline-none focus:border-neutral-500"
      />

      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </label>
  )
}

export default FormField