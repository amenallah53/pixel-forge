import Phaser from 'phaser'
import { DialogueSystem } from '../../systems/DialogueSystem.ts'
import { DIALOGUES } from '../../data/dialogues.ts'
import { UIButton } from '../../ui/UIButton.ts'

export class ObservationScene extends Phaser.Scene {
  private dialogueSystem!: DialogueSystem
  private continueButton?: UIButton
  private transitionLock = false

  constructor() {
    super({ key: 'ObservationScene' })
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

    const title = this.add.text(w / 2, 30, 'How Does Vision Work?', {
      fontSize: '22px',
      color: '#ffd700',
      fontFamily: 'Georgia, serif',
      fontStyle: 'italic',
    })
    title.setOrigin(0.5, 0)
    title.setDepth(10)

    const container = this.add.container(0, 0)
    container.setDepth(5)

    const objectX = w * 0.2
    const apertureX = w * 0.5
    const eyeX = w * 0.78
    const baseY = h * 0.45

    const objectGlow = this.add.graphics()
    objectGlow.fillStyle(0xffd700, 0.08)
    objectGlow.fillCircle(objectX, baseY, 38)
    objectGlow.setDepth(4)

    const objectG = this.add.image(objectX, baseY, 'candle')
    objectG.setScale(1.5)
    objectG.setDepth(5)
    const objectLabel = this.add.text(objectX, baseY + 60, 'Object\n(Candle)', {
      fontSize: '11px',
      color: '#88ccff',
      align: 'center',
      fontFamily: 'Georgia, serif',
    })
    objectLabel.setOrigin(0.5)
    objectLabel.setDepth(10)

    const eyeG = this.add.graphics()
    eyeG.fillStyle(0xffffff, 0.8)
    eyeG.fillEllipse(eyeX, baseY, 40, 25)
    eyeG.fillStyle(0x000000, 0.8)
    eyeG.fillCircle(eyeX, baseY, 8)
    eyeG.fillStyle(0xffffff, 0.3)
    eyeG.fillCircle(eyeX - 3, baseY - 3, 3)
    const eyeLabel = this.add.text(eyeX, baseY + 40, 'Eye', {
      fontSize: '11px',
      color: '#ffffff',
      fontFamily: 'Georgia, serif',
    })
    eyeLabel.setOrigin(0.5)
    eyeLabel.setDepth(10)

    const rayG = this.add.graphics()
    rayG.setDepth(6)

    const rayLabel1 = this.add.text(apertureX, baseY - 60, 'Light travels in straight lines', {
      fontSize: '12px',
      color: '#ffff44',
      fontFamily: 'Georgia, serif',
    })
    rayLabel1.setOrigin(0.5)
    rayLabel1.setAlpha(0)
    rayLabel1.setDepth(10)

    const rayLabel2 = this.add.text(w / 2, baseY + 100, 'Light enters the eye -> Vision', {
      fontSize: '12px',
      color: '#69db7c',
      fontFamily: 'Georgia, serif',
    })
    rayLabel2.setOrigin(0.5)
    rayLabel2.setAlpha(0)
    rayLabel2.setDepth(10)

    const step3Label = this.add.text(w / 2, h - 40, 'The eye does NOT emit rays. It receives light.', {
      fontSize: '13px',
      color: '#ffd700',
      fontFamily: 'Georgia, serif',
      fontStyle: 'italic',
    })
    step3Label.setOrigin(0.5)
    step3Label.setAlpha(0)
    step3Label.setDepth(10)

    this.continueButton = new UIButton(
      this,
      w - 132,
      h - 30,
      200,
      30,
      'Continue to reflection',
      0x2a1a0a,
      0x4a3728,
      () => this.skipToNextScene(),
    )
    this.continueButton.setDepth(20)

    this.time.delayedCall(800, () => {
      this.animateRays(objectX, baseY, apertureX, eyeX, rayG, rayLabel1, rayLabel2, step3Label)
    })
  }

  private animateRays(
    objectX: number, baseY: number,
    apertureX: number, eyeX: number,
    rayG: Phaser.GameObjects.Graphics,
    rayLabel1: Phaser.GameObjects.Text,
    rayLabel2: Phaser.GameObjects.Text,
    step3Label: Phaser.GameObjects.Text,
  ): void {
    const topStart = { x: objectX, y: baseY - 35 }
    const bottomStart = { x: objectX, y: baseY + 35 }
    const eyeCenter = { x: eyeX, y: baseY }

    let phase = 0
    const totalSteps = 120

    const timer = this.time.addEvent({
      delay: 40,
      repeat: totalSteps,
      callback: () => {
        phase++
        rayG.clear()

        if (phase <= 40) {
          const t = phase / 40
          const endX = Phaser.Math.Linear(objectX, apertureX, t)

          rayG.lineStyle(2.5, 0xffff44, 0.7)
          rayG.beginPath()
          rayG.moveTo(topStart.x, topStart.y)
          rayG.lineTo(endX, topStart.y)
          rayG.strokePath()

          rayG.beginPath()
          rayG.moveTo(bottomStart.x, bottomStart.y)
          rayG.lineTo(endX, bottomStart.y)
          rayG.strokePath()

          if (phase === 40) {
            rayLabel1.setAlpha(1)
            this.tweens.add({
              targets: rayLabel1,
              alpha: { from: 0, to: 1 },
              duration: 500,
            })
          }
        } else if (phase <= 80) {
          const t = (phase - 40) / 40
          const midX = Phaser.Math.Linear(apertureX, eyeCenter.x, t)

          rayG.lineStyle(2.5, 0xffff44, 0.7)
          rayG.beginPath()
          rayG.moveTo(topStart.x, topStart.y)
          rayG.lineTo(apertureX, topStart.y)
          rayG.lineTo(midX, eyeCenter.y - 10)
          rayG.strokePath()

          rayG.beginPath()
          rayG.moveTo(bottomStart.x, bottomStart.y)
          rayG.lineTo(apertureX, bottomStart.y)
          rayG.lineTo(midX, eyeCenter.y + 10)
          rayG.strokePath()

          rayG.lineStyle(1, 0xffff44, 0.2)
          rayG.beginPath()
          rayG.moveTo(objectX, topStart.y)
          rayG.lineTo(objectX, bottomStart.y)
          rayG.strokePath()

          if (phase === 80) {
            rayLabel2.setAlpha(1)
            this.tweens.add({
              targets: rayLabel2,
              alpha: { from: 0, to: 1 },
              duration: 500,
            })
          }
        } else {
          const t = (phase - 80) / (totalSteps - 80)

          rayG.lineStyle(2.5, 0xffff44, 0.7)
          rayG.beginPath()
          rayG.moveTo(topStart.x, topStart.y)
          rayG.lineTo(apertureX, topStart.y)
          rayG.lineTo(eyeCenter.x - 10 + t * 10, eyeCenter.y - 10)
          rayG.strokePath()

          rayG.beginPath()
          rayG.moveTo(bottomStart.x, bottomStart.y)
          rayG.lineTo(apertureX, bottomStart.y)
          rayG.lineTo(eyeCenter.x - 10 + t * 10, eyeCenter.y + 10)
          rayG.strokePath()

          rayG.lineStyle(1, 0xffff44, 0.2)
          rayG.beginPath()
          rayG.moveTo(objectX, topStart.y)
          rayG.lineTo(objectX, bottomStart.y)
          rayG.strokePath()

          if (!step3Label.alpha) {
            step3Label.setAlpha(1)
            this.tweens.add({
              targets: step3Label,
              alpha: { from: 0, to: 1 },
              duration: 800,
            })
          }
        }
      },
    })

    this.time.delayedCall(6000, () => {
      timer.destroy()
      this.startDialogue()
    })
  }

  private async startDialogue(): Promise<void> {
    this.dialogueSystem = new DialogueSystem(this)
    const dialogue = DIALOGUES.observation_explain
    await this.dialogueSystem.playSequence(dialogue.lines)
    if (this.transitionLock) return
    this.transitionLock = true

    this.cameras.main.fadeOut(800, 0, 0, 0)
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.dialogueSystem.destroy()
      this.scene.start('MirrorLabyrinthScene')
    })
  }

  private skipToNextScene(): void {
    if (this.transitionLock) return
    this.transitionLock = true
    this.dialogueSystem?.skip()
    this.dialogueSystem?.destroy()
    this.continueButton?.destroy()
    this.cameras.main.fadeOut(500, 0, 0, 0)
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('MirrorLabyrinthScene')
    })
  }
}
