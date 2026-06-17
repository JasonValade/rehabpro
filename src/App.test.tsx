import { render, screen, within } from '@testing-library/react'
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

    expect(screen.getByRole('heading', { name: /today/i })).toBeInTheDocument()
    expect(screen.getByText(/priority queue/i)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /active patients/i }))
    await user.click(screen.getByRole('button', { name: /jason v/i }))
    expect(screen.getAllByText('Jason V.').length).toBeGreaterThan(0)
    expect(screen.getByRole('button', { name: /back to dashboard/i })).toBeInTheDocument()
    expect(screen.getByText('PT portal')).toBeInTheDocument()
  })

  it('lets priority queue cards be marked reviewed', async () => {
    const user = userEvent.setup()

    render(<App />)
    await user.click(screen.getByRole('button', { name: /physical therapist demo/i }))

    const priorityQueue = screen.getByText(/priority queue/i).closest('section')
    expect(priorityQueue).not.toBeNull()

    const reviewButtonsBefore = within(priorityQueue as HTMLElement).getAllByRole('button', { name: /mark .* priority item reviewed/i })
    expect(reviewButtonsBefore).toHaveLength(2)

    await user.click(within(priorityQueue as HTMLElement).getByRole('button', { name: /mark sara k\.'s priority item reviewed/i }))

    expect(within(priorityQueue as HTMLElement).queryByText(/Bulgarian Split Squat: pain 3\/5/i)).not.toBeInTheDocument()
    expect(within(priorityQueue as HTMLElement).getAllByRole('button', { name: /mark .* priority item reviewed/i })).toHaveLength(reviewButtonsBefore.length)

    await user.click(within(priorityQueue as HTMLElement).getByRole('button', { name: /mark mike t\.'s priority item reviewed/i }))

    expect(within(priorityQueue as HTMLElement).queryByText(/high symptom report/i)).not.toBeInTheDocument()
  })

  it('uses dashboard progression checks for pass/fail milestone decisions', async () => {
    const user = userEvent.setup()

    render(<App />)
    await user.click(screen.getByRole('button', { name: /physical therapist demo/i }))

    expect(screen.getByRole('heading', { name: /today/i })).toBeInTheDocument()
    expect(screen.getByText(/progression checks/i)).toBeInTheDocument()
    expect(screen.getAllByText(/pain-free jog/i).length).toBeGreaterThan(0)
    expect(screen.getByText(/single-leg tendon loading/i)).toBeInTheDocument()
    expect(screen.queryByText(/no recent check-in/i)).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /pass jason v\.'s pain-free jog milestone/i }))
    expect(screen.queryByRole('button', { name: /pass jason v\.'s pain-free jog milestone/i })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /fail sara k\.'s single-leg tendon loading milestone/i }))
    expect(screen.queryByRole('button', { name: /fail sara k\.'s single-leg tendon loading milestone/i })).not.toBeInTheDocument()
  })

  it('lets the PT sidebar options open their portal sections', async () => {
    const user = userEvent.setup()

    render(<App />)
    await user.click(screen.getByRole('button', { name: /physical therapist demo/i }))

    expect(screen.getByRole('heading', { name: /today/i })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /^messages$/i }))
    expect(screen.getByRole('heading', { name: /^messages$/i })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /exercise plans/i }))
    expect(screen.getByRole('heading', { name: /exercise plans/i })).toBeInTheDocument()

    await user.click(screen.getByText('Sara K.'))
    expect(screen.getByRole('tab', { name: /plan/i })).toHaveAttribute('aria-selected', 'true')

    await user.click(screen.getByRole('button', { name: /active patients/i }))
    expect(screen.getByRole('heading', { name: /active patients/i })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /^dashboard$/i }))
    expect(screen.getByRole('heading', { name: /^today$/i })).toBeInTheDocument()
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
