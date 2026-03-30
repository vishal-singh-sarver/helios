import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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
  it('renders top toolbar actions and search input', () => {
    render(
      <Provider store={mockStore}>
        <HomePage />
      </Provider>
    )

    expect(screen.getByRole('button', { name: 'File' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'View' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Help' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Tools' })).toBeInTheDocument()
    expect(screen.getByLabelText('Search projects')).toBeInTheDocument()
  })

  it('shows demo submenu items when File menu is clicked', async () => {
    const user = userEvent.setup()
    render(
      <Provider store={mockStore}>
        <HomePage />
      </Provider>
    )

    await user.click(screen.getByRole('button', { name: 'File' }))
    expect(screen.getAllByRole('button', { name: 'New Project' }).length).toBeGreaterThan(0)
    expect(screen.getByRole('button', { name: 'Open Project' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Import Project' })).toBeInTheDocument()
  })

  it('renders left project options', () => {
    render(
      <Provider store={mockStore}>
        <HomePage />
      </Provider>
    )

    expect(screen.getByRole('button', { name: 'Home' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'New Project' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Open project' })).toBeInTheDocument()
  })

  it('renders empty recent projects area', () => {
    render(
      <Provider store={mockStore}>
        <HomePage />
      </Provider>
    )

    expect(screen.getByText('Recent Projects')).toBeInTheDocument()
    expect(screen.getByText('Name ↑↓')).toBeInTheDocument()
    expect(screen.getByText('Last Updated ↑↓')).toBeInTheDocument()
    expect(screen.getByText('Size ↑↓')).toBeInTheDocument()
    expect(screen.getByText('No Projects Found')).toBeInTheDocument()
  })

  it('opens and closes new project dialog', async () => {
    const user = userEvent.setup()
    render(
      <Provider store={mockStore}>
        <HomePage />
      </Provider>
    )

    await user.click(screen.getAllByRole('button', { name: 'New Project' })[0])
    expect(screen.getByRole('dialog', { name: 'New Project' })).toBeInTheDocument()
    expect(screen.getAllByPlaceholderText('Enter')).toHaveLength(3)

    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(screen.queryByRole('dialog', { name: 'New Project' })).not.toBeInTheDocument()
  })
})
