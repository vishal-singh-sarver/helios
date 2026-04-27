import projectScreenSaga from '../saga'

describe('projectScreenSaga (stub)', () => {
  // Step 2 ships a no-op saga so the container's useInjectSaga call still
  // resolves. Workers come in step 3.
  it('is a generator that completes immediately', () => {
    const gen = projectScreenSaga()
    expect(gen).toBeDefined()
    expect(typeof gen.next).toBe('function')
    expect(gen.next().done).toBe(true)
  })
})
