import { fireEvent, render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { applyMiddleware, combineReducers, createStore } from 'redux'
import type { Reducer, UnknownAction } from 'redux'
import createSagaMiddleware from 'redux-saga'
import { ProjectScreen } from '../index'
import projectScreenReducer from '../reducer'
import navigationReducer from '@renderer/store/navigationReducer'
import type { InjectableStore } from 'store/configureStore'

/**
 * Builds a real-ish store so the container can inject its reducer and saga,
 * then dispatch real actions through it. Mirrors the production store shape
 * just enough for tests.
 */
function buildStore(): InjectableStore {
  const saga = createSagaMiddleware()
  const staticReducers = {
    navigation: navigationReducer as Reducer<unknown, UnknownAction>,
    projectScreen: projectScreenReducer as Reducer<unknown, UnknownAction>
  }

  const store = createStore(
    combineReducers(staticReducers),
    applyMiddleware(saga)
  ) as unknown as InjectableStore

  store.injectedReducers = staticReducers
  store.injectedSagas = {}
  store.createReducer = (injected) => combineReducers({ ...staticReducers, ...(injected ?? {}) })
  store.runSaga = saga.run
  return store
}

describe('<ProjectScreen />', () => {
  it('renders without error', () => {
    render(
      <Provider store={buildStore()}>
        <ProjectScreen />
      </Provider>
    )
  })

  it('renders three labeled fields: Latitude, Longitude, UTC Offset', () => {
    render(
      <Provider store={buildStore()}>
        <ProjectScreen />
      </Provider>
    )
    expect(screen.getByLabelText('Latitude')).toBeInTheDocument()
    expect(screen.getByLabelText('Longitude')).toBeInTheDocument()
    expect(screen.getByLabelText('UTC Offset')).toBeInTheDocument()
  })

  it('initial latitude/longitude inputs are empty', () => {
    render(
      <Provider store={buildStore()}>
        <ProjectScreen />
      </Provider>
    )
    expect(screen.getByLabelText('Latitude')).toHaveValue('')
    expect(screen.getByLabelText('Longitude')).toHaveValue('')
  })

  it('typing into Latitude dispatches and reflects the new value', () => {
    render(
      <Provider store={buildStore()}>
        <ProjectScreen />
      </Provider>
    )
    const latInput = screen.getByLabelText('Latitude')
    fireEvent.change(latInput, { target: { value: '45.5' } })
    expect(latInput).toHaveValue('45.5')
  })

  it('typing into Longitude dispatches and reflects the new value', () => {
    render(
      <Provider store={buildStore()}>
        <ProjectScreen />
      </Provider>
    )
    const lonInput = screen.getByLabelText('Longitude')
    fireEvent.change(lonInput, { target: { value: '-73.9' } })
    expect(lonInput).toHaveValue('-73.9')
  })

  it('UTC Offset is rendered disabled (read-only)', () => {
    render(
      <Provider store={buildStore()}>
        <ProjectScreen />
      </Provider>
    )
    const utcInput = screen.getByLabelText('UTC Offset') as HTMLInputElement
    expect(utcInput.disabled).toBe(true)
  })

  it('renders tooltip help icons for Latitude and Longitude', () => {
    render(
      <Provider store={buildStore()}>
        <ProjectScreen />
      </Provider>
    )
    expect(screen.getByLabelText('Show latitude help')).toBeInTheDocument()
    expect(screen.getByLabelText('Show longitude help')).toBeInTheDocument()
  })

  it('does not render a tooltip for UTC Offset (formula-driven field)', () => {
    render(
      <Provider store={buildStore()}>
        <ProjectScreen />
      </Provider>
    )
    expect(screen.queryByLabelText('Show utc help')).not.toBeInTheDocument()
  })

  it('Latitude gains red border when given an out-of-range value', () => {
    render(
      <Provider store={buildStore()}>
        <ProjectScreen />
      </Provider>
    )
    const latInput = screen.getByLabelText('Latitude')
    fireEvent.change(latInput, { target: { value: '999' } })
    expect(latInput).toHaveAttribute('aria-invalid', 'true')
  })

  it('Latitude has no red border for valid input', () => {
    render(
      <Provider store={buildStore()}>
        <ProjectScreen />
      </Provider>
    )
    const latInput = screen.getByLabelText('Latitude')
    fireEvent.change(latInput, { target: { value: '45.5' } })
    expect(latInput).not.toHaveAttribute('aria-invalid')
  })

  it('Latitude has no red border while empty (neutral state)', () => {
    render(
      <Provider store={buildStore()}>
        <ProjectScreen />
      </Provider>
    )
    expect(screen.getByLabelText('Latitude')).not.toHaveAttribute('aria-invalid')
  })

  it('Longitude gains red border when given an out-of-range value', () => {
    render(
      <Provider store={buildStore()}>
        <ProjectScreen />
      </Provider>
    )
    const lonInput = screen.getByLabelText('Longitude')
    fireEvent.change(lonInput, { target: { value: '999' } })
    expect(lonInput).toHaveAttribute('aria-invalid', 'true')
  })

  it('Longitude has no red border for valid negative input', () => {
    render(
      <Provider store={buildStore()}>
        <ProjectScreen />
      </Provider>
    )
    const lonInput = screen.getByLabelText('Longitude')
    fireEvent.change(lonInput, { target: { value: '-179.9' } })
    expect(lonInput).not.toHaveAttribute('aria-invalid')
  })
})
