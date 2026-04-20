import React,{ useId } from 'react'
import type { PlacesType } from 'react-tooltip'
import Tooltip from '../Tooltip'

export interface FormFieldLabelProps {
  label: string
  helpText: string
  helpAriaLabel: string
  helpPlace?: PlacesType
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
  const { label, helpText, helpAriaLabel, helpPlace } = labelProps
  const { error, type = 'text', placeholder = 'Enter', disabled = false, ...restInputProps } = inputProps
  const errorId = useId()

  return (
    <div className="block text-sm text-neutral-300">
      <label htmlFor={restInputProps.name} className="flex items-center gap-1">
        {label}
        <span className="text-red-400">*</span>
        <Tooltip
          text={helpText}
          ariaLabel={helpAriaLabel}
          place={helpPlace}
        />
      </label>

      <input
        {...restInputProps}
        id={restInputProps.name}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        aria-describedby={error ? errorId : undefined}
        aria-invalid={!!error}
        className="mt-1 h-9 w-full rounded border border-app-border bg-dark 
        px-3 text-sm text-white outline-none focus:border-neutral-500"
      />

      {error && (
        <p id={errorId} className="mt-1 text-xs text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

export default FormField