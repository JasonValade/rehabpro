import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { PTChat } from './PTChat.jsx'

const props = {
  patientId: 'pt_jason',
  patientName: 'Jason V.',
  patientContext: { injury: 'ACL / Meniscus' },
  ptThread: {
    id: 'thread_jason',
    messages: [{ sender: 'pt', text: 'Keep today lighter.', ts: 1 }],
  },
  onSendPtMessage: vi.fn(),
}

describe('PTChat', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    props.onSendPtMessage.mockClear()
  })

  it('keeps AI coaching distinct from the physical therapist conversation', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => [] }))
    render(<PTChat {...props} />)

    expect(screen.getByLabelText('Chat with')).toHaveValue('ai')
    fireEvent.change(screen.getByLabelText('Chat with'), { target: { value: 'pt' } })
    expect(screen.getByText('Keep today lighter.')).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Message your PT'), { target: { value: 'My knee is sore.' } })
    fireEvent.click(screen.getByLabelText('Send message'))
    expect(props.onSendPtMessage).toHaveBeenCalledWith('thread_jason', 'My knee is sore.')
  })

  it('sends patient context to the AI endpoint', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => [] })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ reply: 'Use a slower tempo.' }) })
    vi.stubGlobal('fetch', fetchMock)
    render(<PTChat {...props} />)

    fireEvent.change(screen.getByLabelText('Ask the AI coach'), { target: { value: 'Check my squat form' } })
    fireEvent.click(screen.getByLabelText('Send message'))

    await waitFor(() => expect(screen.getByText('Use a slower tempo.')).toBeInTheDocument())
    const request = JSON.parse(fetchMock.mock.calls[1][1].body)
    expect(request.patientContext).toEqual({ injury: 'ACL / Meniscus' })
    expect(request.text).toBe('Check my squat form')
  })
})
