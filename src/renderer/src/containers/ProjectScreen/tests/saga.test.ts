import projectScreenSaga from '../saga'

describe('projectScreenSaga', () => {
  it('is a generator function', () => {
    // Saga is currently a no-op watcher (coordinate state is synchronous).
    // When real workers are added here, replace this test with effect-by-effect
    // assertions using `saga.next()` or redux-saga-test-plan.
    const iter = projectScreenSaga()
    expect(iter).toBeDefined()
    expect(typeof iter.next).toBe('function')
  })

  it('completes immediately (no pending effects)', () => {
    const iter = projectScreenSaga()
    expect(iter.next()).toEqual({ value: undefined, done: true })
  })
})
