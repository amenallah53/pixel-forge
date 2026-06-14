import Phaser from 'phaser'
import { QuizSystem } from '../../systems/QuizSystem.ts'
import { ProgressSystem } from '../../systems/ProgressSystem.ts'
import { LEVEL4_QUESTIONS } from '../../data/questions.ts'
import { LEVELS } from '../../data/levels.ts'

export class Level3QuizScene extends Phaser.Scene {
  private quizSystem!: QuizSystem
  private progressSystem!: ProgressSystem

  constructor() {
    super({ key: 'Level3QuizScene' })
  }

  create(): void {
    this.progressSystem = new ProgressSystem()
    if (!this.progressSystem.isLevelUnlocked('level3')) {
      this.scene.start('ScientiaMenuScene')
      return
    }

    const w = this.scale.width
    const h = this.scale.height
    this.cameras.main.setBackgroundColor('#071017')
    this.cameras.main.fadeIn(500, 0, 0, 0)

    const g = this.add.graphics()
    g.fillGradientStyle(0x071017, 0x111820, 0x141018, 0x05080d, 1)
    g.fillRect(0, 0, w, h)
    for (let i = 0; i < 70; i++) {
      g.fillStyle(0x55d6ff, 0.025 + Math.random() * 0.04)
      g.fillCircle(Math.random() * w, Math.random() * h, 0.6 + Math.random() * 1.6)
    }

    this.add.text(w / 2, 42, 'Knowledge Validation', {
      fontSize: '20px',
      color: '#f4d38a',
      fontFamily: 'Georgia, serif',
    }).setOrigin(0.5)

    this.progressSystem = new ProgressSystem()
    this.quizSystem = new QuizSystem(this)
    this.time.delayedCall(450, () => this.startQuiz())
  }

  private async startQuiz(): Promise<void> {
    const results = await this.quizSystem.startQuiz(LEVEL4_QUESTIONS)
    const correctCount = results.filter((r) => r.correct).length
    const score = Math.round((correctCount / results.length) * 100)

    results.forEach((r) => {
      if (r.correct) this.progressSystem.addXP('level3', 25)
    })

    const config = LEVELS.level3

    this.progressSystem.addFragment('level3', config.fragment)
    this.progressSystem.completeLevel('level3', score)

    this.cameras.main.fadeOut(600, 0, 0, 0)
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.quizSystem.destroy()
      this.scene.start('Level3CompleteScene')
    })
  }
}

