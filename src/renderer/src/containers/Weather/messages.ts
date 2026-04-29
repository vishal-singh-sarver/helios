const messages = {
  header: 'This is the Weather container!',
  importTriggerButton: 'Import Weather Data',

  addColumn: {
    dialogTitle: 'Add Column',
    submitButton: 'Add',
    submitButtonBusy: 'Adding…',
    cancelButton: 'Cancel',
    fields: {
      name: 'Column Name',
      dataType: 'Data Type',
      unit: 'Unit Type',
      value: 'Enter Value'
    },
    placeholders: {
      dataType: 'Select a data type',
      unit: 'Select a unit',
      unitDisabled: 'Pick a data type first'
    },
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
