import activeProjectReducer, {
  CLEAR_ACTIVE_PROJECT,
  SET_ACTIVE_PROJECT,
  clearActiveProject,
  initialState,
  selectActiveProjectId,
  setActiveProject
} from '../activeProjectReducer'

const STORAGE_KEY = 'helios:activeProjectId'

describe('activeProjectReducer', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  // ── Action creators ──

  it('setActiveProject returns the correct action type and payload', () => {
    const action = setActiveProject('abc-123')
    expect(action).toEqual({ type: SET_ACTIVE_PROJECT, payload: 'abc-123' })
  })

  it('clearActiveProject returns the correct action type', () => {
    const action = clearActiveProject()
    expect(action).toEqual({ type: CLEAR_ACTIVE_PROJECT })
  })

  // ── Side effect: localStorage ──

  it('setActiveProject persists the id to localStorage', () => {
    setActiveProject('uuid-42')
    expect(localStorage.getItem(STORAGE_KEY)).toBe('uuid-42')
  })

  it('clearActiveProject removes the id from localStorage', () => {
    localStorage.setItem(STORAGE_KEY, 'uuid-42')
    clearActiveProject()
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
  })

  // ── Reducer ──

  it('returns the initial state when called with an undefined action', () => {
    const state = activeProjectReducer(undefined, { type: '@@INIT' } as never)
    expect(state).toEqual(initialState)
  })

  it('handles SET_ACTIVE_PROJECT', () => {
    const next = activeProjectReducer(initialState, setActiveProject('id-1'))
    expect(next.projectId).toBe('id-1')
  })

  it('handles CLEAR_ACTIVE_PROJECT', () => {
    const state = activeProjectReducer(initialState, setActiveProject('id-1'))
    const next = activeProjectReducer(state, clearActiveProject())
    expect(next.projectId).toBeNull()
  })

  it('returns the current state for unknown action types', () => {
    const state = { projectId: 'keep' }
    const next = activeProjectReducer(state, { type: 'UNKNOWN' } as never)
    expect(next).toBe(state)
  })

  // ── Selector ──

  it('selectActiveProjectId returns the projectId from state', () => {
    expect(selectActiveProjectId({ activeProject: { projectId: 'x' } })).toBe('x')
  })

  it('selectActiveProjectId is defensive against a missing slice', () => {
    // Test stores / mocks may not inject the slice — the selector must not crash.
    expect(selectActiveProjectId({})).toBeNull()
  })
})
