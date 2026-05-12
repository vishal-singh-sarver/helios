const messages = {
  header: 'Welcome to Electron App',
  description: 'Built with React, Redux, Redux-Saga, Tailwind, and TypeScript',

  createProject: {
    dialogTitle: 'New Project',
    submitButton: 'Create',
    submitButtonBusy: 'Creating…',
    cancelButton: 'Cancel',
    errors: {
      duplicateName: 'A project with this name already exists',
      serverError: 'Failed to create project',
      notFound: 'Project not found'
    }
  },

  deleteProject: {
    dialogTitle: 'Delete',
    heading: (name: string) => `Delete ${name}`,
    body: 'Are you sure you want to delete this? This action cannot be undone.',
    confirmButton: 'Delete',
    cancelButton: 'Cancel'
  },

  renameProject: {
    dialogTitle: 'Rename Project',
    submitButton: 'Save',
    submitButtonBusy: 'Renaming…',
    cancelButton: 'Cancel',
    fields: {
      name: 'New Project Name'
    }
  }
} as const

export default messages
