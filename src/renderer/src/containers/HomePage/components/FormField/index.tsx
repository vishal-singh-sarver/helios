import React from 'react'

interface FormFieldProps {
  label: string
  value: string
  error?: string
  helpText: string
  isHelpVisible: boolean
  helpAriaLabel: string
  onChange: (value: string) => void
  onHelpChange: (visible: boolean) => void
}

function FormField({
  label,
  value,
  error,
  helpText,
  isHelpVisible,
  helpAriaLabel,
  onChange,
  onHelpChange
}: FormFieldProps): React.JSX.Element {
  return (
    <label className="block text-sm text-neutral-300">
      <span className="flex items-center gap-1">
        {label}
        <span className="text-red-400">*</span>
        <span className="relative inline-flex">
          <button
            type="button"
            aria-label={helpAriaLabel}
            onMouseEnter={() => onHelpChange(true)}
            onMouseLeave={() => onHelpChange(false)}
            onFocus={() => onHelpChange(true)}
            onBlur={() => onHelpChange(false)}
            className="flex h-5 w-5 items-center justify-center rounded-full border border-neutral-300 text-xs font-semibold text-white"
          >
            ?
          </button>
          {isHelpVisible && (
            <span
              role="tooltip"
              className="pointer-events-none absolute left-full top-1/2 z-10 ml-2 w-64 -translate-y-1/2 rounded border border-app-border bg-[#2b2d33] px-2 py-1 text-[11px] leading-4 text-neutral-200"
            >
              {helpText}
            </span>
          )}
        </span>
      </span>

      <input
        placeholder="Enter"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 h-9 w-full rounded border border-app-border bg-dark px-3 text-sm text-white outline-none focus:border-neutral-500"
      />

      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </label>
  )
}

export default FormField
