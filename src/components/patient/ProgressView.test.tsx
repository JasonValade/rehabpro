import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProgressView } from './ProgressView.jsx'

describe('ProgressView', () => {
  it('renders sparse saved sessions without invalid chart values', () => {
    const { container } = render(
      <ProgressView
        patientProfile={{ progressSubhead: 'Week 1 test profile', phaseLabel: 'Phase 1 of 4', rehabPhase: 'Protection' }}
        milestones={[]}
        progressData={[]}
        completionHistory={[]}
        checkIns={[
          {
            patientId: 'pt_test',
            type: 'session',
            ts: new Date('2026-06-15T12:00:00Z').getTime(),
            pain: 4,
            swelling: 2,
            difficulty: 6,
            done: 1,
            total: 4,
          },
        ]}
      />,
    )

    expect(screen.getByText('ACL + Meniscus Recovery')).toBeInTheDocument()
    expect(screen.getByText('Watch')).toBeInTheDocument()
    expect(screen.getByText('Recommended next step')).toBeInTheDocument()
    expect(screen.getAllByText('4/10').length).toBeGreaterThan(0)
    expect(screen.getByText('25%')).toBeInTheDocument()
    expect(container.innerHTML).not.toMatch(/NaN|Infinity/)
  })

  it('shows trend tabs and ready-for-test milestone states', async () => {
    const user = userEvent.setup()
    render(
      <ProgressView
        patientProfile={{ injuryType: 'ACL + Meniscus', week: 14, goal: 'Return to Basketball' }}
        milestones={[
          { id: 1, label: '120° Flexion', achieved: true, week: 10 },
          { id: 2, label: 'Jog Progression', achieved: false, week: 14 },
        ]}
        progressData={[
          { label: 'Wk 10', pain: 5, swelling: 3, rom: 114, difficulty: 6, completion: 70 },
          { label: 'Now', pain: 2, swelling: 1, rom: 124, difficulty: 4, completion: 88 },
        ]}
        completionHistory={[{ day: 'Today', done: 5, total: 5 }]}
        checkIns={[]}
      />,
    )

    expect(screen.getByText('On Track')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Milestones' }))

    expect(screen.getByText('Jog Progression')).toBeInTheDocument()
    expect(screen.getByText('Ready for test')).toBeInTheDocument()
    expect(screen.getByText(/PT clearance needed/i)).toBeInTheDocument()
  })

  it('lets patients select previous graph points', async () => {
    const user = userEvent.setup()
    render(
      <ProgressView
        patientProfile={{ injuryType: 'ACL + Meniscus', week: 14, goal: 'Return to Basketball' }}
        milestones={[]}
        progressData={[
          { label: 'Wk 10', pain: 5, swelling: 3, rom: 114, difficulty: 6, completion: 70 },
          { label: 'Now', pain: 2, swelling: 1, rom: 124, difficulty: 4, completion: 88 },
        ]}
        completionHistory={[]}
        checkIns={[]}
      />,
    )

    expect(screen.getByText('Pain 2/10 · Swelling 1/10 · Difficulty 4/10')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'View Wk 10: 5' }))

    expect(screen.getByText('Pain 5/10 · Swelling 3/10 · Difficulty 6/10')).toBeInTheDocument()
  })
})
