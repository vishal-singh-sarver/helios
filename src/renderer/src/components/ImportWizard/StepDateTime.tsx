import React, { useMemo } from 'react'
import {
  DATE_FORMATS,
  parseRowDateTime,
  type DateFormatKey,
  type DateTimeMapping
} from 'containers/Weather/parsers'
import { AlertTriangleIcon, CheckCircleIcon } from './Icons'
import { Select, type SelectOption } from './primitives'
import type { StepDateTimeProps } from './types'

const GROUP1_KEYS: ReadonlyArray<keyof DateTimeMapping> = [
  'year',
  'month',
  'day',
  'hour',
  'minute'
]

interface PreviewRow {
  raw: string
  parsedStr: string
  valid: boolean
}

function fmtDateTime24(d: Date): string {
  const pad = (n: number): string => String(n).padStart(2, '0')
  const date = `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`
  const time = `${pad(d.getHours())}:${pad(d.getMinutes())}`
  return `${date}, ${time}`
}

export default function StepDateTime({
  parsed,
  mode,
  onChangeMode,
  mapping,
  onChangeMapping,
  dateFormat,
  onChangeDateFormat,
  stats
}: StepDateTimeProps): React.JSX.Element {
  // Build the dropdown options for one slot — excludes columns already in
  // use by *other* slots in the current mapping. Each column can only be
  // assigned once. The current slot's own value is preserved in the list so
  // it stays visible as the selected option.
  const optionsExcluding = (currentSlot: keyof DateTimeMapping): SelectOption[] => {
    const slots: Array<keyof DateTimeMapping> =
      mode === 'group1' ? ['year', 'month', 'day', 'hour', 'minute'] : ['date', 'time']
    const used = new Set<string>()
    for (const s of slots) {
      const v = mapping[s]
      if (s !== currentSlot && v !== null) used.add(v)
    }
    return parsed.headers
      .map((h, i) => ({ value: h, label: `${i + 1}: ${h}` }))
      .filter((o) => !used.has(o.value))
  }

  const previewRows: PreviewRow[] = useMemo(() => {
    return parsed.rows.slice(0, 5).map((row) => {
      let raw = ''
      if (mode === 'group2') {
        const dateIdx = mapping.date ? parsed.headers.indexOf(mapping.date) : -1
        const timeIdx = mapping.time ? parsed.headers.indexOf(mapping.time) : -1
        const d = dateIdx >= 0 ? row[dateIdx] : ''
        const t = timeIdx >= 0 ? row[timeIdx] : ''
        raw = [d, t].filter(Boolean).join(' ')
      } else {
        raw = GROUP1_KEYS.map((k) => {
          const colName = mapping[k]
          if (!colName) return null
          const idx = parsed.headers.indexOf(colName)
          return idx >= 0 ? row[idx] : null
        })
          .filter((v): v is string => v !== null && v !== '')
          .join(' ')
      }
      const result = parseRowDateTime(row, parsed.headers, mode, mapping, dateFormat)
      if (result.kind === 'ok') {
        return { raw, parsedStr: fmtDateTime24(result.date), valid: true }
      }
      if (result.kind === 'invalid_time') {
        return { raw, parsedStr: 'Invalid time format', valid: false }
      }
      return { raw, parsedStr: 'Invalid', valid: false }
    })
  }, [parsed, mode, mapping, dateFormat])

  return (
    <div className="flex flex-col gap-4 overflow-hidden px-6 pb-2">
      {/* Mode picker */}
      <div className="flex items-center gap-8">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-neutral-200">
          <input
            type="radio"
            name="dt-mode"
            checked={mode === 'group1'}
            onChange={() => onChangeMode('group1')}
            className="h-4 w-4"
          />
          Group 1
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-neutral-200">
          <input
            type="radio"
            name="dt-mode"
            checked={mode === 'group2'}
            onChange={() => onChangeMode('group2')}
            className="h-4 w-4"
          />
          Group 2
        </label>
      </div>

      <div className="text-sm text-neutral-300">Map each day/time component to a column.</div>

      <div
        className="flex flex-col gap-2.5 overflow-y-auto pr-1 scrollbar-custom"
        style={{ maxHeight: 240 }}
      >
        {mode === 'group1' ? (
          GROUP1_KEYS.map((key) => {
            return (
              <div key={key} className="grid grid-cols-3 items-center gap-3">
                <label className="text-sm capitalize text-neutral-200">{key}</label>
                <div className="col-span-2">
                  <Select
                    value={mapping[key]}
                    onChange={(v) => onChangeMapping(key, v)}
                    options={optionsExcluding(key)}
                  />
                </div>
              </div>
            )
          })
        ) : (
          <>
            <div className="grid grid-cols-3 items-center gap-3">
              <label className="text-sm text-neutral-200">Date</label>
              <div className="col-span-2 grid grid-cols-2 gap-3">
                <Select
                  value={dateFormat}
                  onChange={(v) => {
                    if (v) onChangeDateFormat(v as DateFormatKey)
                  }}
                  options={DATE_FORMATS.map((f) => ({ value: f.value, label: f.label }))}
                  placeholder="-- format --"
                />
                <Select
                  value={mapping.date}
                  onChange={(v) => onChangeMapping('date', v)}
                  options={optionsExcluding('date')}
                  placeholder="-- column --"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 items-center gap-3">
              <label className="text-sm text-neutral-200">Time</label>
              <div className="col-span-2">
                <Select
                  value={mapping.time}
                  onChange={(v) => onChangeMapping('time', v)}
                  options={optionsExcluding('time')}
                />
              </div>
            </div>
          </>
        )}
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <div className="text-sm text-neutral-300">Date/Time Preview</div>
          {stats.configReady &&
            (stats.invalid === 0 ? (
              <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                <CheckCircleIcon className="h-3.5 w-3.5" />
                All {stats.total} rows valid
              </div>
            ) : stats.valid === 0 ? (
              <div className="flex items-center gap-1.5 text-xs text-red-400">
                <AlertTriangleIcon className="h-3.5 w-3.5" />
                0 of {stats.total} rows valid — check your mapping
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-amber-400">
                <AlertTriangleIcon className="h-3.5 w-3.5" />
                {stats.valid} of {stats.total} valid · {stats.invalid} will import as Invalid
              </div>
            ))}
        </div>
        <div className="overflow-hidden rounded border border-app-border">
          <table className="w-full text-sm">
            <thead style={{ backgroundColor: '#424242' }}>
              <tr>
                <th className="w-1/2 border-b border-app-border px-4 py-2 text-left font-medium text-neutral-300">
                  Raw
                </th>
                <th className="border-b border-app-border px-4 py-2 text-left font-medium text-neutral-300">
                  Parsed
                </th>
              </tr>
            </thead>
            <tbody>
              {previewRows.map((r, i) => (
                <tr key={i} className="border-b border-app-border last:border-0">
                  <td className="px-4 py-2 text-neutral-200">
                    {r.raw || <span className="text-neutral-500">—</span>}
                  </td>
                  <td
                    className={['px-4 py-2', r.valid ? 'text-emerald-400' : 'text-red-400'].join(
                      ' '
                    )}
                  >
                    {r.parsedStr ?? 'Invalid'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
