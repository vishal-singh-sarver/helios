import chevronIcon from '@renderer/assets/chevron.svg'
import newProjectIcon from '@renderer/assets/new_project.svg'
import uploadIcon from '@renderer/assets/Upload.svg'
import ToolbarButton from '@renderer/components/ToolbarButton'
import React from 'react'
import { useSelector } from 'react-redux'
import AddColumnDialog from './AddColumnDialog'
import AddRowsDialog from './AddRowsDialog'
import {
  selectAddColumnError,
  selectAddColumnLoading,
  selectAddRowError,
  selectAddRowLoading
} from './selectors'

interface WeatherToolbarProps {
  onFilter?: () => void
  onUploadFile?: () => void
}

// `useTransitionToFalse(value)` returns true on the render where `value`
// flipped from true → false. Lets the toolbar auto-close a dialog on a
// successful loading→idle transition without needing useEffect.
function useTransitionToFalse(value: boolean): boolean {
  const [prev, setPrev] = React.useState(value)
  if (prev !== value) {
    setPrev(value)
    return prev && !value
  }
  return false
}

function WeatherToolbar({ onFilter, onUploadFile }: WeatherToolbarProps): React.JSX.Element {
  const [isAddColumnOpen, setIsAddColumnOpen] = React.useState(false)
  const [isAddRowsOpen, setIsAddRowsOpen] = React.useState(false)

  const addColumnLoading = useSelector(selectAddColumnLoading)
  const addColumnError = useSelector(selectAddColumnError)
  const addRowLoading = useSelector(selectAddRowLoading)
  const addRowError = useSelector(selectAddRowError)

  // Close the dialog on the loading→idle transition only when there's no
  // error — otherwise the dialog stays open so the user can see the failure
  // banner and retry.
  if (useTransitionToFalse(addColumnLoading) && !addColumnError && isAddColumnOpen) {
    setIsAddColumnOpen(false)
  }
  if (useTransitionToFalse(addRowLoading) && !addRowError && isAddRowsOpen) {
    setIsAddRowsOpen(false)
  }

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
