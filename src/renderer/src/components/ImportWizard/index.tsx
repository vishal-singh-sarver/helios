import React, { useCallback, useMemo, useState } from 'react'
import {
  INITIAL_MAPPING,
  parseDelimited,
  parseFile,
  parseRowDateTime,
  type DateFormatKey,
  type DateTimeMapping,
  type DateTimeMode,
  type ImportedDataset,
  type ImportedDatasetColumn,
  type ImportedDatasetRecord,
  type ParseResult
} from 'containers/Weather/parsers'
import { AlertTriangleIcon, ChevronLeftIcon, CloseIcon } from './Icons'
import { GhostBtn, PrimaryBtn, SecondaryBtn } from './primitives'
import Stepper, { STEPS } from './Stepper'
import StepDataPreview from './StepDataPreview'
import StepDateTime from './StepDateTime'
import StepFilePreview from './StepFilePreview'
import StepReview from './StepReview'
import type { DateTimeStats, ImportWizardProps } from './types'

const GROUP1_KEYS: ReadonlyArray<keyof DateTimeMapping> = [
  'year',
  'month',
  'day',
  'hour',
  'minute'
]

const findHeaderByKeyword = (headers: string[], keywords: string[]): string | null => {
  const lower = headers.map((h) => h.toLowerCase())
  const i = lower.findIndex((h) => keywords.some((k) => h.includes(k)))
  return i >= 0 ? headers[i] : null
}

function ImportWizard({
  isOpen,
  onClose,
  onRequestPickFile,
  onSubmit,
  pickedFile,
  fileLoading,
  fileError,
  importing,
  importError
}: ImportWizardProps): React.JSX.Element | null {
  const [stepIdx, setStepIdx] = useState(0)
  const [parsed, setParsed] = useState<ParseResult | null>(null)
  const [parseError, setParseError] = useState<string | null>(null)
  const [parsedDateTimes, setParsedDateTimes] = useState<Array<Date | null>>([])
  const [mode, setMode] = useState<DateTimeMode>('group2')
  const [mapping, setMapping] = useState<DateTimeMapping>(INITIAL_MAPPING)
  const [dateFormat, setDateFormat] = useState<DateFormatKey>('YYYY-MM-DD')
  const [columnSelection, setColumnSelection] = useState<Record<number, boolean>>({})
  const [filename, setFilename] = useState<string | null>(null)
  // Tracks the last pickedFile we observed so the render-time parse runs
  // exactly once per new file. React's recommended pattern for deriving
  // state from props (https://react.dev/reference/react/useState).
  const [lastSeenPickedFile, setLastSeenPickedFile] = useState<typeof pickedFile>(null)

  // Reset of wizard-local state happens automatically: the parent unmounts
  // <ImportWizard /> via its `{showWizard && …}` guard, so closing the modal
  // discards all hooks. No effect needed.

  // Parse on pickedFile change — runs during render so it doesn't trigger a
  // setState-in-effect cascade. React schedules an immediate re-render with
  // the new state without flushing the in-progress one to DOM.
  if (pickedFile !== lastSeenPickedFile) {
    setLastSeenPickedFile(pickedFile)
    if (pickedFile) {
      setFilename(pickedFile.filename)
      try {
        const result = parseFile(pickedFile.filename, pickedFile.rawText)
        setParsed(result)
        setParseError(null)

        const auto: DateTimeMapping = {
          year: findHeaderByKeyword(result.headers, ['year']),
          month: findHeaderByKeyword(result.headers, ['month']),
          day: findHeaderByKeyword(result.headers, ['day']),
          hour: findHeaderByKeyword(result.headers, ['hour']),
          minute: findHeaderByKeyword(result.headers, ['minute']),
          date: findHeaderByKeyword(result.headers, ['date']),
          time: findHeaderByKeyword(result.headers, ['time'])
        }
        setMapping(auto)
        if (auto.year && auto.month && auto.day) setMode('group1')
        else if (auto.date) setMode('group2')
      } catch (err) {
        setParseError((err as Error).message)
        setParsed(null)
      }
    }
  }

  // Re-parse delimited input when delimiter changes (step 2).
  const handleChangeDelimiter = useCallback(
    (d: string) => {
      if (!pickedFile || !parsed || parsed.format === 'xml') return
      try {
        const r = parseDelimited(pickedFile.rawText, d, parsed.headerLinesToSkip)
        setParseError(null)
        setParsed({ ...parsed, delimiter: d, ...r })
      } catch (e) {
        setParseError((e as Error).message)
      }
    },
    [pickedFile, parsed]
  )

  // Re-parse delimited input when header-skip changes (step 2).
  const handleChangeSkip = useCallback(
    (n: number) => {
      if (!pickedFile || !parsed || parsed.format === 'xml') return
      try {
        const r = parseDelimited(pickedFile.rawText, parsed.delimiter, n)
        setParseError(null)
        setParsed({ ...parsed, headerLinesToSkip: n, ...r })
      } catch (e) {
        setParseError((e as Error).message)
      }
    },
    [pickedFile, parsed]
  )

  // Step 3 stats. configReady = required dropdowns filled.
  const dtStats: DateTimeStats = useMemo(() => {
    if (!parsed) return { configReady: false, valid: 0, invalid: 0, total: 0 }
    const configReady =
      mode === 'group2'
        ? Boolean(mapping.date) && Boolean(dateFormat)
        : Boolean(mapping.year) && Boolean(mapping.month) && Boolean(mapping.day)
    if (!configReady) {
      return {
        configReady: false,
        valid: 0,
        invalid: parsed.rows.length,
        total: parsed.rows.length
      }
    }
    let valid = 0
    let invalid = 0
    for (const row of parsed.rows) {
      // 'ok' and 'invalid_time' both produce a usable Date; only 'invalid_date'
      // rows can't be imported. Time is optional so it doesn't gate Next.
      const r = parseRowDateTime(row, parsed.headers, mode, mapping, dateFormat)
      if (r.kind === 'invalid_date') invalid++
      else valid++
    }
    return { configReady: true, valid, invalid, total: parsed.rows.length }
  }, [parsed, mode, mapping, dateFormat])

  const dtColumns: string[] = useMemo(() => {
    if (mode === 'group2') {
      return [mapping.date, mapping.time].filter((v): v is string => v !== null)
    }
    return GROUP1_KEYS.map((k) => mapping[k]).filter((v): v is string => v !== null)
  }, [mode, mapping])

  // Allow proceed as long as required date dropdowns are filled and at least
  // one row produces a usable Date. Time is optional — invalid time doesn't
  // block Next.
  const canProceedDateTime = dtStats.configReady && dtStats.valid > 0

  const handleNext = useCallback((): void => {
    if (!parsed) return
    if (stepIdx === 2) {
      const dts: Array<Date | null> = parsed.rows.map((r) => {
        const result = parseRowDateTime(r, parsed.headers, mode, mapping, dateFormat)
        return result.kind === 'invalid_date' ? null : result.date
      })
      setParsedDateTimes(dts)
    }
    setStepIdx((i) => Math.min(i + 1, STEPS.length - 1))
  }, [parsed, stepIdx, mode, mapping, dateFormat])

  const handleBack = useCallback((): void => {
    setStepIdx((i) => Math.max(i - 1, 0))
  }, [])

  const handleImport = useCallback((): void => {
    if (!parsed) return
    const dtSet = new Set(dtColumns)
    const keptIndices = parsed.headers
      .map((h, i) => ({ h, i }))
      .filter(({ h, i }) => !dtSet.has(h) && columnSelection[i] !== false)

    // Synthetic "check" column — always added on import, defaults to true for
    // every record. Lets downstream tools include/exclude rows after import.
    const checkColumn: ImportedDatasetColumn = {
      key: '__check__',
      label: 'check',
      index: -1
    }

    const userColumns: ImportedDatasetColumn[] = keptIndices.map(({ h, i }) => ({
      key: `${i}__${h}`,
      label: h,
      index: i
    }))

    const columns: ImportedDatasetColumn[] = [checkColumn, ...userColumns]

    const records: ImportedDatasetRecord[] = parsed.rows.map((row, rowIdx) => {
      const dt = parsedDateTimes[rowIdx] ?? null
      // Backend stores `check` as 0/1 strings, not 'true'/'false'.
      const values: Record<string, string> = { __check__: '1' }
      for (const { h, i } of keptIndices) {
        values[`${i}__${h}`] = row[i] ?? ''
      }
      return {
        dtIso: dt ? dt.toISOString() : null,
        values
      }
    })

    // Sort by Date-Time ascending; rows with null dt (Invalid) sort to the end.
    records.sort((a, b) => {
      if (a.dtIso === null && b.dtIso === null) return 0
      if (a.dtIso === null) return 1
      if (b.dtIso === null) return -1
      if (a.dtIso < b.dtIso) return -1
      if (a.dtIso > b.dtIso) return 1
      return 0
    })

    const dataset: ImportedDataset = {
      filename: filename ?? pickedFile?.filename ?? 'unknown',
      columns,
      records
    }
    onSubmit(dataset)
  }, [parsed, parsedDateTimes, dtColumns, columnSelection, filename, pickedFile, onSubmit])

  const canGoNext = ((): boolean => {
    if (!parsed) return false
    if (stepIdx === 0) return parseError === null
    if (stepIdx === 1) return parseError === null
    if (stepIdx === 2) return canProceedDateTime
    return true
  })()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/55 backdrop-blur-sm"
        onClick={importing ? undefined : onClose}
      />

      <div className="relative flex h-full items-center justify-center p-4">
        <div
          className="flex flex-col rounded-[3px] border border-app-border bg-app-bg shadow-2xl"
          style={{ width: 580, maxHeight: '92vh' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between rounded-t-[3px] border-b border-[#e2e8f0] bg-[#f8fafc] px-6 py-4">
            <h2 className="text-base font-medium text-neutral-900">Import Weather Data</h2>
            <button
              type="button"
              onClick={onClose}
              disabled={importing}
              aria-label="Close"
              className="text-neutral-500 hover:text-neutral-900 disabled:opacity-50"
            >
              <CloseIcon className="h-3 w-3" />
            </button>
          </div>

          {/* Stepper */}
          <div className="px-4 pt-4">
            <Stepper currentIndex={stepIdx} />
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto pt-2 scrollbar-custom">
            {stepIdx === 0 && (
              <StepFilePreview
                filename={filename}
                fileLoading={fileLoading}
                fileError={fileError}
                parseError={parseError}
                onBrowse={onRequestPickFile}
              />
            )}
            {stepIdx === 1 && parsed && (
              <StepDataPreview
                parsed={parsed}
                parseError={parseError}
                onChangeDelimiter={handleChangeDelimiter}
                onChangeSkip={handleChangeSkip}
              />
            )}
            {stepIdx === 2 && parsed && (
              <StepDateTime
                parsed={parsed}
                mode={mode}
                onChangeMode={setMode}
                mapping={mapping}
                onChangeMapping={(k, v) =>
                  setMapping((current) => ({ ...current, [k]: v }))
                }
                dateFormat={dateFormat}
                onChangeDateFormat={setDateFormat}
                stats={dtStats}
              />
            )}
            {stepIdx === 3 && parsed && (
              <StepReview
                parsed={parsed}
                parsedDateTimes={parsedDateTimes}
                dtColumns={dtColumns}
                columnSelection={columnSelection}
                onToggleColumn={(i) =>
                  setColumnSelection((s) => ({ ...s, [i]: s[i] === false ? true : false }))
                }
              />
            )}
          </div>

          {importError && (
            <div className="mx-6 mb-2 flex items-start gap-2 rounded border border-red-900/40 bg-red-900/20 px-3 py-2 text-sm text-red-300">
              <AlertTriangleIcon className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <strong className="font-semibold">Import failed: </strong>
                {importError}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              {stepIdx > 0 && !importing && (
                <GhostBtn
                  onClick={handleBack}
                  leftIcon={<ChevronLeftIcon className="h-4 w-4" />}
                >
                  Back
                </GhostBtn>
              )}
            </div>
            <div className="flex gap-3">
              <SecondaryBtn onClick={onClose}>Cancel</SecondaryBtn>
              {stepIdx < STEPS.length - 1 ? (
                <PrimaryBtn onClick={handleNext} disabled={!canGoNext}>
                  Next
                </PrimaryBtn>
              ) : (
                <PrimaryBtn onClick={handleImport} disabled={!canGoNext || importing}>
                  {importing ? 'Importing…' : 'Import'}
                </PrimaryBtn>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ImportWizard
