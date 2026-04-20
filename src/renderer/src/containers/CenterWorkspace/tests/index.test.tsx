import { render, screen, fireEvent } from '@testing-library/react'
import { Provider } from 'react-redux'
import { createMockStore } from '@renderer/tests/mockStore'
import { CenterWorkspace } from '../index'

// Mock weather icon import so it resolves to a plain string in jsdom.
vi.mock('@renderer/assets/weather.svg', () => ({ default: 'weather.svg' }))

// Mock the Weather container — its own tests cover its internals. Here we
// only care that CenterWorkspace renders it in the active-tab slot.
vi.mock('@renderer/containers/Weather', () => ({
  default: () => <div data-testid="weather-content">Weather</div>
}))

function renderWorkspace(): ReturnType<typeof render> {
  return render(
    <Provider store={createMockStore()}>
      <CenterWorkspace />
    </Provider>
  )
}

describe('<CenterWorkspace />', () => {
  it('renders without error', () => {
    renderWorkspace()
  })

  it('renders the Weather tab button', () => {
    renderWorkspace()
    expect(screen.getByRole('button', { name: /weather/i })).toBeInTheDocument()
  })

  it('does not render Weather content before any tab is selected', () => {
    renderWorkspace()
    expect(screen.queryByTestId('weather-content')).not.toBeInTheDocument()
  })

  it('renders Weather content after clicking the Weather button', () => {
    renderWorkspace()
    fireEvent.click(screen.getByRole('button', { name: /weather/i }))
    expect(screen.getByTestId('weather-content')).toBeInTheDocument()
  })

  it('marks the Weather button as pressed when active', () => {
    renderWorkspace()
    const button = screen.getByRole('button', { name: /weather/i })
    expect(button).toHaveAttribute('aria-pressed', 'false')
    fireEvent.click(button)
    expect(button).toHaveAttribute('aria-pressed', 'true')
  })
})
