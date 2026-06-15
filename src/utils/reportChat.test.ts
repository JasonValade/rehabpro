import { formatSymptomReportMessage } from './reportChat.js'

describe('formatSymptomReportMessage', () => {
  it('formats report details for the PT conversation', () => {
    expect(
      formatSymptomReportMessage({
        exercise: 'Quad Sets',
        pain: 3,
        swelling: 2,
        location: 'Front of knee',
        note: 'Sharp pain during the last rep',
      }),
    ).toBe(
      'SYMPTOM REPORT\nExercise: Quad Sets\nPain: 3/5\nSwelling: 2/5\nLocation: Front of knee\nNote: Sharp pain during the last rep',
    )
  })
})
