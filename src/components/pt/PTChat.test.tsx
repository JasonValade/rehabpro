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

  it('defaults to PT messaging and marks unavailable AI as coming soon', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn((url) =>
        Promise.resolve({
          ok: true,
          json: async () => (url === '/api/chat/status' ? { configured: false } : []),
        }),
      ),
    )
    render(<PTChat {...props} />)

    expect(screen.getByLabelText('Chat with')).toHaveValue('pt')
    await waitFor(() => expect(screen.getByRole('option', { name: 'RehabPro AI Coach (Coming soon)' })).toBeDisabled())
    expect(screen.getByText('Keep today lighter.')).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Message your PT'), { target: { value: 'My knee is sore.' } })
    fireEvent.click(screen.getByLabelText('Send message'))
    expect(props.onSendPtMessage).toHaveBeenCalledWith('thread_jason', 'My knee is sore.')
  })

  it('shows a direct care-team message without an empty conversation bubble', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn((url) =>
        Promise.resolve({
          ok: true,
          json: async () => (url === '/api/chat/status' ? { configured: false } : []),
        }),
      ),
    )
    render(<PTChat {...props} ptThread={null} />)

    expect(screen.getByText('Ask questions, share updates, or review symptom reports with your care team.')).toBeInTheDocument()
    expect(screen.queryByText('Your care team has not started a conversation yet.')).not.toBeInTheDocument()
  })

  it('renders symptom reports as structured cards in patient messages', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn((url) =>
        Promise.resolve({
          ok: true,
          json: async () => (url === '/api/chat/status' ? { configured: false } : []),
        }),
      ),
    )
    render(
      <PTChat
        {...props}
        ptThread={{
          ...props.ptThread,
          messages: [
            {
              sender: 'patient',
              text: 'SYMPTOM REPORT\nExercise: Quad Sets\nPain: 3/5\nSwelling: 2/5\nLocation: Front of knee\nNote: Sharp pain during the last rep',
              ts: 2,
            },
          ],
        }}
      />,
    )

    expect(await screen.findByText('Symptom report')).toBeInTheDocument()
    expect(screen.getByText('Quad Sets')).toBeInTheDocument()
    expect(screen.getByText('Sent')).toBeInTheDocument()
    expect(screen.getByText('Sharp pain during the last rep')).toBeInTheDocument()
    expect(screen.queryByText(/SYMPTOM REPORT\nExercise:/)).not.toBeInTheDocument()
  })

  it('sends patient context to the AI endpoint', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ configured: true }) })
      .mockResolvedValueOnce({ ok: true, json: async () => [] })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ reply: 'Use a slower tempo.' }) })
    vi.stubGlobal('fetch', fetchMock)
    render(<PTChat {...props} />)

    await waitFor(() => expect(screen.getByRole('option', { name: 'RehabPro AI Coach' })).toBeEnabled())
    fireEvent.change(screen.getByLabelText('Chat with'), { target: { value: 'ai' } })
    fireEvent.change(screen.getByLabelText('Ask the AI coach'), { target: { value: 'Check my squat form' } })
    fireEvent.click(screen.getByLabelText('Send message'))

    await waitFor(() => expect(screen.getByText('Use a slower tempo.')).toBeInTheDocument())
    const request = JSON.parse(fetchMock.mock.calls[2][1].body)
    expect(request.patientContext).toEqual({ injury: 'ACL / Meniscus' })
    expect(request.text).toBe('Check my squat form')
  })
})
