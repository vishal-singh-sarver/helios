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
  }
} as const

export default messages
