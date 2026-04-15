import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import homeIcon from '@renderer/assets/home.svg'
import newProjectIcon from '@renderer/assets/new_project.svg'
import openProjectIcon from '@renderer/assets/open_project.svg'
import searchIcon from '@renderer/assets/search.svg'
import Dialog from '@renderer/components/Dialog'
import FormField from '@renderer/components/FormField'
import Header from '@renderer/components/Header'
import { Spinner } from '@renderer/components/LoadingScreen/Spinner'
import MenuBar from '@renderer/components/MenuBar'
import ProjectsTable from '@renderer/components/ProjectsTable'
import SearchBar from '@renderer/components/SearchBar'
import Sidebar from '@renderer/components/Sidebar'
import { useFormik } from 'formik'
import { useInjectReducer } from 'utils/injectReducer'
import { useInjectSaga } from 'utils/injectSaga'
import {
  FormValues,
  INITIAL_VALUES,
  SidebarItem,
  TOOLBAR_ITEMS
} from '../../types/project'
import { createProject, fetchRecentProjects, resetCreateProject } from './actions'
import messages from './messages'
import homePageReducer from './reducer'
import homePageSaga from './saga'
import {
  selectCreateProjectError,
  selectCreateProjectLoading,
  selectCreateProjectSuccess,
  selectRecentProjectsData
} from './selectors'

export function HomePage(): React.JSX.Element {
  useInjectReducer({ key: 'homePage', reducer: homePageReducer })
  useInjectSaga({ key: 'homePage', saga: homePageSaga })

  const dispatch = useDispatch()
  const createLoading = useSelector(selectCreateProjectLoading)
  const createError   = useSelector(selectCreateProjectError)
  const createSuccess = useSelector(selectCreateProjectSuccess)
  const recentProjects = useSelector(selectRecentProjectsData)

  // Fetch the recent-projects list on mount. Re-fetch after a successful
  // create is triggered from the saga (see createProjectWorker), so the
  // component only needs to kick off the initial load here.
  React.useEffect(() => {
    dispatch(fetchRecentProjects())
  }, [dispatch])

  const [searchText, setSearchText] = React.useState('')
  const [showNewProjectDialog, setShowNewProjectDialog] = React.useState(false)
  const [activeSidebar, setActiveSidebar] = React.useState('Home')


  const formik = useFormik<FormValues>({
    initialValues: INITIAL_VALUES,
    validateOnChange: true,
    validateOnBlur: true,
    validate: (values) => {
      const errors: Partial<Record<keyof FormValues, string>> = {}

      const trimmedName = values.projectName.trim()
      if (!trimmedName) {
        errors.projectName = 'Project name is required.'
      } else if (trimmedName.length > 30) {
        errors.projectName = 'Project name must be 30 characters or fewer.'
      }

      if (values.latitude === '') {
        errors.latitude = 'Latitude is required.'
      } else {
        const lat = Number.parseFloat(values.latitude)
        if (Number.isNaN(lat) || lat < -90 || lat > 90) {
          errors.latitude =
            'Invalid latitude. Enter latitude in decimal degrees. Valid range: -90 <= latitude <= 90. Negative for South, positive for North.'
        }
      }

      if (values.longitude === '') {
        errors.longitude = 'Longitude is required.'
      } else {
        const lon = Number.parseFloat(values.longitude)
        if (Number.isNaN(lon) || lon < -180 || lon > 180) {
          errors.longitude =
            'Invalid longitude. Enter longitude in decimal degrees. Valid range: -180 <= longitude <= 180. Negative for West, positive for East.'
        }
      }

      return errors
    },
    onSubmit: (values) => {
      if (createLoading) return
      dispatch(
        createProject({
          name: values.projectName,
          latitude: Number.parseFloat(values.latitude),
          longitude: Number.parseFloat(values.longitude)
        })
      )
    }
  })

  const resetFormRef = React.useRef(formik.resetForm)
  React.useEffect(() => {
    resetFormRef.current = formik.resetForm
  })

  // Close the dialog and clear the slice once the backend confirms success.
  React.useEffect(() => {
    if (createSuccess) {
      resetFormRef.current()
      setShowNewProjectDialog(false)
      dispatch(resetCreateProject())
    }
  }, [createSuccess, dispatch])

  const openNewProjectDialog = (): void => {
    formik.resetForm()
    dispatch(resetCreateProject())
    setShowNewProjectDialog(true)
  }

  const closeNewProjectDialog = (): void => {
    formik.resetForm()
    dispatch(resetCreateProject())
    setShowNewProjectDialog(false)
  }
  const sidebarItems: SidebarItem[] = [
    { label: 'Home', icon: homeIcon, onAction: () => {} },
    { label: 'New Project', icon: newProjectIcon, onAction: openNewProjectDialog },
    {
      label: 'Open project',
      icon: openProjectIcon,
      onAction: () => {}
    }
  ]
  // useDeferredValue keeps the input responsive while the filter re-runs.
  // useMemo ensures we only re-filter when the list or the deferred query
  // actually change, not on every unrelated render.
  const deferredSearch = React.useDeferredValue(searchText)
  const filteredProjects = React.useMemo(() => {
    const needle = deferredSearch.trim().toLowerCase()
    if (!needle) return recentProjects
    return recentProjects.filter(
      (project) =>
        project.name.toLowerCase().includes(needle) ||
        project.last_updated.toLowerCase().includes(needle)
    )
  }, [recentProjects, deferredSearch])

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
          items={sidebarItems}
          activeLabel={activeSidebar}
          onSelect={(item) => {
            setActiveSidebar(item.label)
            item.onAction()
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

      <Dialog isOpen={showNewProjectDialog} title={messages.createProject.dialogTitle} onClose={closeNewProjectDialog}>
        <FormField
          labelProps={{
            label: 'Project Name',
            helpText: 'Enter a project name to identify your work.',
            helpAriaLabel: 'Show project name help'
          }}
          inputProps={{
            ...formik.getFieldProps('projectName'),
            error:
              formik.touched.projectName || formik.values.projectName !== ''
                ? (formik.errors.projectName as string | undefined)
                : undefined
          }}
        />
        <FormField
          labelProps={{
            label: 'Latitude',
            helpText:
              'Enter latitude in decimal degrees. Valid range: -90 <= latitude <= 90. Negative for South, positive for North.',
            helpAriaLabel: 'Show latitude help'
          }}
          inputProps={{
            ...formik.getFieldProps('latitude'),
            error:
              formik.touched.latitude || formik.values.latitude !== ''
                ? (formik.errors.latitude as string | undefined)
                : undefined,
            type: 'number'
          }}
        />
        <FormField
          labelProps={{
            label: 'Longitude',
            helpText:
              'Enter longitude in decimal degrees. Valid range: -180 <= longitude <= 180. Negative for West, positive for East.',
            helpAriaLabel: 'Show longitude help'
          }}
          inputProps={{
            ...formik.getFieldProps('longitude'),
            error:
              formik.touched.longitude || formik.values.longitude !== ''
                ? (formik.errors.longitude as string | undefined)
                : undefined,
            type: 'number'
          }}
        />

        {createError && (
          <p role="alert" className="pt-2 text-sm text-red-600">
            {createError}
          </p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={closeNewProjectDialog}
            disabled={createLoading}
            className="rounded bg-neutral-200 px-3 py-1 text-sm text-black hover:bg-neutral-100 disabled:opacity-50"
          >
            {messages.createProject.cancelButton}
          </button>
          <button
            onClick={() => formik.submitForm()}
            disabled={createLoading}
            className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-500 disabled:opacity-50"
          >
            {createLoading ? (
              <span className="flex items-center gap-2">
                <Spinner />
                {messages.createProject.submitButtonBusy}
              </span>
            ) : (
              messages.createProject.submitButton
            )}
          </button>
        </div>
      </Dialog>
    </div>
  )
}

export default HomePage
