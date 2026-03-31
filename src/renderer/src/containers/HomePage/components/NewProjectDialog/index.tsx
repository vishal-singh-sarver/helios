import React from 'react'
import FormField from '../FormField'

type HelpField = 'projectName' | 'latitude' | 'longitude'

interface NewProjectDialogProps {
  isOpen: boolean
  projectName: string
  latitude: string
  longitude: string
  formErrors: {
    projectName?: string
    latitude?: string
    longitude?: string
  }
  hoveredHelp: HelpField | null
  onClose: () => void
  onCreate: () => void
  onFieldChange: (field: HelpField, value: string) => void
  onHelpChange: (field: HelpField | null) => void
}

function NewProjectDialog({
  isOpen,
  projectName,
  latitude,
  longitude,
  formErrors,
  hoveredHelp,
  onClose,
  onCreate,
  onFieldChange,
  onHelpChange
}: NewProjectDialogProps): React.JSX.Element | null {
  if (!isOpen) {
    return null
  }

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/50">
      <section
        role="dialog"
        aria-modal="true"
        aria-label="New Project"
        className="w-[420px] rounded border border-app-border bg-[#1f2126]"
      >
        <header className="flex items-center justify-between bg-neutral-200 px-4 py-2">
          <h2 className="text-md font-medium text-black">New Project</h2>

          <button
            onClick={onClose}
            className="px-2 py-1 text-sm text-black hover:bg-neutral-300"
          >
            ×
          </button>
        </header>

        <div className="space-y-3 p-4">
          <FormField
            label="Project Name"
            value={projectName}
            error={formErrors.projectName}
            helpText="Enter a project name to identify your work."
            isHelpVisible={hoveredHelp === 'projectName'}
            helpAriaLabel="Show project name help"
            onChange={(value) => onFieldChange('projectName', value)}
            onHelpChange={(visible) => onHelpChange(visible ? 'projectName' : null)}
          />

          <FormField
            label="Latitude"
            value={latitude}
            error={formErrors.latitude}
            helpText="Enter latitude in decimal degrees. Valid range: -90 <= latitude <= 90. Negative for South, positive for North."
            isHelpVisible={hoveredHelp === 'latitude'}
            helpAriaLabel="Show latitude help"
            onChange={(value) => onFieldChange('latitude', value)}
            onHelpChange={(visible) => onHelpChange(visible ? 'latitude' : null)}
          />

          <FormField
            label="Longitude"
            value={longitude}
            error={formErrors.longitude}
            helpText="Enter longitude in decimal degrees. Valid range: -180 <= longitude <= 180. Negative for West, positive for East."
            isHelpVisible={hoveredHelp === 'longitude'}
            helpAriaLabel="Show longitude help"
            onChange={(value) => onFieldChange('longitude', value)}
            onHelpChange={(visible) => onHelpChange(visible ? 'longitude' : null)}
          />

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={onClose}
              className="rounded bg-neutral-200 px-3 py-1 text-sm text-black hover:bg-neutral-100"
            >
              Cancel
            </button>

            <button
              onClick={onCreate}
              className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-500"
            >
              Create
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default NewProjectDialog
