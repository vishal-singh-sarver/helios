import React from 'react'
import EmptyState from '../EmptyState'

interface ProjectRecord {
  name: string
  lastUpdated: string
  size: string
}

interface ProjectsTableProps {
  projects: ProjectRecord[]
  emptyIcon: string
  onCreateNew: () => void
}

function ProjectsTable({
  emptyIcon,
  onCreateNew
}: ProjectsTableProps): React.JSX.Element {
  
  const projects = [
    // {
    //   name: 'Project Alpha',
    //   lastUpdated: '2024-06-01',
    //   size: '150 MB'
    // },
    // {
    //   name: 'Project Beta',
    //   lastUpdated: '2024-05-28',
    //   size: '200 MB'
    // }
  ]

  return (
    <>
      <h1 className="mb-6 text-lg font-medium text-white">Recent Projects</h1>

      <div className="overflow-hidden rounded border border-app-border bg-panel/20">
        <div className="grid grid-cols-[2fr_2fr_1fr] border-b border-app-border px-4 py-2 text-sm text-neutral-400">
          <span>Name ↑↓</span>
          <span>Last Updated ↑↓</span>
          <span>Size ↑↓</span>
        </div>

        {projects.length === 0 ? (
          <EmptyState icon={emptyIcon} onCreateNew={onCreateNew} />
        ) : (
          <div className="max-h-[520px] overflow-y-auto">
            {projects.map((project) => (
              <button
                key={project.name}
                className="grid w-full grid-cols-[2fr_2fr_1fr] items-center border-b border-app-border/80 px-4 py-3 text-left text-sm"
              >
                <span className="text-white">{project.name}</span>
                <span className="text-neutral-400">{project.lastUpdated}</span>
                <span className="text-neutral-300">{project.size}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  )
}

export default ProjectsTable
