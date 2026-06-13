export type SceneTransition = {
  from: string
  to: string
}

export type DialogueLine = {
  speaker: string
  text: string
  portrait?: string
}

export type DialogueSequence = {
  id: string
  lines: DialogueLine[]
  onComplete?: string
}

export type QuestionOption = {
  label: string
  text: string
}

export type QuizQuestion = {
  id: string
  question: string
  options: QuestionOption[]
  correctIndex: number
  explanation: string
}

export type ExperimentStep = {
  id: string
  description: string
  validate: string
}

export type LightRay = {
  startX: number
  startY: number
  endX: number
  endY: number
  color?: number
}

export type FragmentData = {
  id: string
  name: string
  description: string
  color: number
}

export type LevelConfig = {
  id: string
  title: string
  scientist: string
  era: string
  portraitKey: string
  fragment: FragmentData
  scenes: string[]
}
