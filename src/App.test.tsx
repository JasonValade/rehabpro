import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach } from 'vitest'
import App from './App'

describe('App', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('renders the RehabPro sign-in screen', () => {
    render(<App />)
    expect(screen.getByText('REHAB')).toBeInTheDocument()
    expect(screen.getByText('PRO')).toBeInTheDocument()
    expect(screen.getByText('Returning patient demo')).toBeInTheDocument()
    expect(screen.queryByText('New intake patient demo')).not.toBeInTheDocument()
    expect(screen.getByText('Physical therapist demo')).toBeInTheDocument()
  })

  it('opens the desktop PT portal demo', async () => {
    const user = userEvent.setup()

    render(<App />)
    await user.click(screen.getByRole('button', { name: /physical therapist demo/i }))

    expect(screen.getByRole('heading', { name: /patients/i })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /jason v/i }))
    expect(screen.getByText('Jason V.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /back to patients/i })).toBeInTheDocument()
    expect(screen.getByText('PT portal')).toBeInTheDocument()
  })

  it('lets the PT sidebar options open their portal sections', async () => {
    const user = userEvent.setup()

    render(<App />)
    await user.click(screen.getByRole('button', { name: /physical therapist demo/i }))

    await user.click(screen.getByRole('button', { name: /^review$/i }))
    expect(screen.getByRole('heading', { name: /review queue/i })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /^messages$/i }))
    expect(screen.getByRole('heading', { name: /^messages$/i })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /exercise plans/i }))
    expect(screen.getByRole('heading', { name: /exercise plans/i })).toBeInTheDocument()

    await user.click(screen.getByText('Sara K.'))
    expect(screen.getByRole('tab', { name: /plan/i })).toHaveAttribute('aria-selected', 'true')

    await user.click(screen.getByRole('button', { name: /^patients$/i }))
    expect(screen.getByRole('heading', { name: /^patients$/i })).toBeInTheDocument()
  })

  it('shows patient reports in the PT messages inbox and thread', async () => {
    const user = userEvent.setup()

    render(<App />)
    await user.click(screen.getByRole('button', { name: /physical therapist demo/i }))

    await user.click(screen.getByRole('button', { name: /^messages$/i }))
    await user.click(screen.getByRole('button', { name: /Sara K\.[\s\S]*Bulgarian Split Squat/i }))

    expect(screen.getByRole('tab', { name: /messages/i })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByText(/Symptom report/i)).toBeInTheDocument()
    expect(screen.getByText('Bulgarian Split Squat')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /mark as read/i }))

    expect(screen.getByText('Reviewed')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /mark as read/i })).not.toBeInTheDocument()
  })
})
