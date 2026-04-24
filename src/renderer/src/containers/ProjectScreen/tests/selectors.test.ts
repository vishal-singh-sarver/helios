import makeSelectProjectScreen, {
  selectProjectScreenDomain,
  selectStatus,
  selectLoading,
  selectError,
  selectStreaming,
  selectStreamLog
} from '../selectors'
import { initialState } from '../reducer'

const withProjectScreen = (partial: Partial<typeof initialState>) =>
  ({ projectScreen: { ...initialState, ...partial } } as any)

describe('selectProjectScreenDomain', () => {
  it('selects the projectScreen slice', () => {
    expect(selectProjectScreenDomain(withProjectScreen({}))).toEqual(initialState)
  })

  it('returns initialState when key is absent', () => {
    expect(selectProjectScreenDomain({} as any)).toEqual(initialState)
  })
})

describe('makeSelectProjectScreen', () => {
  it('selects the whole projectScreen domain', () => {
    const selector = makeSelectProjectScreen()
    expect(selector(withProjectScreen({}))).toEqual(initialState)
  })
})

describe('individual selectors', () => {
  it('selectStatus', () => {
    const status = { version: '1.0', uptime: 5 }
    expect(selectStatus(withProjectScreen({ status }))).toEqual(status)
  })

  it('selectLoading', () => {
    expect(selectLoading(withProjectScreen({ loading: true }))).toBe(true)
  })

  it('selectError', () => {
    expect(selectError(withProjectScreen({ error: 'bad' }))).toBe('bad')
  })

  it('selectStreaming', () => {
    expect(selectStreaming(withProjectScreen({ streaming: true }))).toBe(true)
  })

  it('selectStreamLog', () => {
    const log = [{ type: 'ping', data: null, timestamp: 1 }]
    expect(selectStreamLog(withProjectScreen({ streamLog: log }))).toEqual(log)
  })
})
