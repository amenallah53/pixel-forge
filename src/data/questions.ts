import type { QuizQuestion } from './types.ts'

export const LEVEL1_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q1',
    question: 'q1.question',
    options: [
      { label: 'A', text: 'q1.a' },
      { label: 'B', text: 'q1.b' },
      { label: 'C', text: 'q1.c' },
      { label: 'D', text: 'q1.d' },
    ],
    correctIndex: 2,
    explanation: 'q1.explanation',
  },
  {
    id: 'q2',
    question: 'q2.question',
    options: [
      { label: 'A', text: 'q2.a' },
      { label: 'B', text: 'q2.b' },
      { label: 'C', text: 'q2.c' },
      { label: 'D', text: 'q2.d' },
    ],
    correctIndex: 1,
    explanation: 'q2.explanation',
  },
  {
    id: 'q3',
    question: 'q3.question',
    options: [
      { label: 'A', text: 'q3.a' },
      { label: 'B', text: 'q3.b' },
      { label: 'C', text: 'q3.c' },
      { label: 'D', text: 'q3.d' },
    ],
    correctIndex: 1,
    explanation: 'q3.explanation',
  },
]

export const LEVEL4_QUESTIONS: QuizQuestion[] = [
  {
    id: 'faraday_induction',
    question: 'q4.question1',
    options: [
      { label: 'A', text: 'q4.1a' },
      { label: 'B', text: 'q4.1b' },
      { label: 'C', text: 'q4.1c' },
      { label: 'D', text: 'q4.1d' },
    ],
    correctIndex: 1,
    explanation: 'q4.1explanation',
  },
  {
    id: 'faraday_speed',
    question: 'q4.question2',
    options: [
      { label: 'A', text: 'q4.2a' },
      { label: 'B', text: 'q4.2b' },
      { label: 'C', text: 'q4.2c' },
      { label: 'D', text: 'q4.2d' },
    ],
    correctIndex: 1,
    explanation: 'q4.2explanation',
  },
  {
    id: 'faraday_direction',
    question: 'q4.question3',
    options: [
      { label: 'A', text: 'q4.3a' },
      { label: 'B', text: 'q4.3b' },
      { label: 'C', text: 'q4.3c' },
      { label: 'D', text: 'q4.3d' },
    ],
    correctIndex: 2,
    explanation: 'q4.3explanation',
  },
]
