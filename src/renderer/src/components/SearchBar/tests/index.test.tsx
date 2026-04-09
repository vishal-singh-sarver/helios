import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SearchBar from '../index'

function ControlledSearchBar(): React.JSX.Element {
  const [value, setValue] = React.useState('')

  return (
    <SearchBar
      ariaLabel="Search projects"
      icon="search-icon.svg"
      value={value}
      placeholder="Search..."
      onChange={setValue}
    />
  )
}

describe('<SearchBar />', () => {
  it('renders the input with the provided label and placeholder', () => {
    render(
      <SearchBar
        ariaLabel="Search projects"
        icon="search-icon.svg"
        value=""
        placeholder="Search..."
        onChange={vi.fn()}
      />
    )

    expect(screen.getByLabelText('Search projects')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument()
  })

  it('calls onChange with the latest input value', async () => {
    const user = userEvent.setup()
    render(<ControlledSearchBar />)

    await user.type(screen.getByLabelText('Search projects'), 'helios')

    expect(screen.getByLabelText('Search projects')).toHaveValue('helios')
  })
})
