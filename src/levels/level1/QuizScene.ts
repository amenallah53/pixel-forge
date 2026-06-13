import Phaser from 'phaser'
import { QuizSystem } from '../../systems/QuizSystem.ts'
import { ProgressSystem } from '../../systems/ProgressSystem.ts'
import { LEVEL1_QUESTIONS } from '../../data/questions.ts'
import { LEVELS } from '../../data/levels.ts'

export class QuizScene extends Phaser.Scene {
  private quizSystem!: QuizSystem
  private progressSystem!: ProgressSystem

  constructor() {
    super({ key: 'QuizScene' })
  }

  create(): void {
    const w = this.scale.width
    const h = this.scale.height

    this.cameras.main.setBackgroundColor('#0a0a1a')
    this.cameras.main.fadeIn(600, 0, 0, 0)

    const bgImage = this.add.image(w / 2, h / 2, 'background')
    bgImage.setDisplaySize(w, h)
    bgImage.setAlpha(0.1)
    bgImage.setDepth(0)

    const header = this.add.graphics()
    header.setDepth(1)
    header.fillStyle(0x000000, 0.5)
    header.fillRoundedRect(w / 2 - 200, 15, 400, 40, 8)
    header.lineStyle(1, 0xffd700, 0.5)

    const title = this.add.text(w / 2, 35, 'Knowledge Assessment', {
      fontSize: '16px',
      color: '#ffd700',
      fontFamily: 'Georgia, serif',
    })
    title.setOrigin(0.5)
    title.setDepth(10)

    this.progressSystem = new ProgressSystem()
    this.quizSystem = new QuizSystem(this)

    this.time.delayedCall(500, () => {
      this.startQuiz()
    })
  }

  private async startQuiz(): Promise<void> {
    const results = await this.quizSystem.startQuiz(LEVEL1_QUESTIONS)
    const correctCount = results.filter((r) => r.correct).length
    const score = Math.round((correctCount / results.length) * 100)

    const config = LEVELS['level1']
    this.progressSystem.addFragment('level1', config.fragment)
    this.progressSystem.completeLevel('level1', score)

    this.cameras.main.fadeOut(800, 0, 0, 0)
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('LevelCompleteScene')
    })
  }
}
