import makeSelectProjectScreen, {
  selectProjectScreenDomain,
  selectCoordinates,
  selectLatitude,
  selectLongitude,
  selectUtcOffset
} from '../selectors'
import { initialState } from '../reducer'

const withProjectScreen = (partial: Partial<typeof initialState>): any => ({
  projectScreen: { ...initialState, ...partial }
})

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

describe('selectCoordinates', () => {
  it('returns all three coordinate fields', () => {
    const coords = { latitude: '10', longitude: '20', utcOffset: '1' }
    expect(selectCoordinates(withProjectScreen({ coordinates: coords }))).toEqual(coords)
  })
})

describe('individual coordinate selectors', () => {
  it('selectLatitude returns the latitude string', () => {
    const coords = { latitude: '45.5', longitude: '', utcOffset: '' }
    expect(selectLatitude(withProjectScreen({ coordinates: coords }))).toBe('45.5')
  })

  it('selectLongitude returns the longitude string', () => {
    const coords = { latitude: '', longitude: '-73.9', utcOffset: '' }
    expect(selectLongitude(withProjectScreen({ coordinates: coords }))).toBe('-73.9')
  })

  it('selectUtcOffset returns the utcOffset string', () => {
    const coords = { latitude: '', longitude: '', utcOffset: '-5' }
    expect(selectUtcOffset(withProjectScreen({ coordinates: coords }))).toBe('-5')
  })

  it('returns empty strings when state is fresh', () => {
    expect(selectLatitude(withProjectScreen({}))).toBe('')
    expect(selectLongitude(withProjectScreen({}))).toBe('')
    expect(selectUtcOffset(withProjectScreen({}))).toBe('')
  })
})
