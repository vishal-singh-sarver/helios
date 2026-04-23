import calendarIcon from '@renderer/assets/calendar.svg'
import clockIcon from '@renderer/assets/clock.svg'
import Dialog from '@renderer/components/Dialog'
import FormField from '@renderer/components/FormField'
import { Spinner } from '@renderer/components/LoadingScreen/Spinner'
import TimePicker24 from '@renderer/components/TimePicker24'
import { useFormik } from 'formik'
import React from 'react'
import messages from './messages'

export interface AddRowsValues {
  numberOfRows: string
  startDate: string
  startTime: string
}

const INITIAL_VALUES: AddRowsValues = {
  numberOfRows: '',
  startDate: '',
  startTime: ''
}

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/

const MAX_ROWS = 10_000

const CalendarIcon = (
  <img src={calendarIcon} alt="" aria-hidden="true" className="h-4 w-4" />
)

const ClockIcon = (
  <img src={clockIcon} alt="" aria-hidden="true" className="h-4 w-4" />
)

function openPicker(input: HTMLInputElement | null): void {
  if (!input) return
  if (typeof input.showPicker === 'function') {
    input.showPicker()
  } else {
    input.focus()
    input.click()
  }
}

interface AddRowsDialogProps {
  isOpen: boolean
  onClose: () => void
}

function AddRowsDialog({ isOpen, onClose }: AddRowsDialogProps): React.JSX.Element {
  const [loading] = React.useState(false)
  const [error] = React.useState<string | null>(null)

  const startDateRef = React.useRef<HTMLInputElement>(null)
  const startTimeRef = React.useRef<HTMLInputElement>(null)
  const timePickerContainerRef = React.useRef<HTMLDivElement>(null)
  const [isTimePickerOpen, setIsTimePickerOpen] = React.useState(false)

  React.useEffect(() => {
    if (!isTimePickerOpen) return undefined
    const handleMouseDown = (e: MouseEvent): void => {
      if (
        timePickerContainerRef.current &&
        !timePickerContainerRef.current.contains(e.target as Node)
      ) {
        setIsTimePickerOpen(false)
      }
    }
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') setIsTimePickerOpen(false)
    }
    document.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isTimePickerOpen])

  const formik = useFormik<AddRowsValues>({
    initialValues: INITIAL_VALUES,
    validateOnChange: true,
    validateOnBlur: true,
    validate: (values) => {
      const errors: Partial<Record<keyof AddRowsValues, string>> = {}

      if (values.numberOfRows === '') {
        errors.numberOfRows = 'Number of rows is required.'
      } else {
        const n = Number.parseInt(values.numberOfRows, 10)
        if (Number.isNaN(n) || n <= 0) {
          errors.numberOfRows = 'Number of rows must be a positive integer.'
        } else if (n > MAX_ROWS) {
          errors.numberOfRows = `Number of rows must be ${MAX_ROWS} or fewer.`
        }
      }

      if (!values.startDate) {
        errors.startDate = 'Start date is required.'
      }

      if (!values.startTime) {
        errors.startTime = 'Start time is required.'
      } else if (!TIME_PATTERN.test(values.startTime)) {
        errors.startTime = 'Start time must be in 24-hour format (00:00–23:59).'
      }

      return errors
    },
    onSubmit: () => {
      if (loading) return
      formik.resetForm()
      onClose()
    }
  })

  const handleClose = (): void => {
    formik.resetForm()
    onClose()
  }

  return (
    <Dialog isOpen={isOpen} title={messages.addRows.dialogTitle} onClose={handleClose}>
      <FormField
        labelProps={{ label: 'Number of Rows' }}
        inputProps={{
          ...formik.getFieldProps('numberOfRows'),
          type: 'number',
          error:
            formik.touched.numberOfRows || formik.values.numberOfRows !== ''
              ? (formik.errors.numberOfRows as string | undefined)
              : undefined
        }}
      />
      <FormField
        labelProps={{ label: 'Start Date' }}
        inputProps={{
          ...formik.getFieldProps('startDate'),
          type: 'date',
          placeholder: 'Start Date',
          iconLeft: CalendarIcon,
          inputRef: startDateRef,
          onIconLeftClick: () => openPicker(startDateRef.current),
          error:
            formik.touched.startDate || formik.values.startDate !== ''
              ? (formik.errors.startDate as string | undefined)
              : undefined
        }}
      />
      <div ref={timePickerContainerRef} className="relative">
        <FormField
          labelProps={{ label: 'Start Time' }}
          inputProps={{
            ...formik.getFieldProps('startTime'),
            type: 'text',
            placeholder: 'hh:mm',
            iconLeft: ClockIcon,
            inputRef: startTimeRef,
            onIconLeftClick: () => setIsTimePickerOpen((v) => !v),
            error:
              formik.touched.startTime || formik.values.startTime !== ''
                ? (formik.errors.startTime as string | undefined)
                : undefined
          }}
        />
        {isTimePickerOpen && (
          <TimePicker24
            value={formik.values.startTime}
            onChange={(v) => formik.setFieldValue('startTime', v)}
          />
        )}
      </div>

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
          {messages.addRows.cancelButton}
        </button>
        <button
          onClick={() => formik.submitForm()}
          disabled={loading}
          className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-500 disabled:opacity-50"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Spinner />
              {messages.addRows.submitButtonBusy}
            </span>
          ) : (
            messages.addRows.submitButton
          )}
        </button>
      </div>
    </Dialog>
  )
}

export default AddRowsDialog
