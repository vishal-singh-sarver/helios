import Dialog from '@renderer/components/Dialog'
import FormField from '@renderer/components/FormField'
import type { FormFieldOption } from '@renderer/components/FormField'
import { Spinner } from '@renderer/components/LoadingScreen/Spinner'
import { addColumnRequested } from 'containers/ProjectScreen/actions'
import { useFormik } from 'formik'
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import messages from './messages'
import { selectActiveProjectId, selectActiveScenarioId } from './selectors'

export interface AddColumnValues {
  parameterName: string
  dataType: string
  defaultValue: string
}

const INITIAL_VALUES: AddColumnValues = {
  parameterName: '',
  dataType: '',
  defaultValue: ''
}

export const DATA_TYPE_OPTIONS: readonly FormFieldOption[] = [
  { value: 'direct_normal_radiation', label: 'Direct Normal Radiation' },
  { value: 'diffuse_horizontal_radiation', label: 'Diffuse Horizontal Radiation' },
  { value: 'air_temperature', label: 'Air temperature' },
  { value: 'air_pressure', label: 'Air pressure' },
  { value: 'wind_speed', label: 'Wind speed' },
  { value: 'air_humidity', label: 'Air humidity' },
  { value: 'turbidity', label: 'Turbidity' },
  { value: 'beta_soil', label: 'Beta_soil (Soil moisture factor)' },
  { value: 'air_co2', label: 'Air_CO2' }
]

interface AddColumnDialogProps {
  isOpen: boolean
  onClose: () => void
}

function AddColumnDialog({ isOpen, onClose }: AddColumnDialogProps): React.JSX.Element {
  const [loading] = React.useState(false)
  const [error] = React.useState<string | null>(null)

  const dispatch = useDispatch()
  const projectId = useSelector(selectActiveProjectId)
  const scenarioId = useSelector(selectActiveScenarioId)

  const formik = useFormik<AddColumnValues>({
    initialValues: INITIAL_VALUES,
    validateOnChange: true,
    validateOnBlur: true,
    validate: (values) => {
      const errors: Partial<Record<keyof AddColumnValues, string>> = {}

      const trimmedName = values.parameterName.trim()
      if (!trimmedName) {
        errors.parameterName = 'Parameter name is required.'
      } else if (trimmedName.length > 50) {
        errors.parameterName = 'Parameter name must be 50 characters or fewer.'
      }

      return errors
    },
    onSubmit: (values) => {
      if (loading || !projectId || !scenarioId) return
      // dataType / unit ids are still slugs in this dialog — the next PR
      // replaces the dropdowns with catalog-driven (numeric id) pickers.
      // Coerce to 0 for now so the action signature compiles; the saga is
      // still calling the mock add endpoint, so the value isn't load-bearing.
      dispatch(
        addColumnRequested(
          projectId,
          scenarioId,
          values.parameterName.trim(),
          0,
          0,
          values.defaultValue
        )
      )
      formik.resetForm()
      onClose()
    }
  })

  const handleClose = (): void => {
    formik.resetForm()
    onClose()
  }

  return (
    <Dialog isOpen={isOpen} title={messages.addColumn.dialogTitle} onClose={handleClose}>
      <FormField
        labelProps={{ label: 'Parameter Name' }}
        inputProps={{
          ...formik.getFieldProps('parameterName'),
          error:
            formik.touched.parameterName || formik.values.parameterName !== ''
              ? (formik.errors.parameterName as string | undefined)
              : undefined
        }}
      />
      <FormField
        labelProps={{ label: 'Assigned Data Type', optional: true }}
        inputProps={{
          ...formik.getFieldProps('dataType'),
          placeholder: 'Select a data type',
          options: DATA_TYPE_OPTIONS
        }}
      />
      <FormField
        labelProps={{ label: 'Enter Value', optional: true }}
        inputProps={formik.getFieldProps('defaultValue')}
      />

      {error && (
        <p role="alert" className="pt-2 text-sm text-red-600">
          {error}
        </p>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <button
          onClick={handleClose}
          disabled={loading}
          className="rounded bg-neutral-200 px-3 py-1 text-sm text-black hover:bg-neutral-100 disabled:opacity-50"
        >
          {messages.addColumn.cancelButton}
        </button>
        <button
          onClick={() => formik.submitForm()}
          disabled={loading}
          className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-500 disabled:opacity-50"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Spinner />
              {messages.addColumn.submitButtonBusy}
            </span>
          ) : (
            messages.addColumn.submitButton
          )}
        </button>
      </div>
    </Dialog>
  )
}

export default AddColumnDialog
