
export interface FormValues {
  projectName: string
  latitude: string
  longitude: string
}

export const INITIAL_VALUES: FormValues = {
  projectName: '',
  latitude: '',
  longitude: ''
}

export interface SidebarItem {
  label: string
  icon: string
  onAction: () => void
}

export type ToolbarMap = Record<string, string[]>

export const TOOLBAR_ITEMS: ToolbarMap = {
  File: ['New Project', 'Open Project', 'Import Project', 'Exit'],
  Edit: ['Undo', 'Redo', 'Preferences'],
  View: ['Zoom In', 'Zoom Out', 'Reset Layout'],
  Tools: ['Scripting Console', 'Extensions', 'Diagnostics'],
  Help: ['Documentation', 'Shortcuts', 'About Helios']
}
