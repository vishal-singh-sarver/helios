import chevronIcon from '@renderer/assets/chevron.svg'
import newProjectIcon from '@renderer/assets/new_project.svg'
import uploadIcon from '@renderer/assets/Upload.svg'
import ToolbarButton from '@renderer/components/ToolbarButton'
import React from 'react'
import AddColumnDialog from './AddColumnDialog'
import AddRowsDialog from './AddRowsDialog'

interface WeatherToolbarProps {
  onFilter?: () => void
  onUploadFile?: () => void
}

function WeatherToolbar({ onFilter, onUploadFile }: WeatherToolbarProps): React.JSX.Element {
  const [isAddColumnOpen, setIsAddColumnOpen] = React.useState(false)
  const [isAddRowsOpen, setIsAddRowsOpen] = React.useState(false)

  return (
    <div className="flex items-center gap-2 border-b border-app-border px-3 py-2">
      <ToolbarButton label="Filter" icon={chevronIcon} iconPosition="right" onClick={onFilter} />
      <ToolbarButton
        label="Add Columns"
        icon={newProjectIcon}
        onClick={() => setIsAddColumnOpen(true)}
      />
      <ToolbarButton
        label="Add Rows"
        icon={newProjectIcon}
        onClick={() => setIsAddRowsOpen(true)}
      />
      <ToolbarButton label="Upload File" icon={uploadIcon} onClick={onUploadFile} />

      <AddColumnDialog
        isOpen={isAddColumnOpen}
        onClose={() => setIsAddColumnOpen(false)}
      />
      <AddRowsDialog
        isOpen={isAddRowsOpen}
        onClose={() => setIsAddRowsOpen(false)}
      />
    </div>
  )
}

export default WeatherToolbar
