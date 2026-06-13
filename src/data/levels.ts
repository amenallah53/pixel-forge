import type { LevelConfig } from './types.ts'

export const LEVELS: Record<string, LevelConfig> = {
  level1: {
    id: 'level1',
    title: 'Ibn al-Haytham – The Secret of Light',
    scientist: 'Ibn al-Haytham',
    era: '11th Century Cairo',
    portraitKey: 'ibn_haytham',
    fragment: {
      id: 'optics',
      name: 'OPTICS',
      description: 'The science of light and vision',
      color: 0xffd700,
    },
    scenes: [
      'Level1IntroScene',
      'CameraObscuraScene',
      'ObservationScene',
      'MirrorLabyrinthScene',
      'QuizScene',
      'LevelCompleteScene',
    ],
  },
}

export const LEVEL_ORDER = ['level1']
