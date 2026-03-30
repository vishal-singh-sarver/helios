import React from 'react'

export function HomePage(): React.JSX.Element {
  const [openMenu, setOpenMenu] = React.useState<string | null>(null)
  const [searchText, setSearchText] = React.useState('')
  const [showNewProjectDialog, setShowNewProjectDialog] = React.useState(false)

  const toolbarItems: Record<string, string[]> = {
    File: ['New Project', 'Open Project', 'Import Project', 'Exit'],
    Edit: ['Undo', 'Redo', 'Preferences'],
    View: ['Zoom In', 'Zoom Out', 'Reset Layout'],
    Tools: ['Scripting Console', 'Extensions', 'Diagnostics'],
    Help: ['Documentation', 'Shortcuts', 'About Helios']
  }

  const projectActions = ['Home', 'New Project', 'Open project']
  const savedProjects: { name: string; lastUpdated: string; size: string }[] = []

  return (
    <div className="flex h-full flex-col">
      <header className="border-b border-app-border">
        <div className="flex h-11 items-center justify-between border-b border-app-border px-4">
          <div className="text-sm font-semibold tracking-wide text-neutral-100">HELIOS</div>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">
              🔎
            </span>
            <input
              aria-label="Search projects"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search..."
              className="h-8 w-64 rounded border border-app-border bg-dark pl-9 pr-3 text-sm text-neutral-200 outline-none focus:border-neutral-500"
            />
          </div>
        </div>

        <nav aria-label="Top toolbar" className="flex items-center gap-1 px-3 py-2 text-sm text-neutral-300">
          {Object.keys(toolbarItems).map((item) => (
            <div key={item} className="relative">
              <button
                onClick={() => setOpenMenu((prev) => (prev === item ? null : item))}
                className="rounded px-2 py-1 hover:bg-panel hover:text-neutral-100"
              >
                {item}
              </button>
              {openMenu === item && (
                <div className="absolute left-0 top-9 z-20 min-w-44 rounded border border-app-border bg-[#181a1f] py-1 shadow-lg">
                  {toolbarItems[item].map((menuItem) => (
                    <button
                      key={menuItem}
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
      </header>

      <div className="flex min-h-0 flex-1">
        <aside className="w-64 border-r border-app-border p-4">
          <nav aria-label="Project actions" className="flex flex-col gap-3">
            {projectActions.map((item, index) => (
              <button
                key={item}
                onClick={() => {
                  if (item === 'New Project') {
                    setShowNewProjectDialog(true)
                  }
                }}
                className={[
                  'rounded px-3 py-2 text-left text-sm transition-colors',
                  index === 0
                    ? 'bg-panel text-neutral-100'
                    : 'text-neutral-300 hover:bg-panel hover:text-neutral-100'
                ].join(' ')}
              >
                {item}
              </button>
            ))}
          </nav>
        </aside>

        <main className="min-w-0 flex-1 p-6">
          <h1 className="mb-6 text-3xl font-semibold text-neutral-100">Recent Projects</h1>

          <div className="overflow-hidden rounded border border-app-border bg-panel/20">
            <div className="grid grid-cols-[2fr_2fr_1fr] border-b border-app-border px-4 py-2 text-sm text-neutral-300">
              <span>Name ↑↓</span>
              <span>Last Updated ↑↓</span>
              <span>Size ↑↓</span>
            </div>

            {savedProjects.length === 0 ? (
              <div className="flex h-[440px] flex-col items-center justify-center gap-3">
                <div className="rounded border border-app-border p-2 text-lg text-neutral-300">🔎</div>
                <p className="text-3xl font-semibold text-neutral-100">No Projects Found</p>
                <p className="text-lg text-neutral-400">No Projects Found. Please add a new Project.</p>
                <button
                  onClick={() => setShowNewProjectDialog(true)}
                  className="rounded bg-blue-600 px-4 py-1.5 text-lg text-white hover:bg-blue-500"
                >
                  + Add New Project
                </button>
              </div>
            ) : (
              <div className="max-h-[520px] overflow-y-auto">
                {savedProjects.map((project) => (
                  <div
                    key={project.name}
                    className="grid grid-cols-[2fr_2fr_1fr] items-center border-b border-app-border/80 px-4 py-3 text-sm last:border-b-0"
                  >
                    <span className="text-neutral-100">{project.name}</span>
                    <span className="text-neutral-400">{project.lastUpdated}</span>
                    <span className="text-neutral-300">{project.size}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {showNewProjectDialog && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/45">
          <section
            role="dialog"
            aria-modal="true"
            aria-label="New Project"
            className="w-[430px] overflow-hidden rounded border border-app-border bg-[#1f2126]"
          >
            <header className="flex items-center justify-between bg-neutral-200 px-4 py-3 text-neutral-900">
              <h2 className="text-3xl font-semibold">New Project</h2>
              <button
                aria-label="Close New Project dialog"
                onClick={() => setShowNewProjectDialog(false)}
                className="rounded px-2 py-1 text-2xl hover:bg-neutral-300"
              >
                ×
              </button>
            </header>

            <div className="space-y-4 p-4">
              <label className="block text-lg text-neutral-200">
                Project Name<span className="text-red-400">*</span>
                <input
                  placeholder="Enter"
                  className="mt-1 block h-10 w-full rounded border border-app-border bg-dark px-3 text-lg text-neutral-200 outline-none focus:border-neutral-500"
                />
              </label>

              <label className="block text-lg text-neutral-200">
                Latitude<span className="text-red-400">*</span>
                <input
                  placeholder="Enter"
                  className="mt-1 block h-10 w-full rounded border border-app-border bg-dark px-3 text-lg text-neutral-200 outline-none focus:border-neutral-500"
                />
              </label>

              <label className="block text-lg text-neutral-200">
                Longitude<span className="text-red-400">*</span>
                <input
                  placeholder="Enter"
                  className="mt-1 block h-10 w-full rounded border border-app-border bg-dark px-3 text-lg text-neutral-200 outline-none focus:border-neutral-500"
                />
              </label>

              <div className="flex justify-end gap-3 pt-1">
                <button
                  onClick={() => setShowNewProjectDialog(false)}
                  className="rounded bg-neutral-200 px-4 py-1.5 text-lg text-neutral-900 hover:bg-neutral-100"
                >
                  Cancel
                </button>
                <button className="rounded bg-blue-600 px-4 py-1.5 text-lg text-white hover:bg-blue-500">
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
