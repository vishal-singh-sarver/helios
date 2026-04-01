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
    expect(screen.getByAltText('Helios logo')).toBeInTheDocument()
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

  it('closes an open menu when clicking outside', async () => {
    const user = userEvent.setup()
    render(
      <Provider store={mockStore}>
        <HomePage />
      </Provider>
    )

    await user.click(screen.getByRole('button', { name: 'File' }))
    expect(screen.getByRole('button', { name: 'Import Project' })).toBeInTheDocument()

    await user.click(screen.getByText('Recent Projects'))
    expect(screen.queryByRole('button', { name: 'Import Project' })).not.toBeInTheDocument()
  })

  it('renders left project options', () => {
    render(
      <Provider store={mockStore}>
        <HomePage />
      </Provider>
    )

    expect(screen.getByRole('button', { name: 'Sidebar Home' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sidebar New Project' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sidebar Open project' })).toBeInTheDocument()
  })

  it('renders empty recent projects area', () => {
    render(
      <Provider store={mockStore}>
        <HomePage />
      </Provider>
    )

    expect(screen.getByText('Recent Projects')).toBeInTheDocument()
    expect(screen.getByText(/Name/)).toBeInTheDocument()
    expect(screen.getByText(/Last Updated/)).toBeInTheDocument()
    expect(screen.getByText(/Size/)).toBeInTheDocument()
    expect(screen.getByText('No Projects Found')).toBeInTheDocument()
  })

  it('opens and closes new project dialog', async () => {
    const user = userEvent.setup()
    render(
      <Provider store={mockStore}>
        <HomePage />
      </Provider>
    )

    await user.click(screen.getByRole('button', { name: 'Sidebar New Project' }))
    expect(screen.getByRole('dialog', { name: 'New Project' })).toBeInTheDocument()
    expect(screen.getAllByPlaceholderText('Enter')).toHaveLength(3)

    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(screen.queryByRole('dialog', { name: 'New Project' })).not.toBeInTheDocument()
  })

  it('shows validation errors for invalid latitude and longitude', async () => {
    const user = userEvent.setup()
    render(
      <Provider store={mockStore}>
        <HomePage />
      </Provider>
    )

    await user.click(screen.getByRole('button', { name: 'Sidebar New Project' }))
    const inputs = screen.getAllByPlaceholderText('Enter')
    await user.type(inputs[0], 'Demo Project')
    await user.type(inputs[1], '120')
    await user.type(inputs[2], '-300')
    await user.click(screen.getByRole('button', { name: 'Create' }))

    expect(
      screen.getByText(
        'Invalid latitude. Enter latitude in decimal degrees. Valid range: -90 <= latitude <= 90. Negative for South, positive for North.'
      )
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        'Invalid longitude. Enter longitude in decimal degrees. Valid range: -180 <= longitude <= 180. Negative for West, positive for East.'
      )
    ).toBeInTheDocument()
  })

  it('shows field guidance when help icon is hovered', async () => {
    const user = userEvent.setup()
    render(
      <Provider store={mockStore}>
        <HomePage />
      </Provider>
    )

    await user.click(screen.getByRole('button', { name: 'Sidebar New Project' }))
    expect(
      screen.queryByText(
        'Enter latitude in decimal degrees. Valid range: -90 <= latitude <= 90. Negative for South, positive for North.'
      )
    ).not.toBeInTheDocument()

    const latitudeHelpButton = screen.getByRole('button', { name: 'Show latitude help' })
    await user.hover(latitudeHelpButton)
    expect(
      screen.getByText(
        'Enter latitude in decimal degrees. Valid range: -90 <= latitude <= 90. Negative for South, positive for North.'
      )
    ).toBeInTheDocument()

    await user.unhover(latitudeHelpButton)
    expect(
      screen.queryByText(
        'Enter latitude in decimal degrees. Valid range: -90 <= latitude <= 90. Negative for South, positive for North.'
      )
    ).not.toBeInTheDocument()
  })
})
