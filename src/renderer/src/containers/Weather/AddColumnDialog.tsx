import Dialog from '@renderer/components/Dialog'
import FormField from '@renderer/components/FormField'
import type { FormFieldOption } from '@renderer/components/FormField'
import { Spinner } from '@renderer/components/LoadingScreen/Spinner'
import { addColumnRequested } from 'containers/ProjectScreen/actions'
import { useFormik } from 'formik'
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import messages from './messages'
import {
  selectActiveProjectId,
  selectActiveScenarioId,
  selectAllDataTypes
} from './selectors'

export interface AddColumnValues {
  parameterName: string
  // Stored as string because <select> values are strings; "" === unselected.
  // Resolved to numeric ids (or null) at submit time.
  dataTypeId: string
  unitId: string
  defaultValue: string
}

const INITIAL_VALUES: AddColumnValues = {
  parameterName: '',
  dataTypeId: '',
  unitId: '',
  defaultValue: ''
}

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
  const dataTypes = useSelector(selectAllDataTypes)

  const dataTypeOptions: FormFieldOption[] = React.useMemo(
    () => dataTypes.map((dt) => ({ value: String(dt.id), label: dt.data_type })),
    [dataTypes]
  )

  const formik = useFormik<AddColumnValues>({
    initialValues: INITIAL_VALUES,
    validateOnChange: true,
    validateOnBlur: true,
    validate: (values) => {
      const errors: Partial<Record<keyof AddColumnValues, string>> = {}

      const trimmedName = values.parameterName.trim()
      if (!trimmedName) {
        errors.parameterName = 'Column name is required.'
      } else if (trimmedName.length > 50) {
        errors.parameterName = 'Column name must be 50 characters or fewer.'
      }

      return errors
    },
    onSubmit: (values) => {
      if (loading || !projectId || !scenarioId) return
      const dataTypeId = values.dataTypeId === '' ? null : Number(values.dataTypeId)
      const unitId = values.unitId === '' ? null : Number(values.unitId)
      dispatch(
        addColumnRequested(
          projectId,
          scenarioId,
          values.parameterName.trim(),
          dataTypeId,
          unitId,
          values.defaultValue
        )
      )
      formik.resetForm()
      onClose()
    }
  })

  // Unit options follow the selected data type. Picking a different data type
  // clears the unit selection — the user must re-pick (per task constraints,
  // we don't auto-select the base unit).
  const selectedDataType = React.useMemo(
    () =>
      formik.values.dataTypeId === ''
        ? undefined
        : dataTypes.find((dt) => String(dt.id) === formik.values.dataTypeId),
    [dataTypes, formik.values.dataTypeId]
  )

  const unitOptions: FormFieldOption[] = React.useMemo(
    () =>
      (selectedDataType?.units ?? []).map((u) => ({
        value: String(u.id),
        label: u.alias ? `${u.unit} (${u.alias})` : u.unit
      })),
    [selectedDataType]
  )

  const handleDataTypeChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ): void => {
    formik.setFieldValue('dataTypeId', e.target.value)
    formik.setFieldValue('unitId', '')
  }

  const handleClose = (): void => {
    formik.resetForm()
    onClose()
  }

  const m = messages.addColumn

  return (
    <Dialog isOpen={isOpen} title={m.dialogTitle} onClose={handleClose}>
      <FormField
        labelProps={{ label: m.fields.name }}
        inputProps={{
          ...formik.getFieldProps('parameterName'),
          error:
            formik.touched.parameterName || formik.values.parameterName !== ''
              ? (formik.errors.parameterName as string | undefined)
              : undefined
        }}
      />

      <FormField
        labelProps={{ label: m.fields.dataType, optional: true }}
        inputProps={{
          ...formik.getFieldProps('dataTypeId'),
          onChange: handleDataTypeChange,
          placeholder: m.placeholders.dataType,
          options: dataTypeOptions
        }}
      />

      <FormField
        labelProps={{ label: m.fields.unit, optional: true }}
        inputProps={{
          ...formik.getFieldProps('unitId'),
          placeholder:
            formik.values.dataTypeId === ''
              ? m.placeholders.unitDisabled
              : m.placeholders.unit,
          disabled: formik.values.dataTypeId === '',
          options: unitOptions
        }}
      />

      <FormField
        labelProps={{ label: m.fields.value, optional: true }}
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
          {m.cancelButton}
        </button>
        <button
          onClick={() => formik.submitForm()}
          disabled={loading}
          className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-500 disabled:opacity-50"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Spinner />
              {m.submitButtonBusy}
            </span>
          ) : (
            m.submitButton
          )}
        </button>
      </div>
    </Dialog>
  )
}

export default AddColumnDialog
