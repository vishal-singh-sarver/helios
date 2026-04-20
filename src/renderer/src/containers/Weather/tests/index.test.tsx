import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { createMockStore } from '@renderer/tests/mockStore'
import { Weather } from '../index'

function renderWeather(): ReturnType<typeof render> {
  return render(
    <Provider store={createMockStore()}>
      <Weather />
    </Provider>
  )
}

describe('<Weather />', () => {
  it('renders without error', () => {
    renderWeather()
  })

  // Placeholder content today; update when real Weather UI lands.
  it('renders the placeholder label', () => {
    renderWeather()
    expect(screen.getByText('Weather')).toBeInTheDocument()
  })
})
