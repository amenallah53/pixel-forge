import Phaser from 'phaser'
import type { QuizQuestion } from '../data/types.ts'
import { UIButton } from '../ui/UIButton.ts'
import { t } from '../i18n/index.ts'

export type QuizResult = {
  questionId: string
  correct: boolean
  selectedIndex: number
}

export class QuizSystem {
  private scene: Phaser.Scene
  private results: QuizResult[] = []
  private currentQuestionIndex = 0
  private questions: QuizQuestion[] = []
  private container: Phaser.GameObjects.Container
  private questionText: Phaser.GameObjects.Text
  private feedbackText: Phaser.GameObjects.Text
  private optionButtons: UIButton[] = []
  private resolvePromise: ((value: QuizResult[]) => void) | null = null
  private answered = false

  constructor(scene: Phaser.Scene) {
    this.scene = scene
    this.container = new Phaser.GameObjects.Container(scene, 0, 0)
    this.container.setDepth(90)

    const bg = new Phaser.GameObjects.Rectangle(scene, scene.scale.width / 2, scene.scale.height / 2, 640, 480, 0x0a0a1a, 0.95)
    bg.setStrokeStyle(2, 0x4a3728)
    this.container.add(bg)

    this.questionText = new Phaser.GameObjects.Text(scene, scene.scale.width / 2, 80, '', {
      fontSize: '16px',
      color: '#ffd700',
      wordWrap: { width: 560 },
      align: 'center',
      fontFamily: 'Georgia, serif',
    })
    this.questionText.setOrigin(0.5, 0)
    this.container.add(this.questionText)

    this.feedbackText = new Phaser.GameObjects.Text(scene, scene.scale.width / 2, 440, '', {
      fontSize: '13px',
      color: '#e0d5c1',
      wordWrap: { width: 560 },
      align: 'center',
      fontFamily: 'Georgia, serif',
    })
    this.feedbackText.setOrigin(0.5, 0)
    this.container.add(this.feedbackText)

    this.container.setVisible(false)
    scene.add.existing(this.container)
  }

  async startQuiz(questions: QuizQuestion[]): Promise<QuizResult[]> {
    this.questions = questions
    this.currentQuestionIndex = 0
    this.results = []
    this.container.setVisible(true)

    return new Promise((resolve) => {
      this.resolvePromise = resolve
      this.showCurrentQuestion()
    })
  }

  private showCurrentQuestion(): void {
    this.clearOptions()
    this.answered = false
    this.feedbackText.setText('')

    const q = this.questions[this.currentQuestionIndex]
    this.questionText.setText(t(q.question))

    const startY = 140
    const optionHeight = 50
    const optionWidth = 520
    const gap = 8

    q.options.forEach((opt, index) => {
      const y = startY + index * (optionHeight + gap)
      const btn = new UIButton(
        this.scene,
        this.scene.scale.width / 2,
        y,
        optionWidth,
        optionHeight,
        `${t(opt.label)}. ${t(opt.text)}`,
        0x2a1a0a,
        0x4a3728,
        () => this.handleAnswer(index),
      )
      btn.setDepth(91)
      this.optionButtons.push(btn)
      this.container.add(btn)
    })
  }

  private handleAnswer(index: number): void {
    if (this.answered) return
    this.answered = true

    const q = this.questions[this.currentQuestionIndex]
    const correct = index === q.correctIndex

    this.results.push({
      questionId: q.id,
      correct,
      selectedIndex: index,
    })

    this.feedbackText.setText(correct ? t('quiz.correct') : t('quiz.incorrect') + ' ' + t(q.explanation))

    if (!correct) {
      this.feedbackText.setColor('#ff6b6b')
    } else {
      this.feedbackText.setColor('#69db7c')
    }

    this.scene.time.delayedCall(2500, () => {
      this.currentQuestionIndex++
      if (this.currentQuestionIndex < this.questions.length) {
        this.showCurrentQuestion()
      } else {
        this.finish()
      }
    })
  }

  private clearOptions(): void {
    for (const btn of this.optionButtons) {
      btn.destroy()
    }
    this.optionButtons = []
  }

  private finish(): void {
    this.container.setVisible(false)
    this.clearOptions()
    if (this.resolvePromise) {
      this.resolvePromise(this.results)
      this.resolvePromise = null
    }
  }

  destroy(): void {
    this.clearOptions()
    this.container.destroy()
  }
}
