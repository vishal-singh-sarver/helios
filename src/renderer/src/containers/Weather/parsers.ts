// Pure data utilities for the Import Weather Data flow:
//   - format-agnostic file parsing (CSV/TXT/XML)
//   - strict-on-date / lenient-on-time validation
//   - serialization back to CSV for backend upload
//
// Everything in this file is pure (no I/O, no React, no Redux). Side effects
// — file open, file read, HTTP POST — live in containers/Weather/saga.ts.

// ── Types ─────────────────────────────────────────────────────────────────────

export type FileFormat = 'csv' | 'txt' | 'xml'

export interface ParseResult {
  format: FileFormat
  delimiter: string
  headerLinesToSkip: number
  headers: string[]
  rows: string[][]
}

export type DateTimeMode = 'group1' | 'group2'

export interface DateTimeMapping {
  year: string | null
  month: string | null
  day: string | null
  hour: string | null
  minute: string | null
  date: string | null
  time: string | null
}

export const INITIAL_MAPPING: DateTimeMapping = {
  year: null,
  month: null,
  day: null,
  hour: null,
  minute: null,
  date: null,
  time: null
}

export type DateFormatKey =
  | 'YYYY-MM-DD'
  | 'DD/MM/YYYY'
  | 'MM/DD/YYYY'
  | 'DD-MM-YYYY'
  | 'YYYY/MM/DD'
  | 'DD.MM.YYYY'

interface DateFormatSpec {
  value: DateFormatKey
  label: string
  parts: ReadonlyArray<'Y' | 'M' | 'D'>
}

export const DATE_FORMATS: ReadonlyArray<DateFormatSpec> = [
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD', parts: ['Y', 'M', 'D'] },
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY', parts: ['D', 'M', 'Y'] },
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY', parts: ['M', 'D', 'Y'] },
  { value: 'DD-MM-YYYY', label: 'DD-MM-YYYY', parts: ['D', 'M', 'Y'] },
  { value: 'YYYY/MM/DD', label: 'YYYY/MM/DD', parts: ['Y', 'M', 'D'] },
  { value: 'DD.MM.YYYY', label: 'DD.MM.YYYY', parts: ['D', 'M', 'Y'] }
]

export interface DelimiterSpec {
  value: string
  label: string
}

export const DELIMITERS: ReadonlyArray<DelimiterSpec> = [
  { value: ',', label: 'Comma  (,)' },
  { value: ';', label: 'Semicolon  (;)' },
  { value: '\t', label: 'Tab  (\\t)' },
  { value: '|', label: 'Pipe  (|)' },
  { value: ' ', label: 'Space  ( )' }
]

export interface ImportedDatasetColumn {
  key: string
  label: string
  index: number
}

export interface ImportedDatasetRecord {
  dtIso: string | null
  values: Record<string, string>
}

export interface ImportedDataset {
  filename: string
  columns: ImportedDatasetColumn[]
  records: ImportedDatasetRecord[]
}

// ── Internal helpers ──────────────────────────────────────────────────────────

const escapeRe = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const isCommentLine = (l: string): boolean =>
  l.startsWith('#') || l.startsWith('//') || l.startsWith(';;')

function modeOf(arr: number[]): number {
  const m = new Map<number, number>()
  for (const v of arr) m.set(v, (m.get(v) ?? 0) + 1)
  let best = arr[0]
  let bestCount = 0
  for (const [k, c] of m) {
    if (c > bestCount) {
      best = k
      bestCount = c
    }
  }
  return best
}

// ── Delimiter / header detection ──────────────────────────────────────────────

export function detectDelimiter(text: string): string {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .filter((l) => !isCommentLine(l))
    .slice(0, 10)
  if (lines.length === 0) return ','

  let bestConsistent: string | null = null
  let bestConsistentAvg = -1
  let bestFallback = ','
  let bestFallbackAvg = -1

  for (const { value: d } of DELIMITERS) {
    const counts = lines.map((l) => (l.match(new RegExp(escapeRe(d), 'g')) ?? []).length)
    const min = Math.min(...counts)
    const max = Math.max(...counts)
    const avg = counts.reduce((a, b) => a + b, 0) / counts.length
    // Consistency wins over raw count: a real delimiter appears the same number
    // of times in every data row. Noise inside fields varies row-to-row.
    if (min > 0 && min === max && avg > bestConsistentAvg) {
      bestConsistentAvg = avg
      bestConsistent = d
    }
    if (avg > bestFallbackAvg) {
      bestFallbackAvg = avg
      bestFallback = d
    }
  }
  return bestConsistent ?? bestFallback
}

export function detectHeaderLinesToSkip(text: string, delimiter: string): number {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .slice(0, 15)
  if (lines.length === 0) return 0

  const counts = lines.map((l) => l.split(delimiter).length)
  const tail = counts.slice(-Math.min(8, counts.length))
  const modal = modeOf(tail)

  let skip = 0
  for (let i = 0; i < lines.length; i++) {
    if (isCommentLine(lines[i])) {
      skip = i + 1
      continue
    }
    if (counts[i] !== modal) {
      skip = i + 1
      continue
    }
    break
  }
  return skip
}

// ── Delimited parsing ─────────────────────────────────────────────────────────

export function parseDelimited(
  text: string,
  delimiter: string,
  headerLinesToSkip: number
): { headers: string[]; rows: string[][] } {
  const all = text.split(/\r?\n/).filter((l) => l.length > 0)
  if (all.length <= headerLinesToSkip) {
    throw new Error('No data rows after skipping header lines.')
  }
  const headers = all[headerLinesToSkip].split(delimiter).map((s) => s.trim())
  const rows: string[][] = []
  for (let i = headerLinesToSkip + 1; i < all.length; i++) {
    const cells = all[i].split(delimiter).map((s) => s.trim())
    // Strict: column-count mismatch fails the parse rather than silently
    // padding/truncating, because for weather data a missing field is data loss.
    if (cells.length !== headers.length) {
      throw new Error(
        `Row ${i + 1}: ${cells.length} fields, expected ${headers.length}. ` +
          'The file does not allow header/data column mismatch.'
      )
    }
    rows.push(cells)
  }
  return { headers, rows }
}

// ── XML parsing ───────────────────────────────────────────────────────────────

export function parseXml(text: string): { headers: string[]; rows: string[][] } {
  const doc = new DOMParser().parseFromString(text, 'application/xml')
  if (doc.querySelector('parsererror')) throw new Error('Invalid XML format.')
  const root = doc.documentElement
  if (!root || root.children.length === 0) {
    throw new Error('XML is empty or has no records.')
  }

  // Repeated record tag = whichever direct child appears most often.
  const childCounts: Record<string, number> = {}
  for (const c of Array.from(root.children)) {
    childCounts[c.tagName] = (childCounts[c.tagName] ?? 0) + 1
  }
  const recordTag = Object.entries(childCounts).sort((a, b) => b[1] - a[1])[0][0]
  const records = Array.from(root.children).filter((c) => c.tagName === recordTag)

  const headers: string[] = []
  const seen = new Set<string>()
  for (const rec of records) {
    for (const f of Array.from(rec.children)) {
      if (!seen.has(f.tagName)) {
        seen.add(f.tagName)
        headers.push(f.tagName)
      }
    }
  }

  const rows = records.map((rec) =>
    headers.map((h) => {
      const el = Array.from(rec.children).find((c) => c.tagName === h)
      return el ? (el.textContent ?? '').trim() : ''
    })
  )
  return { headers, rows }
}

// ── Front-door parser ─────────────────────────────────────────────────────────

export interface ParseFileOptions {
  delimiter?: string
  headerLinesToSkip?: number
}

export function parseFile(
  filename: string,
  content: string,
  opts: ParseFileOptions = {}
): ParseResult {
  const ext = (filename.split('.').pop() ?? '').toLowerCase()
  const looksXml = content.trimStart().startsWith('<')
  if (ext === 'xml' || looksXml) {
    const { headers, rows } = parseXml(content)
    return { format: 'xml', delimiter: '', headerLinesToSkip: 0, headers, rows }
  }
  const delimiter = opts.delimiter ?? detectDelimiter(content)
  const headerLinesToSkip = opts.headerLinesToSkip ?? detectHeaderLinesToSkip(content, delimiter)
  const { headers, rows } = parseDelimited(content, delimiter, headerLinesToSkip)
  return {
    format: ext === 'csv' ? 'csv' : 'txt',
    delimiter,
    headerLinesToSkip,
    headers,
    rows
  }
}

// ── Date / time parsing ───────────────────────────────────────────────────────

const DATE_SEP_RE = /[/\-.\s,]+/

interface DateParts {
  Y: number
  M: number
  D: number
}

interface TimeParts {
  H: number
  M: number
}

export function tryParseDate(raw: unknown, formatKey: DateFormatKey): DateParts | null {
  if (raw === undefined || raw === null || raw === '') return null
  const fmt = DATE_FORMATS.find((f) => f.value === formatKey)
  if (!fmt) return null
  const tokens = String(raw).trim().split(DATE_SEP_RE).filter(Boolean)
  if (tokens.length !== 3) return null

  let Y = 0
  let M = 0
  let D = 0
  for (let i = 0; i < 3; i++) {
    const tok = tokens[i]
    const v = parseInt(tok, 10)
    if (Number.isNaN(v)) return null
    // Year must be exactly 4 digits in the source — "26" is ambiguous and
    // "0123" is not a real year. Forcing 4 digits keeps imports unambiguous.
    if (fmt.parts[i] === 'Y' && !/^\d{4}$/.test(tok)) return null
    if (fmt.parts[i] === 'Y') Y = v
    else if (fmt.parts[i] === 'M') M = v
    else D = v
  }
  if (M < 1 || M > 12 || D < 1 || D > 31) return null
  return { Y, M, D }
}

export function tryParseTime(raw: unknown): TimeParts | null {
  if (raw === undefined || raw === null || raw === '') return null
  const s = String(raw).trim()
  let H: number
  let M: number

  // Accepted no-separator forms: "HMM" (3 digits, e.g. CIMIS "100" = 01:00)
  // or "HHMM" (4 digits). Plus "HH:MM" / "HH MM" with a separator.
  // Anything else — dots, plus, minus, seconds — is rejected.
  const concat = s.match(/^(\d{1,2})(\d{2})$/)
  if (concat) {
    H = parseInt(concat[1], 10)
    M = parseInt(concat[2], 10)
  } else {
    const sep = s.match(/^(\d{1,2})(?::|\s+)(\d{1,2})$/)
    if (!sep) return null
    H = parseInt(sep[1], 10)
    M = parseInt(sep[2], 10)
  }

  if (Number.isNaN(H) || Number.isNaN(M)) return null
  if (H < 0 || H > 23 || M < 0 || M > 59) return null
  return { H, M }
}

// Tagged result so the UI can distinguish "bad date" from "bad time".
//
// Time is OPTIONAL: when a mapped time/hour/minute value can't be parsed we
// surface a `invalid_time` warning to the UI, but we still build a Date with
// time defaulted to 00:00 so the row is importable. Date is REQUIRED and
// strict — `invalid_date` rows have no Date and import as literal "Invalid".
export type RowDateTimeResult =
  | { kind: 'ok'; date: Date }
  | { kind: 'invalid_time'; date: Date }
  | { kind: 'invalid_date' }

export function parseRowDateTime(
  row: string[],
  headers: string[],
  mode: DateTimeMode,
  mapping: DateTimeMapping,
  dateFormat: DateFormatKey
): RowDateTimeResult {
  const get = (key: keyof DateTimeMapping): string | undefined => {
    const colName = mapping[key]
    if (!colName) return undefined
    const idx = headers.indexOf(colName)
    return idx >= 0 ? row[idx] : undefined
  }

  if (mode === 'group2') {
    const dateRaw = get('date')
    if (dateRaw === undefined || dateRaw === '') return { kind: 'invalid_date' }
    const d = tryParseDate(dateRaw, dateFormat)
    if (!d) return { kind: 'invalid_date' }

    let H = 0
    let Min = 0
    let timeInvalid = false
    if (mapping.time) {
      const timeRaw = get('time')
      if (timeRaw !== undefined && timeRaw !== '') {
        const t = tryParseTime(timeRaw)
        if (!t) {
          timeInvalid = true
        } else {
          H = t.H
          Min = t.M
        }
      }
    }
    const date = new Date(d.Y, d.M - 1, d.D, H, Min, 0)
    return timeInvalid ? { kind: 'invalid_time', date } : { kind: 'ok', date }
  }

  const yRaw = get('year')
  const mRaw = get('month')
  const dRaw = get('day')
  if (yRaw === undefined || mRaw === undefined || dRaw === undefined) {
    return { kind: 'invalid_date' }
  }
  if (!/^\d{4}$/.test(String(yRaw).trim())) return { kind: 'invalid_date' }

  const Y = parseInt(yRaw, 10)
  const Mo = parseInt(mRaw, 10)
  const D = parseInt(dRaw, 10)
  if (Number.isNaN(Y) || Number.isNaN(Mo) || Number.isNaN(D)) {
    return { kind: 'invalid_date' }
  }
  if (Mo < 1 || Mo > 12) return { kind: 'invalid_date' }
  if (D < 1 || D > 31) return { kind: 'invalid_date' }

  let H = 0
  let Min = 0
  let timeInvalid = false
  if (mapping.hour) {
    const hRaw = get('hour')
    if (hRaw !== undefined && hRaw !== '') {
      const hv = parseInt(hRaw, 10)
      if (Number.isNaN(hv) || hv < 0 || hv > 23) timeInvalid = true
      else H = hv
    }
  }
  if (mapping.minute) {
    const mRaw2 = get('minute')
    if (mRaw2 !== undefined && mRaw2 !== '') {
      const mv = parseInt(mRaw2, 10)
      if (Number.isNaN(mv) || mv < 0 || mv > 59) timeInvalid = true
      else Min = mv
    }
  }
  const date = new Date(Y, Mo - 1, D, H, Min, 0)
  return timeInvalid ? { kind: 'invalid_time', date } : { kind: 'ok', date }
}

// ── CSV serialization (for backend upload) ────────────────────────────────────

export function toCsv(d: ImportedDataset): string {
  const escape = (v: string): string =>
    /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v

  const headerLine = ['Date-Time', ...d.columns.map((c) => c.label)].map(escape).join(',')
  const lines = [headerLine]
  for (const r of d.records) {
    const dt = r.dtIso ?? 'Invalid'
    const cells = [dt, ...d.columns.map((c) => r.values[c.key] ?? '')]
    lines.push(cells.map(escape).join(','))
  }
  return lines.join('\n')
}
