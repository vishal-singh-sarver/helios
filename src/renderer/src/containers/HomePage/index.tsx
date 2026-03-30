import React from 'react'
import heliosLogo from '@renderer/assets/Helios_logo.svg'
import homeIcon from '@renderer/assets/home.svg'
import newProjectIcon from '@renderer/assets/new_project.svg'
import openProjectIcon from '@renderer/assets/open_project.svg'
import searchIcon from '@renderer/assets/search.svg'

type ToolbarMap = Record<string, string[]>

const TOOLBAR_ITEMS: ToolbarMap = {
  File: ['New Project', 'Open Project', 'Import Project', 'Exit'],
  Edit: ['Undo', 'Redo', 'Preferences'],
  View: ['Zoom In', 'Zoom Out', 'Reset Layout'],
  Tools: ['Scripting Console', 'Extensions', 'Diagnostics'],
  Help: ['Documentation', 'Shortcuts', 'About Helios']
}

const SIDEBAR_ITEMS = [
  { label: 'Home', icon: homeIcon },
  { label: 'New Project', icon: newProjectIcon },
  { label: 'Open project', icon: openProjectIcon }
]

export function HomePage(): React.JSX.Element {
  const [openMenu, setOpenMenu] = React.useState<string | null>(null)
  const [searchText, setSearchText] = React.useState('')
  const [showNewProjectDialog, setShowNewProjectDialog] = React.useState(false)
  const [projectName, setProjectName] = React.useState('')
  const [latitude, setLatitude] = React.useState('')
  const [longitude, setLongitude] = React.useState('')
  const [hoveredHelp, setHoveredHelp] = React.useState<null | 'projectName' | 'latitude' | 'longitude'>(null)
  const [formErrors, setFormErrors] = React.useState<{
    projectName?: string
    latitude?: string
    longitude?: string
  }>({})
  const toolbarRef = React.useRef<HTMLDivElement | null>(null)

  const savedProjects: { name: string; lastUpdated: string; size: string }[] = []

  React.useEffect(() => {
    const onPointerDown = (event: MouseEvent): void => {
      if (!openMenu) return
      if (toolbarRef.current && !toolbarRef.current.contains(event.target as Node)) {
        setOpenMenu(null)
      }
    }

    window.addEventListener('mousedown', onPointerDown)
    return () => window.removeEventListener('mousedown', onPointerDown)
  }, [openMenu])

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
      {/* HEADER */}
      <header className="border-b border-app-border">
        <div className="flex h-11 items-center border-b border-app-border px-4">
          <img src={heliosLogo} alt="Helios logo" className="h-5 w-auto" />
        </div>

        <div
          ref={toolbarRef}
          className="flex h-11 items-center justify-between px-3"
        >
          <nav className="flex items-center gap-2 text-sm font-medium text-neutral-300">
            {Object.keys(TOOLBAR_ITEMS).map((item) => (
              <div key={item} className="relative">
                <button
                  onClick={() => setOpenMenu((prev) => (prev === item ? null : item))}
                  className="rounded px-2 py-1 hover:bg-panel hover:text-white"
                >
                  {item}
                </button>

                {openMenu === item && (
                  <div className="absolute top-9 left-0 z-20 min-w-44 rounded border border-app-border bg-[#181a1f] py-1 shadow-lg">
                    {TOOLBAR_ITEMS[item].map((menuItem) => (
                      <button
                        key={menuItem}
                        onClick={() => {
                          if (menuItem === 'New Project') openNewProjectDialog()
                          else setOpenMenu(null)
                        }}
                        className="block w-full px-3 py-1.5 text-left text-sm text-neutral-200 hover:bg-app-border"
                      >
                        {menuItem}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* SEARCH */}
          <div className="relative w-56">
            <img
              src={searchIcon}
              className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 opacity-70"
            />
            <input
              aria-label="Search projects"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search..."
              className="h-8 w-full rounded border border-app-border bg-dark pl-8 pr-3 text-sm text-neutral-200 outline-none focus:border-neutral-500"
            />
          </div>
        </div>
      </header>

      {/* BODY */}
      <div className="flex flex-1">
        {/* SIDEBAR */}
        <aside className="w-56 border-r border-app-border p-4">
          <nav className="flex flex-col gap-2">
            {SIDEBAR_ITEMS.map((item, index) => (
              <button
                key={item.label}
                aria-label={`Sidebar ${item.label}`}
                onClick={() => {
                  if (item.label === 'New Project') openNewProjectDialog()
                }}
                className={`flex items-center gap-3 rounded px-3 py-2 text-sm font-medium transition
                ${
                  index === 0
                    ? 'bg-panel text-white'
                    : 'text-neutral-300 hover:bg-panel hover:text-white hover:ring-1 hover:ring-app-border/80'
                }`}
              >
                <img src={item.icon} className="h-5 w-5 opacity-80" />
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* MAIN */}
        <main className="flex-1 p-6">
          <h1 className="mb-6 text-lg font-medium text-white">
            Recent Projects
          </h1>

          <div className="overflow-hidden rounded border border-app-border bg-panel/20">
            {/* TABLE HEADER */}
            <div className="grid grid-cols-[2fr_2fr_1fr] border-b border-app-border px-4 py-2 text-sm text-neutral-400">
              <span>Name ↑↓</span>
              <span>Last Updated ↑↓</span>
              <span>Size ↑↓</span>
            </div>

            {/* EMPTY STATE */}
            {savedProjects.length === 0 ? (
              <div className="flex h-[440px] flex-col items-center justify-center gap-3">
                <img src={searchIcon} className="h-6 w-6 opacity-80" />

                <p className="text-md font-medium text-white">
                  No Projects Found
                </p>

                <p className="text-sm text-neutral-400">
                  No Projects Found. Please add a new Project.
                </p>

                <button
                  onClick={openNewProjectDialog}
                  className="rounded bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-500"
                >
                  + Add New Project
                </button>
              </div>
            ) : (
              <div className="max-h-[520px] overflow-y-auto">
                {savedProjects.map((project) => (
                  <button
                    key={project.name}
                    className="grid w-full grid-cols-[2fr_2fr_1fr] items-center border-b border-app-border/80 px-4 py-3 text-sm text-left"
                  >
                    <span className="text-white">{project.name}</span>
                    <span className="text-neutral-400">{project.lastUpdated}</span>
                    <span className="text-neutral-300">{project.size}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* MODAL */}
      {showNewProjectDialog && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/50">
          <section
            role="dialog"
            aria-modal="true"
            aria-label="New Project"
            className="w-[420px] rounded border border-app-border bg-[#1f2126]"
          >
            {/* HEADER */}
            <header className="flex items-center justify-between bg-neutral-200 px-4 py-2">
              <h2 className="text-md font-medium text-black">
                New Project
              </h2>

              <button
                onClick={closeNewProjectDialog}
                className="px-2 py-1 text-sm text-black hover:bg-neutral-300"
              >
                ×
              </button>
            </header>

            {/* BODY */}
            <div className="space-y-3 p-4">
              <label className="block text-sm text-neutral-300">
                <span className="flex items-center gap-1">
                  Project Name<span className="text-red-400">*</span>
                  <span className="relative inline-flex">
                    <button
                      type="button"
                      aria-label="Show project name help"
                      onMouseEnter={() => setHoveredHelp('projectName')}
                      onMouseLeave={() => setHoveredHelp(null)}
                      onFocus={() => setHoveredHelp('projectName')}
                      onBlur={() => setHoveredHelp(null)}
                      className="flex h-5 w-5 items-center justify-center rounded-full border border-neutral-300 text-xs font-semibold text-white"
                    >
                      ?
                    </button>
                    {hoveredHelp === 'projectName' && (
                      <span
                        role="tooltip"
                        className="pointer-events-none absolute left-full top-1/2 z-10 ml-2 w-64 -translate-y-1/2 rounded border border-app-border bg-[#2b2d33] px-2 py-1 text-[11px] leading-4 text-neutral-200"
                      >
                        Enter a project name to identify your work.
                      </span>
                    )}
                  </span>
                </span>
                <input
                  placeholder="Enter"
                  value={projectName}
                  onChange={(e) => {
                    setProjectName(e.target.value)
                    if (formErrors.projectName) {
                      setFormErrors((prev) => ({ ...prev, projectName: undefined }))
                    }
                  }}
                  className="mt-1 h-9 w-full rounded border border-app-border bg-dark px-3 text-sm text-white outline-none focus:border-neutral-500"
                />
                {formErrors.projectName && (
                  <p className="mt-1 text-xs text-red-400">{formErrors.projectName}</p>
                )}
              </label>

              <label className="block text-sm text-neutral-300">
                <span className="flex items-center gap-1">
                  Latitude<span className="text-red-400">*</span>
                  <span className="relative inline-flex">
                    <button
                      type="button"
                      aria-label="Show latitude help"
                      onMouseEnter={() => setHoveredHelp('latitude')}
                      onMouseLeave={() => setHoveredHelp(null)}
                      onFocus={() => setHoveredHelp('latitude')}
                      onBlur={() => setHoveredHelp(null)}
                      className="flex h-5 w-5 items-center justify-center rounded-full border border-neutral-300 text-xs font-semibold text-white"
                    >
                      ?
                    </button>
                    {hoveredHelp === 'latitude' && (
                      <span
                        role="tooltip"
                        className="pointer-events-none absolute left-full top-1/2 z-10 ml-2 w-64 -translate-y-1/2 rounded border border-app-border bg-[#2b2d33] px-2 py-1 text-[11px] leading-4 text-neutral-200"
                      >
                        Enter latitude in decimal degrees. Valid range: -90 {'<='} latitude {'<='}{' '}
                        90. Negative for South, positive for North.
                      </span>
                    )}
                  </span>
                </span>
                <input
                  placeholder="Enter"
                  value={latitude}
                  onChange={(e) => {
                    setLatitude(e.target.value)
                    if (formErrors.latitude) {
                      setFormErrors((prev) => ({ ...prev, latitude: undefined }))
                    }
                  }}
                  className="mt-1 h-9 w-full rounded border border-app-border bg-dark px-3 text-sm text-white outline-none focus:border-neutral-500"
                />
                {formErrors.latitude && (
                  <p className="mt-1 text-xs text-red-400">{formErrors.latitude}</p>
                )}
              </label>

              <label className="block text-sm text-neutral-300">
                <span className="flex items-center gap-1">
                  Longitude<span className="text-red-400">*</span>
                  <span className="relative inline-flex">
                    <button
                      type="button"
                      aria-label="Show longitude help"
                      onMouseEnter={() => setHoveredHelp('longitude')}
                      onMouseLeave={() => setHoveredHelp(null)}
                      onFocus={() => setHoveredHelp('longitude')}
                      onBlur={() => setHoveredHelp(null)}
                      className="flex h-5 w-5 items-center justify-center rounded-full border border-neutral-300 text-xs font-semibold text-white"
                    >
                      ?
                    </button>
                    {hoveredHelp === 'longitude' && (
                      <span
                        role="tooltip"
                        className="pointer-events-none absolute left-full top-1/2 z-10 ml-2 w-64 -translate-y-1/2 rounded border border-app-border bg-[#2b2d33] px-2 py-1 text-[11px] leading-4 text-neutral-200"
                      >
                        Enter longitude in decimal degrees. Valid range: -180 {'<='} longitude{' '}
                        {'<='} 180. Negative for West, positive for East.
                      </span>
                    )}
                  </span>
                </span>
                <input
                  placeholder="Enter"
                  value={longitude}
                  onChange={(e) => {
                    setLongitude(e.target.value)
                    if (formErrors.longitude) {
                      setFormErrors((prev) => ({ ...prev, longitude: undefined }))
                    }
                  }}
                  className="mt-1 h-9 w-full rounded border border-app-border bg-dark px-3 text-sm text-white outline-none focus:border-neutral-500"
                />
                {formErrors.longitude && (
                  <p className="mt-1 text-xs text-red-400">{formErrors.longitude}</p>
                )}
              </label>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={closeNewProjectDialog}
                  className="rounded bg-neutral-200 px-3 py-1 text-sm text-black hover:bg-neutral-100"
                >
                  Cancel
                </button>

                <button
                  onClick={validateAndCreateProject}
                  className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-500"
                >
                  Create
                </button>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}

export default HomePage
