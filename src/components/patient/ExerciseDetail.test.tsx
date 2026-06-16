import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ExerciseDetail } from './ExerciseDetail'
import { getYouTubeVideoId } from '../../utils/youtube'
import { EXERCISE_LIBRARY } from '../../data/exerciseLibrary'

describe('ExerciseDetail videos', () => {
  it('parses standard, short, and shortened YouTube URLs', () => {
    expect(getYouTubeVideoId({ youtubeUrl: 'https://www.youtube.com/watch?v=abcdefghijk' })).toBe('abcdefghijk')
    expect(getYouTubeVideoId({ youtubeUrl: 'https://www.youtube.com/shorts/12345678901' })).toBe('12345678901')
    expect(getYouTubeVideoId({ youtubeUrl: 'https://youtu.be/ABCDEFGHIJK' })).toBe('ABCDEFGHIJK')
  })

  it('has an embeddable YouTube video for every exercise in the library', () => {
    const missingVideos = EXERCISE_LIBRARY
      .filter((exercise) => !getYouTubeVideoId(exercise))
      .map((exercise) => exercise.name)

    expect(missingVideos).toEqual([])
  })

  it('shows a preview and loads the privacy-enhanced player', async () => {
    const user = userEvent.setup()
    render(<ExerciseDetail exercise={{ id: 1, name: 'Quad Sets', youtubeId: 'au62CidApd0' }} />)

    await user.click(screen.getByRole('button', { name: 'Play Quad Sets video demo' }))

    expect(screen.getByTitle('Quad Sets video demo')).toHaveAttribute(
      'src',
      'https://www.youtube-nocookie.com/embed/au62CidApd0?autoplay=1&rel=0',
    )
    expect(screen.getByRole('link', { name: /open on youtube/i })).toHaveAttribute(
      'href',
      'https://www.youtube.com/watch?v=au62CidApd0',
    )
  })
})
