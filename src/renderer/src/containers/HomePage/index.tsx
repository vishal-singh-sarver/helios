import React from 'react'
import homeIcon from '@renderer/assets/home.svg'
import newProjectIcon from '@renderer/assets/new_project.svg'
import openProjectIcon from '@renderer/assets/open_project.svg'
import searchIcon from '@renderer/assets/search.svg'
import Dialog from '@renderer/components/Dialog'
import FormField from '@renderer/components/FormField'
import Header from '@renderer/components/Header'
import MenuBar from '@renderer/components/MenuBar'
import ProjectsTable from '@renderer/components/ProjectsTable'
import SearchBar from '@renderer/components/SearchBar'
import Sidebar from '@renderer/components/Sidebar'
import { useFormik } from 'formik'
import { FormValues, INITIAL_VALUES, ProjectRecord, SidebarItem, TOOLBAR_ITEMS } from '../../types/project'

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
  const [searchText, setSearchText] = React.useState('')
  const [showNewProjectDialog, setShowNewProjectDialog] = React.useState(false)
  const [activeSidebar, setActiveSidebar] = React.useState('Home')

  const formik = useFormik<FormValues>({
    initialValues: INITIAL_VALUES, 
    validateOnChange: true,
    validateOnBlur: true,
    validate: (values) => {
      const errors: Partial<Record<keyof FormValues, string>> = {}

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
    onSubmit: (_values, { resetForm }) => {
  

      resetForm()
      setShowNewProjectDialog(false)
    }
  })

  const openNewProjectDialog = (): void => {
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
      <Header>
          <MenuBar
          items={TOOLBAR_ITEMS}
          onItemSelect={(menuItem) => {
            if (menuItem === 'New Project') {
              openNewProjectDialog()
            }
          }}
        />
          <SearchBar
            ariaLabel="Search projects"
            icon={searchIcon}
            value={searchText}
            placeholder="Search..."
            onChange={setSearchText}
          />
      </Header>

      <div className="flex flex-1">
        <Sidebar
          items={SIDEBAR_ITEMS}
          activeLabel={activeSidebar}
          onSelect={(label) => {
            setActiveSidebar(label)
            if (label === 'New Project') openNewProjectDialog()
          }}
        />

        <main className="flex-1 p-6">
          <ProjectsTable
            projects={filteredProjects}
            emptyIcon={searchIcon}
            onCreateNew={openNewProjectDialog}
          />
        </main>
      </div>

      <Dialog isOpen={showNewProjectDialog} title="New Project" onClose={closeNewProjectDialog}>
        <FormField
          labelProps={{
            label: 'Project Name',
            helpText: 'Enter a project name to identify your work.',
            helpAriaLabel: 'Show project name help'
          }}
          inputProps={{
            ...formik.getFieldProps('projectName'),
            error: formik.errors.projectName as string | undefined
          }}
        />
        <FormField
          labelProps={{
            label: 'Latitude',
            helpText: 'Enter latitude in decimal degrees. Valid range: -90 <= latitude <= 90. Negative for South, positive for North.',
            helpAriaLabel: 'Show latitude help'
          }}
          inputProps={{
            ...formik.getFieldProps('latitude'),
            error: formik.errors.latitude as string | undefined,
            type: 'number'
          }}
        />
        <FormField
          labelProps={{
            label: 'Longitude',
            helpText: 'Enter longitude in decimal degrees. Valid range: -180 <= longitude <= 180. Negative for West, positive for East.',
            helpAriaLabel: 'Show longitude help'
          }}
          inputProps={{
            ...formik.getFieldProps('longitude'),
            error: formik.errors.longitude as string | undefined,
            type: 'number'
          }}
        />

        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={closeNewProjectDialog}
            className="rounded bg-neutral-200 px-3 py-1 text-sm text-black hover:bg-neutral-100"
          >
            Cancel
          </button>
          <button
            onClick={() => formik.submitForm()}
            className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-500"
          >
            Create
          </button>
        </div>
      </Dialog>
    </div>
  )
}

export default HomePage