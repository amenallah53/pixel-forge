import Phaser from 'phaser'
import { DialogueSystem } from '../../systems/DialogueSystem.ts'
import { DIALOGUES } from '../../data/dialogues.ts'
import { ProgressSystem } from '../../systems/ProgressSystem.ts'
import { t } from '../../i18n/index.ts'

export class Level3IntroScene extends Phaser.Scene {
  private dialogueSystem!: DialogueSystem

  constructor() {
    super({ key: 'Level3IntroScene' })
  }

  create(): void {
    const progressSystem = new ProgressSystem()
    if (!progressSystem.isLevelUnlocked('level3')) {
      this.scene.start('ScientiaMenuScene')
      return
    }

    const w = this.scale.width
    const h = this.scale.height

    this.cameras.main.setBackgroundColor('#120d0b')
    this.cameras.main.fadeIn(900, 0, 0, 0)

    this.createBackground(w, h)
    this.createStillSilhouette(w, h)
    this.createTitle(w)

    this.time.delayedCall(900, () => this.startDialogue())
  }

  private createBackground(w: number, h: number): void {
    const g = this.add.graphics()
    g.fillGradientStyle(0x120d0b, 0x1a140f, 0x2a1a0d, 0x120d0b, 1)
    g.fillRect(0, 0, w, h)

    for (let i = 0; i < 56; i++) {
      g.fillStyle(0xf2c86f, 0.02 + Math.random() * 0.03)
      g.fillCircle(Math.random() * w, Math.random() * h, 0.5 + Math.random() * 1.3)
    }
  }

  private createStillSilhouette(w: number, h: number): void {
    const g = this.add.graphics()
    g.setAlpha(0.95)

    g.fillStyle(0x090b10, 0.72)
    g.fillRect(0, h - 140, w, 140)

    g.lineStyle(3, 0x8d6b3c, 0.72)
    g.beginPath()
    g.moveTo(w * 0.34, h * 0.54)
    g.lineTo(w * 0.34, h * 0.34)
    g.lineTo(w * 0.5, h * 0.34)
    g.lineTo(w * 0.64, h * 0.46)
    g.strokePath()

    g.fillStyle(0x0d1116, 0.72)
    g.fillCircle(w * 0.28, h * 0.58, 60)
    g.fillStyle(0x0d1116, 0.72)
    g.fillRect(w * 0.265, h * 0.32, 30, 90)
    g.lineStyle(2, 0xe6d2a0, 0.3)
    g.strokeCircle(w * 0.28, h * 0.58, 60)
    g.strokeRoundedRect(w * 0.265, h * 0.32, 30, 90, 8)

    g.fillStyle(0x0d1116, 0.72)
    g.fillRoundedRect(w * 0.63, h * 0.42, 120, 130, 12)
    g.lineStyle(2, 0xe6d2a0, 0.3)
    g.strokeRoundedRect(w * 0.63, h * 0.42, 120, 130, 12)
    g.lineStyle(2, 0x8ecfff, 0.22)
    g.lineBetween(w * 0.34, h * 0.44, w * 0.63, h * 0.44)
    g.lineBetween(w * 0.34, h * 0.48, w * 0.63, h * 0.48)

    this.add.text(w / 2, h * 0.18, t('level3.introSubtitle'), {
      fontSize: '24px',
      color: '#f2c86f',
      fontFamily: 'Georgia, serif',
      fontStyle: 'italic',
    }).setOrigin(0.5)

    this.add.text(w / 2, h * 0.24, t('level3.introDesc'), {
      fontSize: '12px',
      color: '#e8d9be',
      fontFamily: 'Georgia, serif',
    }).setOrigin(0.5)
  }

  private createTitle(w: number): void {
    this.add.text(w / 2, 38, t('level3.introTitle'), {
      fontSize: '13px',
      color: '#9fcfe0',
      fontFamily: 'Georgia, serif',
    }).setOrigin(0.5)
  }

  private async startDialogue(): Promise<void> {
    this.dialogueSystem = new DialogueSystem(this)
    await this.dialogueSystem.playSequence(DIALOGUES.level3_intro.lines)

    this.cameras.main.fadeOut(700, 0, 0, 0)
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.dialogueSystem.destroy()
      this.scene.start('DistillationScene')
    })
  }
}
