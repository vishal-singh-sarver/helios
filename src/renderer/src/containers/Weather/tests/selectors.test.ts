import makeSelectWeather, {
  selectWeatherDomain,
  selectStatus,
  selectLoading,
  selectError,
  selectStreaming,
  selectStreamLog
} from '../selectors'
import { initialState } from '../reducer'

const withWeather = (partial: Partial<typeof initialState>) =>
  ({ weather: { ...initialState, ...partial } }) as any

describe('selectWeatherDomain', () => {
  it('selects the weather slice', () => {
    expect(selectWeatherDomain(withWeather({}))).toEqual(initialState)
  })

  it('returns initialState when key is absent', () => {
    expect(selectWeatherDomain({})).toEqual(initialState)
  })
})

describe('makeSelectWeather', () => {
  it('selects the whole weather domain', () => {
    const selector = makeSelectWeather()
    expect(selector(withWeather({}))).toEqual(initialState)
  })
})

describe('individual selectors', () => {
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
