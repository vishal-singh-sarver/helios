import makeSelectWeather, {
  selectWeatherDomain,
  selectStatus,
  selectLoading,
  selectError,
  selectStreaming,
  selectStreamLog,
  selectFileLoading,
  selectFileError,
  selectPickedFile,
  selectImporting,
  selectImportError,
  selectDataset
} from '../selectors'
import { initialState } from '../reducer'
import type { ImportedDataset, PickedFile } from '../types'

const withWeather = (partial: Partial<typeof initialState>) =>
  ({ weather: { ...initialState, ...partial } }) as any

describe('selectWeatherDomain', () => {
  it('selects the weather slice', () => {
    expect(selectWeatherDomain(withWeather({}))).toEqual(initialState)
  })

  it('returns initialState when key is absent', () => {
    expect(selectWeatherDomain({} as any)).toEqual(initialState)
  })
})

describe('makeSelectWeather', () => {
  it('selects the whole weather domain', () => {
    const selector = makeSelectWeather()
    expect(selector(withWeather({}))).toEqual(initialState)
  })
})

describe('individual selectors — REST/SSE', () => {
  it('selectStatus', () => {
    const status = { version: '1.0', uptime: 5 }
    expect(selectStatus(withWeather({ status }))).toEqual(status)
  })

  it('selectLoading', () => {
    expect(selectLoading(withWeather({ loading: true }))).toBe(true)
  })

  it('selectError', () => {
    expect(selectError(withWeather({ error: 'bad' }))).toBe('bad')
  })

  it('selectStreaming', () => {
    expect(selectStreaming(withWeather({ streaming: true }))).toBe(true)
  })

  it('selectStreamLog', () => {
    const log = [{ type: 'ping', data: null, timestamp: 1 }]
    expect(selectStreamLog(withWeather({ streamLog: log }))).toEqual(log)
  })
})

describe('individual selectors — Import', () => {
  const picked: PickedFile = { filename: 'foo.csv', rawText: 'a,b\n1,2' }
  const dataset: ImportedDataset = {
    filename: 'foo.csv',
    columns: [],
    records: []
  }

  it('selectFileLoading', () => {
    expect(selectFileLoading(withWeather({ fileLoading: true }))).toBe(true)
  })

  it('selectFileError', () => {
    expect(selectFileError(withWeather({ fileError: 'denied' }))).toBe('denied')
  })

  it('selectPickedFile', () => {
    expect(selectPickedFile(withWeather({ pickedFile: picked }))).toEqual(picked)
  })

  it('selectImporting', () => {
    expect(selectImporting(withWeather({ importing: true }))).toBe(true)
  })

  it('selectImportError', () => {
    expect(selectImportError(withWeather({ importError: 'save cancelled' }))).toBe(
      'save cancelled'
    )
  })

  it('selectDataset', () => {
    expect(selectDataset(withWeather({ dataset }))).toEqual(dataset)
  })

  it('selectDataset returns null when no import has finished', () => {
    expect(selectDataset(withWeather({}))).toBeNull()
  })
})
