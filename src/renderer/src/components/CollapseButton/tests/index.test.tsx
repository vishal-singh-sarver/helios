import { render, screen, fireEvent } from '@testing-library/react'
import CollapseButton from '../index'

describe('<CollapseButton />', () => {
  it('renders without error', () => {
    render(<CollapseButton collapsed={false} side="left" onToggle={vi.fn()} />)
  })

  it('uses the "Collapse panel" label when expanded', () => {
    render(<CollapseButton collapsed={false} side="left" onToggle={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Collapse panel' })).toBeInTheDocument()
  })

  it('uses the "Expand panel" label when collapsed', () => {
    render(<CollapseButton collapsed={true} side="left" onToggle={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Expand panel' })).toBeInTheDocument()
  })

  it('fires onToggle when clicked', () => {
    const onToggle = vi.fn()
    render(<CollapseButton collapsed={false} side="left" onToggle={onToggle} />)
    fireEvent.click(screen.getByRole('button'))
    expect(onToggle).toHaveBeenCalledTimes(1)
  })

  // Chevron direction encodes the ACTION, not the current state:
  //   LeftPanel expanded → chevron points left (click to collapse left).
  //   LeftPanel collapsed → chevron points right (click to expand right).
  //   RightPanel is mirrored.
  it('points the chevron left for an expanded LeftPanel', () => {
    const { container } = render(
      <CollapseButton collapsed={false} side="left" onToggle={vi.fn()} />
    )
    const svg = container.querySelector('svg')
    expect(svg).toHaveStyle({ transform: 'rotate(0deg)' })
  })

  it('points the chevron right for a collapsed LeftPanel', () => {
    const { container } = render(
      <CollapseButton collapsed={true} side="left" onToggle={vi.fn()} />
    )
    const svg = container.querySelector('svg')
    expect(svg).toHaveStyle({ transform: 'rotate(180deg)' })
  })

  it('mirrors direction for RightPanel — expanded points right', () => {
    const { container } = render(
      <CollapseButton collapsed={false} side="right" onToggle={vi.fn()} />
    )
    const svg = container.querySelector('svg')
    expect(svg).toHaveStyle({ transform: 'rotate(180deg)' })
  })

  it('mirrors direction for RightPanel — collapsed points left', () => {
    const { container } = render(
      <CollapseButton collapsed={true} side="right" onToggle={vi.fn()} />
    )
    const svg = container.querySelector('svg')
    expect(svg).toHaveStyle({ transform: 'rotate(0deg)' })
  })
})
