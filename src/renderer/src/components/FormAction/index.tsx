import React from 'react'

type FormActionVariant = 'primary' | 'secondary'

interface FormActionProps {
  label: string
  variant: FormActionVariant
  onClick: () => void
}

const VARIANT_STYLES: Record<FormActionVariant, string> = {
  primary: 'rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-500',
  secondary: 'rounded bg-neutral-200 px-3 py-1 text-sm text-black hover:bg-neutral-100'
}

function FormAction({ label, variant, onClick }: FormActionProps): React.JSX.Element {
  return (
    <button onClick={onClick} className={VARIANT_STYLES[variant]}>
      {label}
    </button>
  )
}

export default FormAction
