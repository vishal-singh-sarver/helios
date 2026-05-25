import { render, screen } from '@testing-library/react'
import Stepper, { STEPS } from '../Stepper'

describe('<Stepper />', () => {
  it('renders all four step labels', () => {
    render(<Stepper currentIndex={0} />)
    // testing-library normalises whitespace, so the hard \n in the label
    // collapses back to a single space when matching.
    expect(screen.getByText('File Preview')).toBeInTheDocument()
    expect(screen.getByText('Data Preview')).toBeInTheDocument()
    expect(screen.getByText('Date/ Time')).toBeInTheDocument()
    expect(screen.getByText('Review & Import')).toBeInTheDocument()
  })

  it('exports a STEPS constant of length 4', () => {
    expect(STEPS).toHaveLength(4)
    expect(STEPS.map((s) => s.key)).toEqual(['file', 'data', 'datetime', 'review'])
  })

  it('marks the current step with active styling', () => {
    const { container } = render(<Stepper currentIndex={1} />)
    const activeLabel = container.querySelector('.font-semibold.text-white')
    // textContent collapses the literal \n to a regular space at read time
    expect(activeLabel?.textContent).toContain('Preview')
  })

  it('marks earlier steps as done (with check icon)', () => {
    const { container } = render(<Stepper currentIndex={2} />)
    // Done steps render a CheckIcon (now an <img> sourced from /assets).
    // There are currentIndex done nodes (2 in this case).
    const checkImgs = container.querySelectorAll('img')
    expect(checkImgs.length).toBeGreaterThanOrEqual(2)
  })

  it('renders correctly at step index 0 (snapshot)', () => {
    const { container } = render(<Stepper currentIndex={0} />)
    expect(container.firstChild).toMatchSnapshot()
  })

  it('renders correctly at step index 3 (final, snapshot)', () => {
    const { container } = render(<Stepper currentIndex={3} />)
    expect(container.firstChild).toMatchSnapshot()
  })
})
