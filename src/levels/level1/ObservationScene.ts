import Phaser from 'phaser'
import { DialogueSystem } from '../../systems/DialogueSystem.ts'
import { DIALOGUES } from '../../data/dialogues.ts'
import { UIButton } from '../../ui/UIButton.ts'
import { t } from '../../i18n/index.ts'

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

    const title = this.add.text(w / 2, 30, t('observation.title'), {
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
    const objectLabel = this.add.text(objectX, baseY + 60, t('observation.object'), {
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
    const eyeLabel = this.add.text(eyeX, baseY + 40, t('observation.eye'), {
      fontSize: '11px',
      color: '#ffffff',
      fontFamily: 'Georgia, serif',
    })
    eyeLabel.setOrigin(0.5)
    eyeLabel.setDepth(10)

    const rayG = this.add.graphics()
    rayG.setDepth(6)

    const rayLabel1 = this.add.text(apertureX, baseY - 60, t('observation.straightLines'), {
      fontSize: '12px',
      color: '#ffff44',
      fontFamily: 'Georgia, serif',
    })
    rayLabel1.setOrigin(0.5)
    rayLabel1.setAlpha(0)
    rayLabel1.setDepth(10)

    const rayLabel2 = this.add.text(w / 2, baseY + 100, t('observation.eyeReceives'), {
      fontSize: '12px',
      color: '#69db7c',
      fontFamily: 'Georgia, serif',
    })
    rayLabel2.setOrigin(0.5)
    rayLabel2.setAlpha(0)
    rayLabel2.setDepth(10)

    const step3Label = this.add.text(w / 2, h - 40, t('observation.eyeDoesNotEmit'), {
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
      t('observation.continue'),
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
    const eyeTop = { x: eyeX, y: baseY - 10 }
    const eyeBottom = { x: eyeX, y: baseY + 10 }
    const apertureCenter = { x: apertureX, y: baseY }

    this.drawStraightRay(rayG, topStart, eyeBottom, 0xffff44)
    this.drawStraightRay(rayG, bottomStart, eyeTop, 0xffaa22)

    rayG.lineStyle(1, 0xffff44, 0.15)
    rayG.beginPath()
    rayG.moveTo(apertureX - 8, baseY - 4)
    rayG.lineTo(apertureX + 8, baseY + 4)
    rayG.strokePath()
    rayG.beginPath()
    rayG.moveTo(apertureX - 8, baseY + 4)
    rayG.lineTo(apertureX + 8, baseY - 4)
    rayG.strokePath()

    rayLabel1.setAlpha(1)
    this.tweens.add({ targets: rayLabel1, alpha: { from: 0, to: 1 }, duration: 500, delay: 200 })

    const crossLabel = this.add.text(apertureX + 50, baseY - 22, t('observation.raysCross'), {
      fontSize: '10px',
      color: '#ffff44',
      fontFamily: 'Georgia, serif',
      fontStyle: 'italic',
    }).setOrigin(0, 0.5).setDepth(10).setAlpha(0)
    this.tweens.add({ targets: crossLabel, alpha: 1, duration: 500, delay: 800 })

    this.time.delayedCall(1500, () => {
      rayLabel2.setAlpha(1)
      this.tweens.add({ targets: rayLabel2, alpha: { from: 0, to: 1 }, duration: 500 })
    })

    this.time.delayedCall(3000, () => {
      step3Label.setAlpha(1)
      this.tweens.add({ targets: step3Label, alpha: { from: 0, to: 1 }, duration: 800 })
    })

    this.time.delayedCall(6000, () => {
      this.startDialogue()
    })
  }

  private drawStraightRay(
    rayG: Phaser.GameObjects.Graphics,
    from: { x: number; y: number },
    to: { x: number; y: number },
    color: number,
  ): void {
    const midX = (from.x + to.x) / 2
    const midY = (from.y + to.y) / 2

    const glow = this.add.graphics().setDepth(5)
    glow.lineStyle(8, color, 0.06)
    glow.beginPath(); glow.moveTo(from.x, from.y); glow.lineTo(to.x, to.y); glow.strokePath()
    glow.lineStyle(5, color, 0.1)
    glow.beginPath(); glow.moveTo(from.x, from.y); glow.lineTo(to.x, to.y); glow.strokePath()

    rayG.lineStyle(2.5, color, 0.85)
    rayG.beginPath(); rayG.moveTo(from.x, from.y); rayG.lineTo(to.x, to.y); rayG.strokePath()

    rayG.fillStyle(0xffffff, 0.25)
    rayG.fillCircle(from.x, from.y, 3)
    rayG.fillCircle(to.x, to.y, 3)

    const particle = this.add.particles(midX, midY, 'particle', {
      speed: { min: 1, max: 3 },
      scale: { start: 0.25, end: 0 },
      alpha: { start: 0.5, end: 0 },
      lifespan: 1400,
      frequency: 100,
      quantity: 1,
      tint: color,
    }).setDepth(8)
    this.time.delayedCall(4000, () => {
      this.tweens.add({ targets: particle, alpha: 0, duration: 500 })
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
