import React from 'react'
import heliosLogo from '@renderer/assets/Helios_logo.svg'
import homeIcon from '@renderer/assets/home.svg'
import newProjectIcon from '@renderer/assets/new_project.svg'
import openProjectIcon from '@renderer/assets/open_project.svg'
import searchIcon from '@renderer/assets/search.svg'
import MenuBar from '@renderer/components/MenuBar'
import NewProjectDialog from '@renderer/components/NewProjectDialog'
import ProjectsTable from '@renderer/components/ProjectsTable'
import SearchBar from '@renderer/components/SearchBar'
import Sidebar from '@renderer/components/Sidebar'
import { useFormik } from 'formik'

type ToolbarMap = Record<string, string[]>

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

const SAVED_PROJECTS: ProjectRecord[] = [
  { name: 'Coastal Survey Alpha', lastUpdated: '2026-03-29 09:15', size: '128.4 MB' },
  { name: 'Delta Wind Farm', lastUpdated: '2026-03-27 14:42', size: '86.1 MB' },
  { name: 'Northern Grid Scan', lastUpdated: '2026-03-24 18:05', size: '214.9 MB' },
  { name: 'River Basin Mapping', lastUpdated: '2026-03-20 11:30', size: '97.6 MB' },
  { name: 'Urban Heat Island Study', lastUpdated: '2026-03-16 16:50', size: '142.3 MB' }
]

export function HomePage(): React.JSX.Element {
  const [openMenu, setOpenMenu] = React.useState<string | null>(null)
  const [searchText, setSearchText] = React.useState('')
  const [showNewProjectDialog, setShowNewProjectDialog] = React.useState(false)

  const formik = useFormik({
    initialValues: {
      projectName: '',
      latitude: '',
      longitude: ''
    },
    validateOnChange: true,
    validateOnBlur: true,
    validate: (values) => {
      const errors: { projectName?: string; latitude?: string; longitude?: string } = {}

      if (!values.projectName.trim()) {
        errors.projectName = 'Project name is required.'
      } else if (values.projectName.length > 30) {
        errors.projectName = 'Project name must be 30 characters or fewer.'
      }

      if (values.latitude !== '') {
        const lat = Number.parseFloat(values.latitude)
        if (Number.isNaN(lat) || lat < -90 || lat > 90) {
          errors.latitude =
            'Invalid latitude. Enter latitude in decimal degrees. Valid range: -90 <= latitude <= 90. Negative for South, positive for North.'
        }
      }

      if (values.longitude !== '') {
        const lon = Number.parseFloat(values.longitude)
        if (Number.isNaN(lon) || lon < -180 || lon > 180) {
          errors.longitude =
            'Invalid longitude. Enter longitude in decimal degrees. Valid range: -180 <= longitude <= 180. Negative for West, positive for East.'
        }
      }

      return errors
    },
    onSubmit: (values, { resetForm }) => {
    
             if (!values.projectName || !values.latitude || !values.longitude) {
        formik.setErrors({
          ...(!values.projectName ? { projectName: 'Project name is required.' } : {}),
          ...(!values.latitude ? { latitude: 'Latitude is required.' } : {}),
          ...(!values.longitude ? { longitude: 'Longitude is required.' } : {})
        })
        return
      }

      resetForm()
      setShowNewProjectDialog(false)
    }
  })

  const openNewProjectDialog = (): void => {
    setOpenMenu(null)
    formik.resetForm()
    setShowNewProjectDialog(true)
  }

  const closeNewProjectDialog = (): void => {
    formik.resetForm()
    setShowNewProjectDialog(false)
  }

  const filteredProjects = SAVED_PROJECTS.filter((project) =>
    [project.name, project.lastUpdated, project.size].some((value) =>
      value.toLowerCase().includes(searchText.trim().toLowerCase())
    )
  )

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
            projects={filteredProjects}
            emptyIcon={searchIcon}
            onCreateNew={openNewProjectDialog}
          />
        </main>
      </div>

      <NewProjectDialog
        isOpen={showNewProjectDialog}
        formik={formik}
        onClose={closeNewProjectDialog}
      />
    </div>
  )
}

export default HomePage