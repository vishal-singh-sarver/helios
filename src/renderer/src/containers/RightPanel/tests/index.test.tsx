import { render, screen, fireEvent } from '@testing-library/react'
import { Provider } from 'react-redux'
import { createMockStore } from '@renderer/tests/mockStore'
import RightPanel from '../index'

function renderPanel(): ReturnType<typeof render> {
  return render(
    <Provider store={createMockStore()}>
      <RightPanel />
    </Provider>
  )
}

describe('<RightPanel />', () => {
  it('renders without error', () => {
    renderPanel()
  })

  it('starts expanded (Collapse button visible)', () => {
    renderPanel()
    expect(screen.getByRole('button', { name: 'Collapse panel' })).toBeInTheDocument()
  })

  it('switches to "Expand panel" after clicking Collapse', () => {
    renderPanel()
    fireEvent.click(screen.getByRole('button', { name: 'Collapse panel' }))
    expect(screen.getByRole('button', { name: 'Expand panel' })).toBeInTheDocument()
  })

  it('toggles back to expanded on a second click', () => {
    renderPanel()
    fireEvent.click(screen.getByRole('button', { name: 'Collapse panel' }))
    fireEvent.click(screen.getByRole('button', { name: 'Expand panel' }))
    expect(screen.getByRole('button', { name: 'Collapse panel' })).toBeInTheDocument()
  })
})
