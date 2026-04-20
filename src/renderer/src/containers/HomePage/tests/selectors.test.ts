import makeSelectHomePage, {
  selectHomePageDomain,
  selectCreateProject,
  selectRecentProjects,
  selectDeleteProject,
  selectStreaming
} from '../selectors'
import { initialState, initialCreateProjectState, initialRecentProjectsState, initialDeleteProjectState } from '../reducer'

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

describe('selectCreateProject', () => {
  it('returns the createProject sub-state', () => {
    expect(selectCreateProject(withHomePage({}))).toEqual(initialCreateProjectState)
  })

  it('reflects loading and success', () => {
    const cp = { ...initialCreateProjectState, loading: true, success: false }
    expect(selectCreateProject(withHomePage({ createProject: cp }))).toEqual(cp)
  })
})

describe('selectRecentProjects', () => {
  it('returns the recentProjects sub-state', () => {
    expect(selectRecentProjects(withHomePage({}))).toEqual(initialRecentProjectsState)
  })

  it('reflects data', () => {
    const rp = { ...initialRecentProjectsState, data: [{ id: '1', name: 'Test', last_updated: '2026-01-01', size: 1024 }] }
    expect(selectRecentProjects(withHomePage({ recentProjects: rp }))).toEqual(rp)
  })
})

describe('selectDeleteProject', () => {
  it('returns the deleteProject sub-state', () => {
    expect(selectDeleteProject(withHomePage({}))).toEqual(initialDeleteProjectState)
  })

  it('reflects inFlightIds', () => {
    const dp = { ...initialDeleteProjectState, inFlightIds: ['abc'] }
    expect(selectDeleteProject(withHomePage({ deleteProject: dp }))).toEqual(dp)
  })
})

describe('selectStreaming', () => {
  it('returns streaming state', () => {
    const result = selectStreaming(withHomePage({ streaming: true, streamLog: [] }))
    expect(result.streaming).toBe(true)
    expect(result.streamLog).toEqual([])
  })

  it('includes streamLog entries', () => {
    const log = [{ type: 'ping', data: null, timestamp: 1 }]
    const result = selectStreaming(withHomePage({ streaming: false, streamLog: log }))
    expect(result.streaming).toBe(false)
    expect(result.streamLog).toEqual(log)
  })
})
