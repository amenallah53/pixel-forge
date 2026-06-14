import type { DialogueSequence } from './types.ts'

export const DIALOGUES: Record<string, DialogueSequence> = {
  level1_intro: {
    id: 'level1_intro',
    lines: [
      {
        speaker: '???',
        text: 'The year is 1015. Ibn al-Haytham sits under house arrest in Cairo...',
      },
      {
        speaker: 'Narrator',
        text: 'People believe the eye sends rays outward to see the world.',
      },
      {
        speaker: 'Ibn al-Haytham',
        text: 'No... that cannot be true. Light must enter the eye for vision to occur.',
        portrait: 'ibn_haytham',
      },
      {
        speaker: 'Ibn al-Haytham',
        text: 'I have devised an experiment to prove it. But I need your help.',
        portrait: 'ibn_haytham',
      },
    ],
    onComplete: 'CameraObscuraScene',
  },
  camera_obscura_success: {
    id: 'camera_obscura_success',
    lines: [
      {
        speaker: 'Ibn al-Haytham',
        text: 'Interesting... the image appears upside down.',
        portrait: 'ibn_haytham',
      },
      {
        speaker: 'Ibn al-Haytham',
        text: 'This proves light travels in straight lines! The top ray crosses downward, the bottom ray crosses upward.',
        portrait: 'ibn_al-Haytham',
      },
    ],
    onComplete: 'ObservationScene',
  },
  observation_explain: {
    id: 'observation_explain',
    lines: [
      {
        speaker: 'Ibn al-Haytham',
        text: 'Light travels from the candle in straight lines through the aperture.',
        portrait: 'ibn_haytham',
      },
      {
        speaker: 'Ibn al-Haytham',
        text: 'The rays cross at the aperture, creating an inverted image on the wall.',
        portrait: 'ibn_haytham',
      },
      {
        speaker: 'Ibn al-Haytham',
        text: 'This proves that vision happens when light enters the eye - not rays leaving it!',
        portrait: 'ibn_haytham',
      },
    ],
    onComplete: 'MirrorLabyrinthScene',
  },
  mirror_intro: {
    id: 'mirror_intro',
    lines: [
      {
        speaker: 'Ibn al-Haytham',
        text: 'Now let me show you another property of light: reflection.',
        portrait: 'ibn_haytham',
      },
      {
        speaker: 'Ibn al-Haytham',
        text: 'Rotate the mirrors to guide the light beam to the crystal.',
        portrait: 'ibn_haytham',
      },
    ],
    onComplete: '',
  },
  mirror_success: {
    id: 'mirror_success',
    lines: [
      {
        speaker: 'Ibn al-Haytham',
        text: 'Excellent! The angle of reflection equals the angle of incidence.',
        portrait: 'ibn_haytham',
      },
      {
        speaker: 'Ibn al-Haytham',
        text: 'Reflection changes the direction of light, but the rays remain straight.',
        portrait: 'ibn_haytham',
      },
    ],
    onComplete: 'QuizScene',
  },
  level4_intro: {
    id: 'level4_intro',
    lines: [
      {
        speaker: 'Narrator',
        text: 'The timeline tears open in 1831. An industrial city goes dark all at once.',
      },
      {
        speaker: 'Narrator',
        text: 'Streetlights fail. Factories fall silent. Hospitals flicker on the edge of darkness.',
      },
      {
        speaker: 'Michael Faraday',
        text: 'A principle has vanished from history. Electricity is not created from nothing.',
      },
      {
        speaker: 'Michael Faraday',
        text: 'We must discover how motion and magnetism work together.',
      },
    ],
    onComplete: 'FaradayExperimentScene',
  },
}
