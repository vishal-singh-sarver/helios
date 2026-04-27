const messages = {
  header: 'This is the Weather container!',

  addColumn: {
    dialogTitle: 'Add Column',
    submitButton: 'Add',
    submitButtonBusy: 'Adding…',
    cancelButton: 'Cancel',
    errors: {
      duplicateName: 'A column with this name already exists',
      serverError: 'Failed to add column'
    }
  },

  addRows: {
    dialogTitle: 'New Rows',
    submitButton: 'Add',
    submitButtonBusy: 'Adding…',
    cancelButton: 'Cancel',
    errors: {
      serverError: 'Failed to add rows'
    }
  }
} as const

export default messages
