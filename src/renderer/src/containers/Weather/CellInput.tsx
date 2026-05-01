import React from 'react'

interface CellInputProps {
  rowId: string
  colId: string
  value: string
  onCommit: (next: string) => void
}

function CellInput({ rowId, colId, value, onCommit }: CellInputProps): React.JSX.Element {
  const [draft, setDraft] = React.useState(value)
  React.useEffect(() => setDraft(value), [value])

  return (
    <input
      type="text"
      aria-label={`${rowId} ${colId}`}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => onCommit(draft)}
      className="w-full bg-transparent outline-none focus:ring-1 focus:ring-blue-500/40"
    />
  )
}

export default CellInput
