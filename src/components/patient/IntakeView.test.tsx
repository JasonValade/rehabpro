import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { IntakeView } from './IntakeView'

const completeIntake = {
  step: 4,
  completed: false,
  firstName: 'Taylor',
  lastName: 'Morgan',
  dateOfBirth: '1995-05-10',
  injury: 'ACL reconstruction',
  injurySide: 'Left',
  treatmentStage: 'Post-surgery',
  scriptFileName: 'protocol.pdf',
  scriptText: '',
  pain: '3',
  swelling: '2',
  primaryGoal: 'Return to running',
  redFlags: 'no',
  oversight: 'pt',
  additionalNotes: '',
}

describe('IntakeView', () => {
  it('submits a reviewed intake and releases the starter plan', async () => {
    const user = userEvent.setup()
    const onComplete = vi.fn()

    const { rerender } = render(
      <IntakeView intake={completeIntake} onChange={vi.fn()} onComplete={onComplete} onOpenPlan={vi.fn()} />,
    )

    await user.click(screen.getByRole('button', { name: 'Submit intake' }))
    expect(onComplete).toHaveBeenCalledWith(expect.objectContaining({ completed: true, firstName: 'Taylor' }))

    rerender(
      <IntakeView intake={{ ...completeIntake, completed: true }} onChange={vi.fn()} onComplete={onComplete} onOpenPlan={vi.fn()} />,
    )
    expect(screen.getByText('YOUR STARTER PLAN IS READY.')).toBeInTheDocument()
  })
})
