import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('renders the RehabPro sign-in screen', () => {
    render(<App />)
    expect(screen.getByText('REHAB')).toBeInTheDocument()
    expect(screen.getByText('PRO')).toBeInTheDocument()
    expect(screen.getByText('Returning patient')).toBeInTheDocument()
    expect(screen.getByText('New intake patient')).toBeInTheDocument()
  })
})
