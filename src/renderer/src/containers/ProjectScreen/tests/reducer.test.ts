import projectScreenReducer, { initialState } from '../reducer'
import * as actions from '../actions'
import type { ProjectScreenAction } from '../actions'

describe('projectScreenReducer', () => {
  it('returns the initial state for an unknown action', () => {
    expect(projectScreenReducer(undefined, { type: '@@unknown' } as unknown as ProjectScreenAction)).toEqual(
      initialState
    )
  })

  it('starts with empty coordinate strings', () => {
    expect(initialState.coordinates).toEqual({
      latitude: '',
      longitude: '',
      utcOffset: ''
    })
  })

  describe('SET_LATITUDE', () => {
    it('updates only the latitude field', () => {
      const state = projectScreenReducer(initialState, actions.setLatitude('45.5'))
      expect(state.coordinates.latitude).toBe('45.5')
      expect(state.coordinates.longitude).toBe('')
      expect(state.coordinates.utcOffset).toBe('')
    })

    it('overwrites previous latitude', () => {
      const seeded = { ...initialState, coordinates: { ...initialState.coordinates, latitude: '10' } }
      const state = projectScreenReducer(seeded, actions.setLatitude('20'))
      expect(state.coordinates.latitude).toBe('20')
    })

    it('does not mutate the original state', () => {
      projectScreenReducer(initialState, actions.setLatitude('99'))
      expect(initialState.coordinates.latitude).toBe('')
    })
  })

  describe('SET_LONGITUDE', () => {
    it('updates only the longitude field', () => {
      const state = projectScreenReducer(initialState, actions.setLongitude('-73.9'))
      expect(state.coordinates.longitude).toBe('-73.9')
      expect(state.coordinates.latitude).toBe('')
      expect(state.coordinates.utcOffset).toBe('')
    })
  })

  describe('SET_UTC_OFFSET', () => {
    it('updates only the utcOffset field', () => {
      const state = projectScreenReducer(initialState, actions.setUtcOffset('-5'))
      expect(state.coordinates.utcOffset).toBe('-5')
      expect(state.coordinates.latitude).toBe('')
      expect(state.coordinates.longitude).toBe('')
    })
  })

  describe('SET_COORDINATES (bulk update)', () => {
    it('updates all three fields at once', () => {
      const state = projectScreenReducer(
        initialState,
        actions.setCoordinates({ latitude: '1.1', longitude: '2.2', utcOffset: '3' })
      )
      expect(state.coordinates).toEqual({
        latitude: '1.1',
        longitude: '2.2',
        utcOffset: '3'
      })
    })

    it('merges partial updates, leaving other fields unchanged', () => {
      const seeded = {
        ...initialState,
        coordinates: { latitude: '10', longitude: '20', utcOffset: '1' }
      }
      const state = projectScreenReducer(seeded, actions.setCoordinates({ longitude: '99' }))
      expect(state.coordinates).toEqual({
        latitude: '10',
        longitude: '99',
        utcOffset: '1'
      })
    })

    it('accepts an empty payload as a no-op', () => {
      const seeded = {
        ...initialState,
        coordinates: { latitude: '1', longitude: '2', utcOffset: '3' }
      }
      const state = projectScreenReducer(seeded, actions.setCoordinates({}))
      expect(state.coordinates).toEqual(seeded.coordinates)
    })
  })
})
