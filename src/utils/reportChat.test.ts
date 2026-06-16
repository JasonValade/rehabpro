import { formatSymptomReportMessage, parseSymptomReportMessage } from './reportChat.js'

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

  it('parses report messages for styled chat cards', () => {
    expect(
      parseSymptomReportMessage(
        'SYMPTOM REPORT\nExercise: Quad Sets\nPain: 3/5\nSwelling: 2/5\nLocation: Front of knee\nNote: Sharp pain during the last rep',
      ),
    ).toEqual({
      title: 'SYMPTOM REPORT',
      exercise: 'Quad Sets',
      pain: '3/5',
      swelling: '2/5',
      location: 'Front of knee',
      note: 'Sharp pain during the last rep',
    })
  })
})
