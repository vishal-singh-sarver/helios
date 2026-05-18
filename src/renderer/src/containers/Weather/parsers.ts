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

export type DateTimeMode = 'group1' | 'group2' | 'group3'
export type DateSelectionMode = 'parts' | 'string' | 'julian' | 'datetime'
export type TimeSelectionMode = 'none' | 'parts' | 'string' | 'compact'

export interface DateTimeMapping {
  year: string | null
  month: string | null
  day: string | null
  julianYear: string | null
  julianDay: string | null
  hour: string | null
  minute: string | null
  date: string | null
  time: string | null
  datetime: string | null
}

export const INITIAL_MAPPING: DateTimeMapping = {
  year: null,
  month: null,
  day: null,
  julianYear: null,
  julianDay: null,
  hour: null,
  minute: null,
  date: null,
  time: null,
  datetime: null
}

export type DateFormatKey =
  | 'YYYYMMDD'
  | 'YYYY-MM-DD'
  | 'DD-MM-YYYY'
  | 'MM-DD-YYYY'
  | 'DD/MM/YYYY'
  | 'MM/DD/YYYY'
  | 'YYYY/MM/DD'
  | 'DD.MM.YYYY'
  | 'YYYY DOY'
  | 'DOY YYYY'

export type DateTimeFormatKey =
  | 'YYYY-MM-DDTHH:MM:SSZ'
  | 'YYYY-MM-DDTHH:MM:SS-HH:MM'
  | 'YYYYMMDDHH'
  | 'YYYYMMDDHHMM'
  | 'YYYY-MM-DD HH:MM'
  | 'DD/MM/YYYY HH:MM'
  | 'MM/DD/YYYY HH:MM'
  | 'DD-MM-YYYY HH:MM'
  | 'MM-DD-YYYY HH:MM'

interface DateFormatSpec {
  value: DateFormatKey
  label: string
  parts: ReadonlyArray<'Y' | 'M' | 'D'>
}

export const DATE_FORMATS: ReadonlyArray<DateFormatSpec> = [
  { value: 'YYYYMMDD', label: 'YYYYMMDD', parts: ['Y', 'M', 'D'] },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD', parts: ['Y', 'M', 'D'] },
  { value: 'DD-MM-YYYY', label: 'DD-MM-YYYY', parts: ['D', 'M', 'Y'] },
  { value: 'MM-DD-YYYY', label: 'MM-DD-YYYY', parts: ['M', 'D', 'Y'] },
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY', parts: ['D', 'M', 'Y'] },
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY', parts: ['M', 'D', 'Y'] },
  { value: 'YYYY/MM/DD', label: 'YYYY/MM/DD', parts: ['Y', 'M', 'D'] },
  { value: 'DD.MM.YYYY', label: 'DD.MM.YYYY', parts: ['D', 'M', 'Y'] },
  { value: 'YYYY DOY', label: 'YYYY DOY', parts: ['Y', 'D'] },
  { value: 'DOY YYYY', label: 'DOY YYYY', parts: ['D', 'Y'] }
]

export const DATETIME_FORMATS: ReadonlyArray<{
  value: DateTimeFormatKey
  label: string
}> = [
  { value: 'YYYY-MM-DDTHH:MM:SSZ', label: 'YYYY-MM-DDTHH:MM:SSZ' },
  { value: 'YYYY-MM-DDTHH:MM:SS-HH:MM', label: 'YYYY-MM-DDTHH:MM:SS-HH:MM' },
  { value: 'YYYYMMDDHH', label: 'YYYYMMDDHH' },
  { value: 'YYYYMMDDHHMM', label: 'YYYYMMDDHHMM' },
  { value: 'YYYY-MM-DD HH:MM', label: 'YYYY-MM-DD HH:MM' },
  { value: 'DD/MM/YYYY HH:MM', label: 'DD/MM/YYYY HH:MM' },
  { value: 'MM/DD/YYYY HH:MM', label: 'MM/DD/YYYY HH:MM' },
  { value: 'DD-MM-YYYY HH:MM', label: 'DD-MM-YYYY HH:MM' },
  { value: 'MM-DD-YYYY HH:MM', label: 'MM-DD-YYYY HH:MM' }
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

function sanitizeXmlTagName(name: string): string {
  if (/^[A-Za-z_][A-Za-z0-9_.-]*$/.test(name)) return name
  return `tag_${Array.from(name)
    .map((ch) => (/^[A-Za-z0-9_.-]$/.test(ch) ? ch : `_x${ch.charCodeAt(0).toString(16)}_`))
    .join('')}`
}

function normalizeXmlForParsing(text: string): { normalized: string; tagNameMap: Map<string, string> } {
  let normalized = text.replace(/<\?xml\s+version\s*=\s*([0-9.]+)\s*\?>/i, '<?xml version="$1"?>')
  const tagNameMap = new Map<string, string>()

  normalized = normalized.replace(/<(\/?)([^\s!?/>]+)([^>]*)>/g, (_match, slash, rawName, rest) => {
    const safeName = sanitizeXmlTagName(rawName)
    tagNameMap.set(safeName, rawName)
    return `<${slash}${safeName}${rest}>`
  })

  return { normalized, tagNameMap }
}

function findXmlRecords(root: Element): Element[] {
  const directChildren = Array.from(root.children)
  if (directChildren.length === 0) return []

  const directCounts: Record<string, number> = {}
  for (const child of directChildren) {
    directCounts[child.tagName] = (directCounts[child.tagName] ?? 0) + 1
  }
  const directRecordTag = Object.entries(directCounts).sort((a, b) => b[1] - a[1])[0]?.[0]
  if (directRecordTag && directCounts[directRecordTag] > 1) {
    return directChildren.filter((child) => child.tagName === directRecordTag)
  }

  let bestNestedRecords: Element[] = []
  for (const child of directChildren) {
    const nestedChildren = Array.from(child.children)
    if (nestedChildren.length === 0) continue

    const nestedCounts: Record<string, number> = {}
    for (const nested of nestedChildren) {
      nestedCounts[nested.tagName] = (nestedCounts[nested.tagName] ?? 0) + 1
    }
    const nestedRecordTag = Object.entries(nestedCounts).sort((a, b) => b[1] - a[1])[0]?.[0]
    if (!nestedRecordTag || nestedCounts[nestedRecordTag] <= 1) continue

    const nestedRecords = nestedChildren.filter((nested) => nested.tagName === nestedRecordTag)
    if (nestedRecords.length > bestNestedRecords.length) {
      bestNestedRecords = nestedRecords
    }
  }

  return bestNestedRecords.length > 0 ? bestNestedRecords : directChildren
}

export function parseXml(text: string): { headers: string[]; rows: string[][] } {
  let doc = new DOMParser().parseFromString(text, 'application/xml')
  let tagNameMap = new Map<string, string>()

  if (doc.querySelector('parsererror')) {
    const normalized = normalizeXmlForParsing(text)
    tagNameMap = normalized.tagNameMap
    doc = new DOMParser().parseFromString(normalized.normalized, 'application/xml')
  }
  if (doc.querySelector('parsererror')) throw new Error('Invalid XML format.')
  const root = doc.documentElement
  if (!root || root.children.length === 0) {
    throw new Error('XML is empty or has no records.')
  }

  const records = findXmlRecords(root)
  if (records.length === 0) {
    throw new Error('XML is empty or has no records.')
  }

  const headers: string[] = []
  const seen = new Set<string>()
  for (const rec of records) {
    for (const f of Array.from(rec.children)) {
      const rawTagName = tagNameMap.get(f.tagName) ?? f.tagName
      if (!seen.has(rawTagName)) {
        seen.add(rawTagName)
        headers.push(rawTagName)
      }
    }
  }

  const rows = records.map((rec) =>
    headers.map((h) => {
      const el = Array.from(rec.children).find((c) => (tagNameMap.get(c.tagName) ?? c.tagName) === h)
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
  S: number
  rollover: boolean
}

export function tryParseDate(raw: unknown, formatKey: DateFormatKey): DateParts | null {
  if (raw === undefined || raw === null || raw === '') return null
  const fmt = DATE_FORMATS.find((f) => f.value === formatKey)
  if (!fmt) return null
  const trimmed = String(raw).trim()

  if (formatKey === 'YYYYMMDD') {
    const compact = trimmed.match(/^(\d{4})(\d{2})(\d{2})$/)
    if (!compact) return null
    return validateDateParts({
      Y: parseInt(compact[1], 10),
      M: parseInt(compact[2], 10),
      D: parseInt(compact[3], 10)
    })
  }

  if (formatKey === 'YYYY DOY' || formatKey === 'DOY YYYY') {
    const tokens = trimmed.split(DATE_SEP_RE).filter(Boolean)
    if (tokens.length !== 2) return null
    const yearToken = formatKey === 'YYYY DOY' ? tokens[0] : tokens[1]
    const doyToken = formatKey === 'YYYY DOY' ? tokens[1] : tokens[0]
    if (!/^\d{4}$/.test(yearToken) || !/^\d{1,3}$/.test(doyToken)) return null
    return dateFromDayOfYear(parseInt(yearToken, 10), parseInt(doyToken, 10))
  }

  const tokens = trimmed.split(DATE_SEP_RE).filter(Boolean)
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
  return validateDateParts({ Y, M, D })
}

export function tryParseTime(raw: unknown): TimeParts | null {
  if (raw === undefined || raw === null || raw === '') return null
  const s = String(raw).trim()
  let H: number
  let M: number
  let S = 0

  const digits = s.match(/^\d+$/)
  if (digits) {
    if (s.length <= 2) {
      H = parseInt(s, 10)
      M = 0
    } else if (s.length === 3 || s.length === 4) {
      const split = s.match(/^(\d{1,2})(\d{2})$/)
      if (!split) return null
      H = parseInt(split[1], 10)
      M = parseInt(split[2], 10)
    } else if (s.length === 6) {
      H = parseInt(s.slice(0, 2), 10)
      M = parseInt(s.slice(2, 4), 10)
      S = parseInt(s.slice(4, 6), 10)
    } else {
      return null
    }
  } else {
    const sep = s.match(/^(\d{1,2})(?::|\s+)(\d{2})(?:(?::|\s+)(\d{2}))?$/)
    if (!sep) return null
    H = parseInt(sep[1], 10)
    M = parseInt(sep[2], 10)
    S = sep[3] ? parseInt(sep[3], 10) : 0
  }

  if (Number.isNaN(H) || Number.isNaN(M) || Number.isNaN(S)) return null
  if (H === 24 && M === 0 && S === 0) return { H: 0, M: 0, S: 0, rollover: true }
  if (H < 0 || H > 23 || M < 0 || M > 59 || S < 0 || S > 59) return null
  return { H, M, S, rollover: false }
}

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
}

function validateDateParts(parts: DateParts): DateParts | null {
  const { Y, M, D } = parts
  if (M < 1 || M > 12 || D < 1 || D > 31) return null
  const date = new Date(Y, M - 1, D)
  if (date.getFullYear() !== Y || date.getMonth() !== M - 1 || date.getDate() !== D) return null
  return parts
}

function dateFromDayOfYear(Y: number, doy: number): DateParts | null {
  const maxDay = isLeapYear(Y) ? 366 : 365
  if (doy < 1 || doy > maxDay) return null
  const date = new Date(Y, 0, doy)
  return { Y: date.getFullYear(), M: date.getMonth() + 1, D: date.getDate() }
}

function buildDate(parts: DateParts, time: TimeParts | null): Date {
  const base = new Date(parts.Y, parts.M - 1, parts.D, time?.H ?? 0, time?.M ?? 0, time?.S ?? 0)
  if (time?.rollover) {
    base.setDate(base.getDate() + 1)
  }
  return base
}

export function tryParseDateTime(raw: unknown, formatKey: DateTimeFormatKey): Date | null {
  if (raw === undefined || raw === null || raw === '') return null
  const s = String(raw).trim()

  if (formatKey === 'YYYY-MM-DDTHH:MM:SSZ') {
    const match = s.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})Z$/)
    if (!match) return null
    const date = validateDateParts({
      Y: parseInt(match[1], 10),
      M: parseInt(match[2], 10),
      D: parseInt(match[3], 10)
    })
    if (!date) return null
    const time = tryParseTime(`${match[4]}:${match[5]}:${match[6]}`)
    if (!time) return null
    return buildDate(date, time)
  }

  if (formatKey === 'YYYY-MM-DDTHH:MM:SS-HH:MM') {
    const match = s.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:Z|[+-]\d{2}:\d{2})$/)
    if (!match) return null
    const date = validateDateParts({
      Y: parseInt(match[1], 10),
      M: parseInt(match[2], 10),
      D: parseInt(match[3], 10)
    })
    if (!date) return null
    const time = tryParseTime(`${match[4]}:${match[5]}:${match[6]}`)
    if (!time) return null
    return buildDate(date, time)
  }

  if (formatKey === 'YYYYMMDDHH' || formatKey === 'YYYYMMDDHHMM') {
    const compact =
      formatKey === 'YYYYMMDDHH'
        ? s.match(/^(\d{4})(\d{2})(\d{2})(\d{2})$/)
        : s.match(/^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})$/)
    if (!compact) return null
    const date = validateDateParts({
      Y: parseInt(compact[1], 10),
      M: parseInt(compact[2], 10),
      D: parseInt(compact[3], 10)
    })
    if (!date) return null
    const time =
      formatKey === 'YYYYMMDDHH'
        ? tryParseTime(compact[4])
        : tryParseTime(`${compact[4]}${compact[5]}`)
    if (!time) return null
    return buildDate(date, time)
  }

  const split = s.match(/^(.+?)\s+(.+)$/)
  if (!split) return null

  const dateFormatsByDateTime: Record<DateTimeFormatKey, DateFormatKey | null> = {
    'YYYY-MM-DDTHH:MM:SSZ': null,
    'YYYY-MM-DDTHH:MM:SS-HH:MM': null,
    YYYYMMDDHH: null,
    YYYYMMDDHHMM: null,
    'YYYY-MM-DD HH:MM': 'YYYY-MM-DD',
    'DD/MM/YYYY HH:MM': 'DD/MM/YYYY',
    'MM/DD/YYYY HH:MM': 'MM/DD/YYYY',
    'DD-MM-YYYY HH:MM': 'DD-MM-YYYY',
    'MM-DD-YYYY HH:MM': 'MM-DD-YYYY'
  }

  const dateFormat = dateFormatsByDateTime[formatKey]
  if (!dateFormat) return null
  const date = tryParseDate(split[1], dateFormat)
  const time = tryParseTime(split[2])
  if (!date || !time) return null
  return buildDate(date, time)
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
  dateFormat: DateFormatKey,
  datetimeFormat?: DateTimeFormatKey
): RowDateTimeResult {
  const selectionMap: Record<
    DateTimeMode,
    { dateMode: DateSelectionMode; timeMode: TimeSelectionMode }
  > = {
    group1: { dateMode: 'parts', timeMode: 'parts' },
    group2: { dateMode: 'string', timeMode: 'string' },
    group3: { dateMode: 'datetime', timeMode: 'none' }
  }
  const { dateMode, timeMode } = selectionMap[mode]
  return parseRowDateTimeSelections(
    row,
    headers,
    dateMode,
    timeMode,
    mapping,
    dateFormat,
    datetimeFormat
  )
}

export function parseRowDateTimeSelections(
  row: string[],
  headers: string[],
  dateMode: DateSelectionMode,
  timeMode: TimeSelectionMode,
  mapping: DateTimeMapping,
  dateFormat: DateFormatKey,
  datetimeFormat?: DateTimeFormatKey
): RowDateTimeResult {
  const get = (key: keyof DateTimeMapping): string | undefined => {
    const colName = mapping[key]
    if (!colName) return undefined
    const idx = headers.indexOf(colName)
    return idx >= 0 ? row[idx] : undefined
  }

  if (dateMode === 'datetime') {
    const datetimeRaw = get('datetime')
    if (datetimeRaw === undefined || datetimeRaw === '' || !datetimeFormat) {
      return { kind: 'invalid_date' }
    }
    const parsed = tryParseDateTime(datetimeRaw, datetimeFormat)
    return parsed ? { kind: 'ok', date: parsed } : { kind: 'invalid_date' }
  }

  let dateParts: DateParts | null = null

  if (dateMode === 'string') {
    const dateRaw = get('date')
    if (dateRaw === undefined || dateRaw === '') return { kind: 'invalid_date' }
    dateParts = tryParseDate(dateRaw, dateFormat)
  } else if (dateMode === 'julian') {
    const yearRaw = get('julianYear')
    const dayRaw = get('julianDay')
    if (yearRaw === undefined || dayRaw === undefined) return { kind: 'invalid_date' }
    if (!/^\d{4}$/.test(String(yearRaw).trim()) || !/^\d{1,3}$/.test(String(dayRaw).trim())) {
      return { kind: 'invalid_date' }
    }
    dateParts = dateFromDayOfYear(parseInt(yearRaw, 10), parseInt(dayRaw, 10))
  } else {
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
    dateParts = validateDateParts({ Y, M: Mo, D })
  }

  if (!dateParts) return { kind: 'invalid_date' }

  let H = 0
  let Min = 0
  let Sec = 0
  let rollover = false
  let timeInvalid = false

  if (timeMode === 'parts') {
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
  } else if (timeMode === 'string' || timeMode === 'compact') {
    if (mapping.time) {
      const timeRaw = get('time')
      if (timeRaw !== undefined && timeRaw !== '') {
        const t = tryParseTime(timeRaw)
        if (!t) {
          timeInvalid = true
        } else {
          H = t.H
          Min = t.M
          Sec = t.S
          rollover = t.rollover
        }
      }
    }
  }

  const date = buildDate(dateParts, { H, M: Min, S: Sec, rollover })
  return timeInvalid ? { kind: 'invalid_time', date } : { kind: 'ok', date }
}

// ── CSV serialization (for backend upload) ────────────────────────────────────

export function toCsv(d: ImportedDataset): string {
  const escape = (v: string): string => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v)

  const headerLine = ['Date-Time', ...d.columns.map((c) => c.label)].map(escape).join(',')
  const lines = [headerLine]
  for (const r of d.records) {
    const dt = r.dtIso ?? 'Invalid'
    const cells = [dt, ...d.columns.map((c) => r.values[c.key] ?? '')]
    lines.push(cells.map(escape).join(','))
  }
  return lines.join('\n')
}
