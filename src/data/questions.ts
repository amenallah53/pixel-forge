import type { QuizQuestion } from './types.ts'

export const LEVEL1_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q1',
    question: 'Why does the image appear inverted in a camera obscura?',
    options: [
      { label: 'A', text: 'The box flips the image.' },
      { label: 'B', text: 'Light bends randomly inside the box.' },
      { label: 'C', text: 'Light travels in straight lines.' },
      { label: 'D', text: 'The wall creates the image.' },
    ],
    correctIndex: 2,
    explanation:
      'Light travels in straight lines. Rays from the top of the object travel downward through the aperture, and rays from the bottom travel upward. This crossing causes the image to appear upside down.',
  },
]
