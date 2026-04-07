import React from 'react'
import { render } from '@testing-library/react'
import Tooltip from '../index'

describe('<Tooltip />', () => {
  it('renders without error', () => {
    render(<Tooltip />)
  })

  it('should match the snapshot', () => {
    const { container } = render(<Tooltip />)
    expect(container.firstChild).toMatchSnapshot()
  })
})
