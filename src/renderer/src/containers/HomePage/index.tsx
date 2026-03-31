import React from 'react'
import heliosLogo from '@renderer/assets/Helios_logo.svg'
import homeIcon from '@renderer/assets/home.svg'
import newProjectIcon from '@renderer/assets/new_project.svg'
import openProjectIcon from '@renderer/assets/open_project.svg'
import searchIcon from '@renderer/assets/search.svg'
import MenuBar from '@renderer/components/MenuBar'
import SearchBar from '@renderer/components/SearchBar'
import NewProjectDialog from './components/NewProjectDialog'
import ProjectsTable from './components/ProjectsTable'
import Sidebar from './components/Sidebar'

type ToolbarMap = Record<string, string[]>
type HelpField = 'projectName' | 'latitude' | 'longitude'

interface SidebarItem {
  label: string
  icon: string
}

interface ProjectRecord {
  name: string
  lastUpdated: string
  size: string
}

const TOOLBAR_ITEMS: ToolbarMap = {
  File: ['New Project', 'Open Project', 'Import Project', 'Exit'],
  Edit: ['Undo', 'Redo', 'Preferences'],
  View: ['Zoom In', 'Zoom Out', 'Reset Layout'],
  Tools: ['Scripting Console', 'Extensions', 'Diagnostics'],
  Help: ['Documentation', 'Shortcuts', 'About Helios']
}

const SIDEBAR_ITEMS: SidebarItem[] = [
  { label: 'Home', icon: homeIcon },
  { label: 'New Project', icon: newProjectIcon },
  { label: 'Open project', icon: openProjectIcon }
]

const SAVED_PROJECTS: ProjectRecord[] = []

export function HomePage(): React.JSX.Element {
  const [openMenu, setOpenMenu] = React.useState<string | null>(null)
  const [searchText, setSearchText] = React.useState('')
  const [showNewProjectDialog, setShowNewProjectDialog] = React.useState(false)
  const [projectName, setProjectName] = React.useState('')
  const [latitude, setLatitude] = React.useState('')
  const [longitude, setLongitude] = React.useState('')
  const [hoveredHelp, setHoveredHelp] = React.useState<HelpField | null>(null)
  const [formErrors, setFormErrors] = React.useState<{
    projectName?: string
    latitude?: string
    longitude?: string
  }>({})

  const openNewProjectDialog = (): void => {
    setOpenMenu(null)
    setFormErrors({})
    setHoveredHelp(null)
    setShowNewProjectDialog(true)
  }

  const closeNewProjectDialog = (): void => {
    setShowNewProjectDialog(false)
  }

  const validateAndCreateProject = (): void => {
    const nextErrors: { projectName?: string; latitude?: string; longitude?: string } = {}

    if (!projectName.trim()) {
      nextErrors.projectName = 'Project name is required.'
    }

    const lat = Number.parseFloat(latitude)
    if (Number.isNaN(lat) || lat < -90 || lat > 90) {
      nextErrors.latitude =
        'Invalid latitude. Enter latitude in decimal degrees. Valid range: -90 <= latitude <= 90. Negative for South, positive for North.'
    }

    const lon = Number.parseFloat(longitude)
    if (Number.isNaN(lon) || lon < -180 || lon > 180) {
      nextErrors.longitude =
        'Invalid longitude. Enter longitude in decimal degrees. Valid range: -180 <= longitude <= 180. Negative for West, positive for East.'
    }

    setFormErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    closeNewProjectDialog()
  }

  return (
    <div className="flex h-full flex-col font-sans">
      <header className="border-b border-app-border">
        <div className="flex h-11 items-center border-b border-app-border px-4">
          <img src={heliosLogo} alt="Helios logo" className="h-5 w-auto" />
        </div>

        <div className="flex h-11 items-center justify-between px-3">
          <MenuBar
            items={TOOLBAR_ITEMS}
            openMenu={openMenu}
            onToggle={setOpenMenu}
            onItemSelect={(menuItem) => {
              if (menuItem === 'New Project') {
                openNewProjectDialog()
                return
              }

              setOpenMenu(null)
            }}
          />

          <SearchBar
            ariaLabel="Search projects"
            icon={searchIcon}
            value={searchText}
            placeholder="Search..."
            onChange={setSearchText}
          />
        </div>
      </header>

      <div className="flex flex-1">
        <Sidebar items={SIDEBAR_ITEMS} onSelect={openNewProjectDialog} />

        <main className="flex-1 p-6">
          <ProjectsTable
            projects={SAVED_PROJECTS}
            emptyIcon={searchIcon}
            onCreateNew={openNewProjectDialog}
          />
        </main>
      </div>

      <NewProjectDialog
        isOpen={showNewProjectDialog}
        projectName={projectName}
        latitude={latitude}
        longitude={longitude}
        formErrors={formErrors}
        hoveredHelp={hoveredHelp}
        onClose={closeNewProjectDialog}
        onCreate={validateAndCreateProject}
        onFieldChange={(field, value) => {
          if (field === 'projectName') setProjectName(value)
          if (field === 'latitude') setLatitude(value)
          if (field === 'longitude') setLongitude(value)

          setFormErrors((prev) => ({ ...prev, [field]: undefined }))
        }}
        onHelpChange={setHoveredHelp}
      />
    </div>
  )
}

export default HomePage
