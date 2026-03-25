import React from 'react'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { createStore, UnknownAction, Reducer } from 'redux'
import { HomePage } from '../index'
import { InjectableStore } from 'store/configureStore'

const mockStore = createStore((state = {}) => state) as InjectableStore
mockStore.injectedReducers = {}
mockStore.injectedSagas = {}
mockStore.runSaga = () => ({ cancel: () => {}, error: () => {}, result: () => {}, toPromise: () => Promise.resolve() } as any)
mockStore.createReducer = () => ((state = {}) => state) as Reducer<unknown, UnknownAction>

describe('<HomePage />', () => {
  it('renders without error', () => {
    render(
      <Provider store={mockStore}>
        <HomePage />
      </Provider>
    )
  })

  it('displays the header message', () => {
    render(
      <Provider store={mockStore}>
        <HomePage />
      </Provider>
    )
    expect(screen.getByText('Welcome to Electron App')).toBeInTheDocument()
  })

  it('should match the snapshot', () => {
    const { container } = render(
      <Provider store={mockStore}>
        <HomePage />
      </Provider>
    )
    expect(container.firstChild).toMatchSnapshot()
  })
})
