import * as actions from '../actions'
import {
  SET_LATITUDE,
  SET_LONGITUDE,
  SET_UTC_OFFSET,
  SET_COORDINATES
} from '../constants'

describe('ProjectScreen actions', () => {
  it('setLatitude returns a SET_LATITUDE action with the given value', () => {
    expect(actions.setLatitude('45.5')).toEqual({
      type: SET_LATITUDE,
      payload: '45.5'
    })
  })

  it('setLongitude returns a SET_LONGITUDE action with the given value', () => {
    expect(actions.setLongitude('-73.9')).toEqual({
      type: SET_LONGITUDE,
      payload: '-73.9'
    })
  })

  it('setUtcOffset returns a SET_UTC_OFFSET action with the given value', () => {
    expect(actions.setUtcOffset('-5')).toEqual({
      type: SET_UTC_OFFSET,
      payload: '-5'
    })
  })

  it('setCoordinates returns a SET_COORDINATES action with the full payload', () => {
    const payload = { latitude: '1.1', longitude: '2.2', utcOffset: '3' }
    expect(actions.setCoordinates(payload)).toEqual({
      type: SET_COORDINATES,
      payload
    })
  })

  it('setCoordinates accepts partial payloads', () => {
    expect(actions.setCoordinates({ longitude: '99' })).toEqual({
      type: SET_COORDINATES,
      payload: { longitude: '99' }
    })
  })

  it('setCoordinates accepts an empty object', () => {
    expect(actions.setCoordinates({})).toEqual({
      type: SET_COORDINATES,
      payload: {}
    })
  })

  it('actions preserve empty-string values (do not coerce)', () => {
    expect(actions.setLatitude('')).toEqual({ type: SET_LATITUDE, payload: '' })
  })
})
