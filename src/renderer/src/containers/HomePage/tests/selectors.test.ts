import makeSelectHomePage, {
  selectHomePageDomain,
  selectStatus,
  selectLoading,
  selectError,
  selectStreaming,
  selectStreamLog
} from '../selectors'
import { initialState } from '../reducer'

const withHomePage = (partial: Partial<typeof initialState>) =>
  ({ homePage: { ...initialState, ...partial } } as any)

describe('selectHomePageDomain', () => {
  it('selects the homePage slice', () => {
    expect(selectHomePageDomain(withHomePage({}))).toEqual(initialState)
  })

  it('returns initialState when key is absent', () => {
    expect(selectHomePageDomain({} as any)).toEqual(initialState)
  })
})

describe('makeSelectHomePage', () => {
  it('selects the whole homePage domain', () => {
    const selector = makeSelectHomePage()
    expect(selector(withHomePage({}))).toEqual(initialState)
  })
})

describe('individual selectors', () => {
  it('selectStatus', () => {
    const status = { version: '1.0', uptime: 5 }
    expect(selectStatus(withHomePage({ status }))).toEqual(status)
  })

  it('selectLoading', () => {
    expect(selectLoading(withHomePage({ loading: true }))).toBe(true)
    expect(selectLoading(withHomePage({ loading: false }))).toBe(false)
  })

  it('selectError', () => {
    expect(selectError(withHomePage({ error: 'bad' }))).toBe('bad')
    expect(selectError(withHomePage({ error: null }))).toBeNull()
  })

  it('selectStreaming', () => {
    expect(selectStreaming(withHomePage({ streaming: true }))).toBe(true)
  })

  it('selectStreamLog', () => {
    const log = [{ type: 'ping', data: null, timestamp: 1 }]
    expect(selectStreamLog(withHomePage({ streamLog: log }))).toEqual(log)
  })
})
