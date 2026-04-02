import React from 'react'
import { render } from '@testing-library/react'
import ToolTip from '../index'

describe('<ToolTip />', () => {
  it('renders without error', () => {
    render(<ToolTip />)
  })

  it('should match the snapshot', () => {
    const { container } = render(<ToolTip />)
    expect(container.firstChild).toMatchSnapshot()
  })
})
