import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('renders the RehabPro sign-in screen', () => {
    render(<App />)
    expect(screen.getByText(/rehabpro/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })
})
