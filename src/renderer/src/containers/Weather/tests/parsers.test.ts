import {
  DATE_FORMATS,
  DATETIME_FORMATS,
  DELIMITERS,
  detectDelimiter,
  detectHeaderLinesToSkip,
  INITIAL_MAPPING,
  parseDelimited,
  parseFile,
  parseRowDateTime,
  parseXml,
  toCsv,
  tryParseDate,
  tryParseDateTime,
  tryParseTime,
  type DateTimeMapping,
  type ImportedDataset
} from '../parsers'

// ── detectDelimiter ───────────────────────────────────────────────────────────

describe('detectDelimiter', () => {
  it('detects comma in a CSV body', () => {
    expect(detectDelimiter('a,b,c\n1,2,3\n4,5,6')).toBe(',')
  })

  it('detects tab in a TSV body', () => {
    expect(detectDelimiter('a\tb\tc\n1\t2\t3\n4\t5\t6')).toBe('\t')
  })

  it('detects semicolon when used consistently', () => {
    expect(detectDelimiter('a;b;c\n1;2;3')).toBe(';')
  })

  it('detects pipe when used consistently', () => {
    expect(detectDelimiter('a|b|c|d\n1|2|3|4')).toBe('|')
  })

  it('ignores comment lines when picking a delimiter', () => {
    const text = '# meta\n# more meta\na,b,c\n1,2,3'
    expect(detectDelimiter(text)).toBe(',')
  })

  it('falls back to comma for inconsistent input', () => {
    expect(detectDelimiter('')).toBe(',')
  })

  it('prefers consistency over raw count', () => {
    // Tab appears 3x in every row consistently; commas appear in only some.
    const text = 'a\tb\tc\td\n1\t2,foo\t3\t4\n5\t6\t7\t8'
    expect(detectDelimiter(text)).toBe('\t')
  })
})

// ── detectHeaderLinesToSkip ───────────────────────────────────────────────────

describe('detectHeaderLinesToSkip', () => {
  it('returns 0 when the file is clean', () => {
    expect(detectHeaderLinesToSkip('a,b,c\n1,2,3\n4,5,6', ',')).toBe(0)
  })

  it('skips leading hash comments', () => {
    expect(detectHeaderLinesToSkip('# comment\na,b,c\n1,2,3', ',')).toBe(1)
  })

  it('skips multiple comment styles', () => {
    // Need enough data rows so the modal column count is the data shape (3),
    // not the comment shape (1) — the heuristic looks at the trailing counts.
    const text = '# c1\n// c2\n;; c3\na,b,c\n1,2,3\n4,5,6\n7,8,9\n10,11,12'
    expect(detectHeaderLinesToSkip(text, ',')).toBe(3)
  })

  it('skips lines whose column count differs from the modal count', () => {
    const text = 'preamble line\nanother\na,b,c\n1,2,3\n4,5,6'
    expect(detectHeaderLinesToSkip(text, ',')).toBe(2)
  })

  it('returns 0 for an empty file', () => {
    expect(detectHeaderLinesToSkip('', ',')).toBe(0)
  })
})

// ── parseDelimited ────────────────────────────────────────────────────────────

describe('parseDelimited', () => {
  it('parses a clean CSV body', () => {
    const r = parseDelimited('a,b,c\n1,2,3\n4,5,6', ',', 0)
    expect(r.headers).toEqual(['a', 'b', 'c'])
    expect(r.rows).toEqual([
      ['1', '2', '3'],
      ['4', '5', '6']
    ])
  })

  it('skips leading header lines as instructed', () => {
    const r = parseDelimited('# meta\na,b\n1,2', ',', 1)
    expect(r.headers).toEqual(['a', 'b'])
    expect(r.rows).toEqual([['1', '2']])
  })

  it('throws when a row has more fields than the header', () => {
    expect(() => parseDelimited('a,b\n1,2,3', ',', 0)).toThrow(/3 fields, expected 2/)
  })

  it('throws when a row has fewer fields than the header', () => {
    expect(() => parseDelimited('a,b,c\n1,2', ',', 0)).toThrow(/2 fields, expected 3/)
  })

  it('throws when there are no data rows after the skip', () => {
    expect(() => parseDelimited('a,b\n', ',', 1)).toThrow(/No data rows/)
  })

  it('trims whitespace inside cells', () => {
    const r = parseDelimited(' a , b \n 1 , 2 ', ',', 0)
    expect(r.headers).toEqual(['a', 'b'])
    expect(r.rows).toEqual([['1', '2']])
  })
})

// ── parseXml ──────────────────────────────────────────────────────────────────

describe('parseXml', () => {
  it('extracts headers and rows from repeated record tags', () => {
    const xml = `<?xml version="1.0"?>
      <data>
        <reading><Date>1/1/2026</Date><temp>20</temp></reading>
        <reading><Date>2/1/2026</Date><temp>22</temp></reading>
      </data>`
    const r = parseXml(xml)
    expect(r.headers).toEqual(['Date', 'temp'])
    expect(r.rows).toEqual([
      ['1/1/2026', '20'],
      ['2/1/2026', '22']
    ])
  })

  it('throws on malformed XML', () => {
    expect(() => parseXml('<not closed')).toThrow(/Invalid XML/)
  })

  it('throws when the document has no records', () => {
    expect(() => parseXml('<?xml version="1.0"?><root></root>')).toThrow(/empty or has no records/)
  })

  it('collects union of fields across records', () => {
    const xml = `<root>
      <r><a>1</a><b>2</b></r>
      <r><a>3</a><c>4</c></r>
    </root>`
    const r = parseXml(xml)
    expect(r.headers).toEqual(['a', 'b', 'c'])
    expect(r.rows).toEqual([
      ['1', '2', ''],
      ['3', '', '4']
    ])
  })

  it('normalizes XML-ish vendor tags like HH:MM and preserves original header names', () => {
    const xml = `<?xml version='1.0' encoding='utf-8'?>
      <WeatherData>
        <Record>
          <YYYYMMDD>20230713</YYYYMMDD>
          <HH:MM>01:00</HH:MM>
          <ISO_UTC>2023-07-13T01:00:00Z</ISO_UTC>
        </Record>
      </WeatherData>`
    const r = parseXml(xml)
    expect(r.headers).toEqual(['YYYYMMDD', 'HH:MM', 'ISO_UTC'])
    expect(r.rows).toEqual([['20230713', '01:00', '2023-07-13T01:00:00Z']])
  })

  it('normalizes malformed XML declarations like version=1.0', () => {
    const xml = `<?xml version=1.0?>
      <helios>
        <datapoint>
          <dateJulian>190 2014</dateJulian>
          <time>00 00 00</time>
          <value>25.85</value>
        </datapoint>
      </helios>`
    const r = parseXml(xml)
    expect(r.headers).toEqual(['dateJulian', 'time', 'value'])
    expect(r.rows).toEqual([['190 2014', '00 00 00', '25.85']])
  })

  it('descends into wrapper nodes like timeseries/datapoint to find real record headers', () => {
    const xml = `<?xml version=1.0?>
      <helios>
        <timeseries label="temperature">
          <datapoint>
            <dateJulian>190 2014</dateJulian>
            <time>00 00 00</time>
            <value>25.85</value>
          </datapoint>
          <datapoint>
            <dateJulian>190 2014</dateJulian>
            <time>00 15 00</time>
            <value>26.24</value>
          </datapoint>
        </timeseries>
      </helios>`
    const r = parseXml(xml)
    expect(r.headers).toEqual(['dateJulian', 'time', 'value'])
    expect(r.rows).toEqual([
      ['190 2014', '00 00 00', '25.85'],
      ['190 2014', '00 15 00', '26.24']
    ])
  })
})

// ── parseFile (front-door) ────────────────────────────────────────────────────

describe('parseFile', () => {
  it('routes .csv to delimited parsing', () => {
    const r = parseFile('foo.csv', 'a,b\n1,2')
    expect(r.format).toBe('csv')
    expect(r.delimiter).toBe(',')
  })

  it('routes .txt to delimited parsing', () => {
    const r = parseFile('foo.txt', 'a\tb\n1\t2')
    expect(r.format).toBe('txt')
    expect(r.delimiter).toBe('\t')
  })

  it('routes .xml to XML parsing', () => {
    const r = parseFile('foo.xml', '<root><r><a>1</a></r></root>')
    expect(r.format).toBe('xml')
    expect(r.headers).toEqual(['a'])
  })

  it('sniffs XML even when extension is missing', () => {
    const r = parseFile('weird-name', '<root><r><a>1</a></r></root>')
    expect(r.format).toBe('xml')
  })
})

// ── tryParseDate ──────────────────────────────────────────────────────────────

describe('tryParseDate', () => {
  it('parses compact YYYYMMDD', () => {
    expect(tryParseDate('20260226', 'YYYYMMDD')).toEqual({ Y: 2026, M: 2, D: 26 })
  })

  it('parses YYYY-MM-DD', () => {
    expect(tryParseDate('2026-02-26', 'YYYY-MM-DD')).toEqual({ Y: 2026, M: 2, D: 26 })
  })

  it('parses DD-MM-YYYY', () => {
    expect(tryParseDate('26-02-2026', 'DD-MM-YYYY')).toEqual({ Y: 2026, M: 2, D: 26 })
  })

  it('parses MM-DD-YYYY', () => {
    expect(tryParseDate('02-26-2026', 'MM-DD-YYYY')).toEqual({ Y: 2026, M: 2, D: 26 })
  })

  it('parses DD/MM/YYYY', () => {
    expect(tryParseDate('26/02/2026', 'DD/MM/YYYY')).toEqual({ Y: 2026, M: 2, D: 26 })
  })

  it('parses MM/DD/YYYY', () => {
    expect(tryParseDate('02/26/2026', 'MM/DD/YYYY')).toEqual({ Y: 2026, M: 2, D: 26 })
  })

  it('parses DD.MM.YYYY', () => {
    expect(tryParseDate('26.02.2026', 'DD.MM.YYYY')).toEqual({ Y: 2026, M: 2, D: 26 })
  })

  it('parses YYYY DOY', () => {
    expect(tryParseDate('2026 57', 'YYYY DOY')).toEqual({ Y: 2026, M: 2, D: 26 })
  })

  it('parses DOY YYYY', () => {
    expect(tryParseDate('57 2026', 'DOY YYYY')).toEqual({ Y: 2026, M: 2, D: 26 })
  })

  it('rejects 2-digit years (ambiguous)', () => {
    expect(tryParseDate('26/02/26', 'DD/MM/YYYY')).toBeNull()
  })

  it('rejects out-of-range months', () => {
    expect(tryParseDate('2026-13-01', 'YYYY-MM-DD')).toBeNull()
  })

  it('rejects out-of-range days', () => {
    expect(tryParseDate('2026-01-32', 'YYYY-MM-DD')).toBeNull()
  })

  it('rejects impossible calendar dates', () => {
    expect(tryParseDate('2026-02-30', 'YYYY-MM-DD')).toBeNull()
  })

  it('rejects empty input', () => {
    expect(tryParseDate('', 'YYYY-MM-DD')).toBeNull()
  })

  it('rejects garbage text', () => {
    expect(tryParseDate('not a date', 'YYYY-MM-DD')).toBeNull()
  })

  it('exposes a known DATE_FORMATS list', () => {
    expect(DATE_FORMATS.length).toBeGreaterThan(0)
    expect(DATE_FORMATS.find((f) => f.value === 'YYYY-MM-DD')).toBeDefined()
  })
})

// ── tryParseTime ──────────────────────────────────────────────────────────────

describe('tryParseTime', () => {
  it('parses HH', () => {
    expect(tryParseTime('14')).toEqual({ H: 14, M: 0, S: 0, rollover: false })
  })

  it('parses HH:MM', () => {
    expect(tryParseTime('14:30')).toEqual({ H: 14, M: 30, S: 0, rollover: false })
  })

  it('parses HH MM (space separated)', () => {
    expect(tryParseTime('14 30')).toEqual({ H: 14, M: 30, S: 0, rollover: false })
  })

  it('parses HHMM (4 digits, no separator)', () => {
    expect(tryParseTime('1430')).toEqual({ H: 14, M: 30, S: 0, rollover: false })
  })

  it('parses HMM (3 digits — CIMIS hour format)', () => {
    expect(tryParseTime('100')).toEqual({ H: 1, M: 0, S: 0, rollover: false })
    expect(tryParseTime('945')).toEqual({ H: 9, M: 45, S: 0, rollover: false })
    expect(tryParseTime('200')).toEqual({ H: 2, M: 0, S: 0, rollover: false })
  })

  it('parses HH:MM:SS', () => {
    expect(tryParseTime('14:30:45')).toEqual({ H: 14, M: 30, S: 45, rollover: false })
  })

  it('parses HHMMSS', () => {
    expect(tryParseTime('143045')).toEqual({ H: 14, M: 30, S: 45, rollover: false })
  })

  it('rejects HH.MM (dot separator not allowed)', () => {
    expect(tryParseTime('14.30')).toBeNull()
  })

  it('rejects out-of-range hour', () => {
    expect(tryParseTime('25:00')).toBeNull()
  })

  it('rejects out-of-range minute', () => {
    expect(tryParseTime('14:60')).toBeNull()
  })

  it('rejects empty input', () => {
    expect(tryParseTime('')).toBeNull()
  })

  it('accepts 24:00 as next-day rollover', () => {
    expect(tryParseTime('24:00')).toEqual({ H: 0, M: 0, S: 0, rollover: true })
  })

  it('accepts midnight as 0:00', () => {
    expect(tryParseTime('0:00')).toEqual({ H: 0, M: 0, S: 0, rollover: false })
  })

  it('accepts 23:59 (last valid time)', () => {
    expect(tryParseTime('23:59')).toEqual({ H: 23, M: 59, S: 0, rollover: false })
  })
})

describe('tryParseDateTime', () => {
  it('parses ISO-8601 UTC', () => {
    const d = tryParseDateTime('2026-02-03T10:00:00Z', 'YYYY-MM-DDTHH:MM:SSZ')
    expect(d).not.toBeNull()
    expect(d?.getFullYear()).toBe(2026)
    expect(d?.getHours()).toBe(10)
  })

  it('parses ISO-8601 with offset while preserving wall-clock time', () => {
    const d = tryParseDateTime('2026-02-03T02:00:00-08:00', 'YYYY-MM-DDTHH:MM:SS-HH:MM')
    expect(d).not.toBeNull()
    expect(d?.getHours()).toBe(2)
  })

  it('parses compact YYYYMMDDHH', () => {
    const d = tryParseDateTime('2026020310', 'YYYYMMDDHH')
    expect(d).not.toBeNull()
    expect(d?.getHours()).toBe(10)
  })

  it('parses DD/MM/YYYY HH:MM', () => {
    const d = tryParseDateTime('03/02/2026 10:15', 'DD/MM/YYYY HH:MM')
    expect(d).not.toBeNull()
    expect(d?.getDate()).toBe(3)
    expect(d?.getMinutes()).toBe(15)
  })
})

// ── parseRowDateTime ──────────────────────────────────────────────────────────

describe('parseRowDateTime', () => {
  describe('group2 (single date + time)', () => {
    const headers = ['Date', 'Time', 'temp']
    const mapping: DateTimeMapping = {
      ...INITIAL_MAPPING,
      date: 'Date',
      time: 'Time'
    }

    it('returns ok with parsed Date when both date and time are valid', () => {
      const r = parseRowDateTime(['26/02/2026', '14:30', '22.5'], headers, 'group2', mapping, 'DD/MM/YYYY')
      expect(r.kind).toBe('ok')
      if (r.kind === 'ok') {
        expect(r.date.getFullYear()).toBe(2026)
        expect(r.date.getMonth()).toBe(1) // 0-indexed
        expect(r.date.getDate()).toBe(26)
        expect(r.date.getHours()).toBe(14)
        expect(r.date.getMinutes()).toBe(30)
      }
    })

    it('returns invalid_date for unparseable date', () => {
      const r = parseRowDateTime(['garbage', '14:30', '22.5'], headers, 'group2', mapping, 'DD/MM/YYYY')
      expect(r.kind).toBe('invalid_date')
    })

    it('returns invalid_time when date is OK but time is malformed (still has a Date)', () => {
      const r = parseRowDateTime(['26/02/2026', '99:99', '22.5'], headers, 'group2', mapping, 'DD/MM/YYYY')
      expect(r.kind).toBe('invalid_time')
      if (r.kind === 'invalid_time') {
        // Time defaults to 00:00 but the date itself is preserved
        expect(r.date.getHours()).toBe(0)
        expect(r.date.getMinutes()).toBe(0)
        expect(r.date.getDate()).toBe(26)
      }
    })

    it('treats empty time as missing (defaults to 00:00, kind = ok)', () => {
      const r = parseRowDateTime(['26/02/2026', '', '22.5'], headers, 'group2', mapping, 'DD/MM/YYYY')
      expect(r.kind).toBe('ok')
    })

    it('rolls 24:00 into the next day', () => {
      const r = parseRowDateTime(['26/02/2026', '24:00', '22.5'], headers, 'group2', mapping, 'DD/MM/YYYY')
      expect(r.kind).toBe('ok')
      if (r.kind === 'ok') {
        expect(r.date.getDate()).toBe(27)
        expect(r.date.getHours()).toBe(0)
      }
    })

    it('accepts no time mapping at all (defaults to 00:00)', () => {
      const noTime = { ...mapping, time: null }
      const r = parseRowDateTime(['26/02/2026', '14:30', '22.5'], headers, 'group2', noTime, 'DD/MM/YYYY')
      expect(r.kind).toBe('ok')
      if (r.kind === 'ok') {
        expect(r.date.getHours()).toBe(0)
      }
    })
  })

  describe('group1 (separate Y/M/D/H/M)', () => {
    const headers = ['year', 'month', 'day', 'hour', 'minute']
    const mapping: DateTimeMapping = {
      ...INITIAL_MAPPING,
      year: 'year',
      month: 'month',
      day: 'day',
      hour: 'hour',
      minute: 'minute'
    }

    it('returns ok when all components are valid', () => {
      const r = parseRowDateTime(['2026', '2', '26', '14', '30'], headers, 'group1', mapping, 'YYYY-MM-DD')
      expect(r.kind).toBe('ok')
    })

    it('returns invalid_date when year is not 4 digits', () => {
      const r = parseRowDateTime(['26', '2', '26', '14', '30'], headers, 'group1', mapping, 'YYYY-MM-DD')
      expect(r.kind).toBe('invalid_date')
    })

    it('returns invalid_date for out-of-range month', () => {
      const r = parseRowDateTime(['2026', '13', '26', '14', '30'], headers, 'group1', mapping, 'YYYY-MM-DD')
      expect(r.kind).toBe('invalid_date')
    })

    it('returns invalid_time when hour is non-numeric', () => {
      const r = parseRowDateTime(['2026', '2', '26', 'xx', '30'], headers, 'group1', mapping, 'YYYY-MM-DD')
      expect(r.kind).toBe('invalid_time')
    })

    it('returns invalid_time when hour is out of range', () => {
      const r = parseRowDateTime(['2026', '2', '26', '99', '30'], headers, 'group1', mapping, 'YYYY-MM-DD')
      expect(r.kind).toBe('invalid_time')
    })

    it('treats empty hour as 0 (kind = ok)', () => {
      const r = parseRowDateTime(['2026', '2', '26', '', ''], headers, 'group1', mapping, 'YYYY-MM-DD')
      expect(r.kind).toBe('ok')
      if (r.kind === 'ok') {
        expect(r.date.getHours()).toBe(0)
        expect(r.date.getMinutes()).toBe(0)
      }
    })
  })

  describe('group3 (combined datetime)', () => {
    const headers = ['Timestamp', 'temp']
    const mapping: DateTimeMapping = {
      ...INITIAL_MAPPING,
      datetime: 'Timestamp'
    }

    it('returns ok for ISO timestamps', () => {
      const r = parseRowDateTime(
        ['2026-02-03T10:00:00Z', '22.5'],
        headers,
        'group3',
        mapping,
        'YYYY-MM-DD',
        'YYYY-MM-DDTHH:MM:SSZ'
      )
      expect(r.kind).toBe('ok')
    })

    it('returns invalid_date for malformed combined datetime values', () => {
      const r = parseRowDateTime(
        ['not-a-datetime', '22.5'],
        headers,
        'group3',
        mapping,
        'YYYY-MM-DD',
        'YYYY-MM-DDTHH:MM:SSZ'
      )
      expect(r.kind).toBe('invalid_date')
    })
  })
})

// ── toCsv ─────────────────────────────────────────────────────────────────────

describe('toCsv', () => {
  it('serializes Date-Time + selected columns with header row', () => {
    const ds: ImportedDataset = {
      filename: 'test.csv',
      columns: [
        { key: '__check__', label: 'check', index: -1 },
        { key: '0__temp', label: 'temp', index: 0 }
      ],
      records: [
        { dtIso: '2026-02-26T10:00:00.000Z', values: { __check__: 'true', '0__temp': '22.5' } },
        { dtIso: '2026-02-26T11:00:00.000Z', values: { __check__: 'true', '0__temp': '23.7' } }
      ]
    }
    const csv = toCsv(ds)
    const lines = csv.split('\n')
    expect(lines[0]).toBe('Date-Time,check,temp')
    expect(lines[1]).toBe('2026-02-26T10:00:00.000Z,true,22.5')
    expect(lines[2]).toBe('2026-02-26T11:00:00.000Z,true,23.7')
  })

  it('writes literal "Invalid" for null dtIso', () => {
    const ds: ImportedDataset = {
      filename: 't.csv',
      columns: [{ key: '0__a', label: 'a', index: 0 }],
      records: [{ dtIso: null, values: { '0__a': 'x' } }]
    }
    const csv = toCsv(ds)
    expect(csv.split('\n')[1]).toBe('Invalid,x')
  })

  it('escapes commas, quotes, and newlines', () => {
    const ds: ImportedDataset = {
      filename: 't.csv',
      columns: [{ key: '0__notes', label: 'notes', index: 0 }],
      records: [
        { dtIso: '2026-01-01T00:00:00.000Z', values: { '0__notes': 'a,b' } },
        { dtIso: '2026-01-01T00:00:00.000Z', values: { '0__notes': 'has "quote"' } },
        { dtIso: '2026-01-01T00:00:00.000Z', values: { '0__notes': 'line\nbreak' } }
      ]
    }
    const lines = toCsv(ds).split('\n')
    expect(lines[1].endsWith('"a,b"')).toBe(true)
    expect(lines[2].endsWith('"has ""quote"""')).toBe(true)
    // The newline-escaped value contains a literal \n inside quotes — split('\n')
    // breaks the value across two array entries; just check the quoted form starts.
    expect(lines[3].includes('"line')).toBe(true)
  })

  it('emits empty string for missing column values', () => {
    const ds: ImportedDataset = {
      filename: 't.csv',
      columns: [{ key: '0__missing', label: 'missing', index: 0 }],
      records: [{ dtIso: '2026-01-01T00:00:00.000Z', values: {} }]
    }
    expect(toCsv(ds).split('\n')[1]).toBe('2026-01-01T00:00:00.000Z,')
  })
})

// ── DELIMITERS / DATE_FORMATS sanity ──────────────────────────────────────────

describe('exported constants', () => {
  it('DELIMITERS contains the five expected delimiters', () => {
    const values = DELIMITERS.map((d) => d.value)
    expect(values).toEqual([',', ';', '\t', '|', ' '])
  })

  it('DATE_FORMATS includes both YYYY-MM-DD and DD/MM/YYYY', () => {
    const values = DATE_FORMATS.map((f) => f.value)
    expect(values).toContain('YYYYMMDD')
    expect(values).toContain('YYYY-MM-DD')
    expect(values).toContain('DD/MM/YYYY')
    expect(values).toContain('DOY YYYY')
  })

  it('DATETIME_FORMATS includes ISO and compact combined formats', () => {
    const values = DATETIME_FORMATS.map((f) => f.value)
    expect(values).toContain('YYYY-MM-DDTHH:MM:SSZ')
    expect(values).toContain('YYYYMMDDHH')
  })

  it('INITIAL_MAPPING has every field as null', () => {
    expect(Object.values(INITIAL_MAPPING).every((v) => v === null)).toBe(true)
  })
})
