import chevronIcon from '@renderer/assets/chevron.svg'
import deleteIcon from '@renderer/assets/delete.svg'
import documentIcon from '@renderer/assets/Icon (Stroke).svg'
import newProjectIcon from '@renderer/assets/new_project.svg'
import uploadIcon from '@renderer/assets/Upload.svg'
import ToolbarButton from '@renderer/components/ToolbarButton'
import Dialog from '@renderer/components/Dialog'
import React from 'react'
import { useSelector } from 'react-redux'
import AddColumnDialog from './AddColumnDialog'
import AddRowsDialog from './AddRowsDialog'
import messages from './messages'
import {
  selectAddColumnError,
  selectAddColumnLoading,
  selectAddRowError,
  selectAddRowLoading
} from './selectors'

interface WeatherToolbarProps {
  onFilter?: () => void
  onUploadFile?: () => void
  importedFilename?: string | null
  onClearImportedFile?: () => void
  clearingImport?: boolean
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

function WeatherToolbar({
  onFilter,
  onUploadFile,
  importedFilename,
  onClearImportedFile,
  clearingImport = false
}: WeatherToolbarProps): React.JSX.Element {
  const [isAddColumnOpen, setIsAddColumnOpen] = React.useState(false)
  const [isAddRowsOpen, setIsAddRowsOpen] = React.useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)

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

  React.useEffect(() => {
    if (!importedFilename) {
      setIsDeleteDialogOpen(false)
    }
  }, [importedFilename, clearingImport])

  const handleRequestDeleteImportedFile = (): void => {
    if (clearingImport) return
    setIsDeleteDialogOpen(true)
  }

  const handleCancelDeleteImportedFile = (): void => {
    if (clearingImport) return
    setIsDeleteDialogOpen(false)
  }

  const handleConfirmDeleteImportedFile = (): void => {
    if (clearingImport) return
    onClearImportedFile?.()
  }

  return (
    <div className="flex items-center justify-between gap-3 border-b border-app-border px-3 py-2">
      <div className="flex items-center gap-2">
        <ToolbarButton label="Filter" icon={chevronIcon} iconPosition="right" onClick={onFilter} />
        <ToolbarButton
          label="Add Columns"
          icon={newProjectIcon}
          bgColor="#ffffff"
          textColor="#000000"
          iconColor="dark"
          onClick={() => setIsAddColumnOpen(true)}
        />
        <ToolbarButton
          label="Add Rows"
          icon={newProjectIcon}
          bgColor="#ffffff"
          textColor="#000000"
          iconColor="dark"
          onClick={() => setIsAddRowsOpen(true)}
        />
        <ToolbarButton
          label="Upload File"
          icon={uploadIcon}
          bgColor="#ffffff"
          textColor="#000000"
          iconColor="dark"
          onClick={onUploadFile}
        />
      </div>

      {importedFilename && (
        <div className="flex min-w-0 items-center gap-2 rounded border border-[#4a4a4a] bg-[#2d2d2d] px-3 py-2 text-sm text-white">
          <img src={documentIcon} alt="" className="h-4 w-4 shrink-0 opacity-90" />
          <span className="max-w-[280px] truncate">{importedFilename}</span>
          <button
            type="button"
            aria-label="Delete uploaded weather file"
            onClick={handleRequestDeleteImportedFile}
            disabled={clearingImport}
            className="shrink-0 opacity-90 transition hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <img src={deleteIcon} alt="" className="h-4 w-4" />
          </button>
        </div>
      )}

      <AddColumnDialog
        isOpen={isAddColumnOpen}
        onClose={() => setIsAddColumnOpen(false)}
      />
      <AddRowsDialog
        isOpen={isAddRowsOpen}
        onClose={() => setIsAddRowsOpen(false)}
      />
      <Dialog
        isOpen={isDeleteDialogOpen}
        title={messages.deleteImport.dialogTitle}
        onClose={handleCancelDeleteImportedFile}
      >
        <h3 className="text-base font-medium text-white">
          {importedFilename ? messages.deleteImport.heading(importedFilename) : ''}
        </h3>
        <p className="text-sm text-neutral-400">{messages.deleteImport.body}</p>

        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={handleCancelDeleteImportedFile}
            disabled={clearingImport}
            className="rounded bg-neutral-200 px-3 py-1 text-sm text-black hover:bg-neutral-100 disabled:opacity-50"
          >
            {messages.deleteImport.cancelButton}
          </button>
          <button
            onClick={handleConfirmDeleteImportedFile}
            disabled={clearingImport}
            className="rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-500 disabled:opacity-50"
          >
            {messages.deleteImport.confirmButton}
          </button>
        </div>
      </Dialog>
    </div>
  )
}

export default WeatherToolbar
