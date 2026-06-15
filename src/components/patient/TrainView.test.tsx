import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { TrainView } from './TrainView'

describe('TrainView session check-in', () => {
  it('saves ratings with partial workout completion', async () => {
    const user = userEvent.setup()
    const onSubmitCheckIn = vi.fn()
    const rehabItems = [
      { id: 1, name: 'Heel Slides', sets: 3, reps: 12, done: true },
      { id: 2, name: 'Quad Sets', sets: 3, reps: 10, done: false },
    ]

    render(
      <TrainView
        rehabItems={rehabItems}
        setRehabItems={vi.fn()}
        onSubmitCheckIn={onSubmitCheckIn}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'End session and check in' }))
    await user.click(screen.getByRole('button', { name: 'Pain 3 out of 10' }))
    await user.click(screen.getByRole('button', { name: 'Swelling 2 out of 10' }))
    await user.click(screen.getByRole('button', { name: 'Difficulty 6 out of 10' }))
    await user.click(screen.getByRole('button', { name: 'Save session' }))

    expect(onSubmitCheckIn).toHaveBeenCalledWith({
      pain: 3,
      swelling: 2,
      difficulty: 6,
      done: 1,
      total: 2,
      completion: 50,
    })
    expect(screen.getByText('SESSION SAVED')).toBeInTheDocument()
  })
})
