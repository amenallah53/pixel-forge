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
  {
    id: 'q2',
    question: 'How does the size of the aperture affect the image in a camera obscura?',
    options: [
      { label: 'A', text: 'A smaller aperture makes the image brighter but blurrier.' },
      { label: 'B', text: 'A smaller aperture makes the image sharper but dimmer.' },
      { label: 'C', text: 'A larger aperture always makes the image sharper.' },
      { label: 'D', text: 'Aperture size has no effect on the image.' },
    ],
    correctIndex: 1,
    explanation:
      'A smaller aperture limits light rays to those travelling almost straight, reducing blur and making the image sharper, but dimmer because less light enters.',
  },
  {
    id: 'q3',
    question: 'What did Ibn al-Haytham prove about vision by using the camera obscura?',
    options: [
      { label: 'A', text: 'The eye emits rays to see objects.' },
      { label: 'B', text: 'Light travels from objects into the eye.' },
      { label: 'C', text: 'Images are created by magic.' },
      { label: 'D', text: 'The brain generates light.' },
    ],
    correctIndex: 1,
    explanation:
      'Ibn al-Haytham demonstrated that light reflects off objects and travels in straight lines into the eye, proving vision is a result of light entering the eye, not rays leaving it.',
  },
]

export const LEVEL4_QUESTIONS: QuizQuestion[] = [
  {
    id: 'faraday_induction',
    question: 'How is electricity generated in Faraday\'s experiment?',
    options: [
      { label: 'A', text: 'Heating a magnet' },
      { label: 'B', text: 'Changing the magnetic field around a conductor' },
      { label: 'C', text: 'Making the coil larger' },
      { label: 'D', text: 'Using a battery' },
    ],
    correctIndex: 1,
    explanation:
      'Electromagnetic induction occurs when the magnetic field through a conductor changes. Moving the magnet through the coil changes the field, which drives current.',
  },
  {
    id: 'faraday_speed',
    question: 'What happens if you move the magnet through the coil faster?',
    options: [
      { label: 'A', text: 'The induced current becomes weaker.' },
      { label: 'B', text: 'The induced current becomes stronger.' },
      { label: 'C', text: 'Nothing changes.' },
      { label: 'D', text: 'The magnet stops working.' },
    ],
    correctIndex: 1,
    explanation:
      'A faster-changing magnetic field induces a stronger voltage. This is why moving the magnet quickly through the coil produces a larger current.',
  },
  {
    id: 'faraday_direction',
    question: 'Why does the galvanometer needle deflect in opposite directions when the magnet enters vs. leaves the coil?',
    options: [
      { label: 'A', text: 'The needle is broken.' },
      { label: 'B', text: 'The coil changes size.' },
      { label: 'C', text: 'The magnetic field increases in one direction and decreases in the other.' },
      { label: 'D', text: 'Gravity pulls differently.' },
    ],
    correctIndex: 2,
    explanation:
      'When the magnet enters, the magnetic field through the coil increases. When it leaves, the field decreases. These opposite changes induce current in opposite directions.',
  },
]
