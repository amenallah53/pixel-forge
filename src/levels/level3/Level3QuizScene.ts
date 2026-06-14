import Phaser from 'phaser'
import { QuizSystem } from '../../systems/QuizSystem.ts'
import { ProgressSystem } from '../../systems/ProgressSystem.ts'
import { LEVEL3_QUESTIONS } from '../../data/questions.ts'
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

    this.cameras.main.setBackgroundColor('#120d0b')
    this.cameras.main.fadeIn(600, 0, 0, 0)

    const bgImage = this.add.image(w / 2, h / 2, 'background')
    bgImage.setDisplaySize(w, h)
    bgImage.setAlpha(0.1)
    bgImage.setDepth(0)

    const header = this.add.graphics()
    header.setDepth(1)
    header.fillStyle(0x000000, 0.5)
    header.fillRoundedRect(w / 2 - 200, 15, 400, 40, 8)
    header.lineStyle(1, 0xf2c86f, 0.5)

    const title = this.add.text(w / 2, 35, 'Knowledge Assessment', {
      fontSize: '16px',
      color: '#f2c86f',
      fontFamily: 'Georgia, serif',
    })
    title.setOrigin(0.5)
    title.setDepth(10)

    this.add.text(w / 2, 72, 'Distillation and Condensation', {
      fontSize: '12px',
      color: '#e8d9be',
      fontFamily: 'Georgia, serif',
    }).setOrigin(0.5)

    this.quizSystem = new QuizSystem(this)
    this.time.delayedCall(500, () => this.startQuiz())
  }

  private async startQuiz(): Promise<void> {
    const results = await this.quizSystem.startQuiz(LEVEL3_QUESTIONS)
    const correctCount = results.filter((r) => r.correct).length
    const score = Math.round((correctCount / results.length) * 100)

    results.forEach((r) => {
      if (r.correct) this.progressSystem.addXP('level3', 25)
    })

    const config = LEVELS.level3
    this.progressSystem.addFragment('level3', config.fragment)
    this.progressSystem.completeLevel('level3', score)

    this.cameras.main.fadeOut(800, 0, 0, 0)
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.quizSystem.destroy()
      this.scene.start('Level3CompleteScene')
    })
  }
}
