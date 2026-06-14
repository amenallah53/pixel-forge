import Phaser from 'phaser'
import { DialogueSystem } from '../../systems/DialogueSystem.ts'
import { DIALOGUES } from '../../data/dialogues.ts'

export class Level4IntroScene extends Phaser.Scene {
  private dialogueSystem!: DialogueSystem

  constructor() {
    super({ key: 'Level4IntroScene' })
  }

  create(): void {
    const w = this.scale.width
    const h = this.scale.height
    this.cameras.main.setBackgroundColor('#05080d')
    this.cameras.main.fadeIn(800, 0, 0, 0)

    this.createDarkCity(w, h)
    this.createLaboratoryWindow(w, h)
    this.createTitle(w)

    this.time.delayedCall(900, () => this.startDialogue())
  }

  private createDarkCity(w: number, h: number): void {
    const g = this.add.graphics()
    g.fillGradientStyle(0x05080d, 0x07111a, 0x151018, 0x08070d, 1)
    g.fillRect(0, 0, w, h)

    for (let i = 0; i < 11; i++) {
      const bw = 42 + (i % 3) * 18
      const bh = 120 + (i % 4) * 32
      const x = i * 78 - 10
      const y = h - 90 - bh
      g.fillStyle(0x101722, 0.92)
      g.fillRect(x, y, bw, bh)
      g.lineStyle(1, 0x263346, 0.25)
      g.strokeRect(x, y, bw, bh)
      for (let wy = y + 14; wy < y + bh - 12; wy += 22) {
        for (let wx = x + 9; wx < x + bw - 8; wx += 16) {
          g.fillStyle(0x1c2630, 0.45)
          g.fillRect(wx, wy, 5, 8)
        }
      }
    }

    g.fillStyle(0x130e0b, 1)
    g.fillRect(0, h - 92, w, 92)
    g.lineStyle(2, 0x2a1d13, 0.65)
    g.beginPath()
    g.moveTo(0, h - 92)
    g.lineTo(w, h - 92)
    g.strokePath()
  }

  private createLaboratoryWindow(w: number, h: number): void {
    const g = this.add.graphics()
    const x = w * 0.72
    const y = h * 0.25
    g.fillStyle(0x06090e, 0.9)
    g.fillRoundedRect(x - 95, y - 70, 190, 140, 8)
    g.lineStyle(3, 0x6c4b2a, 0.7)
    g.strokeRoundedRect(x - 95, y - 70, 190, 140, 8)
    g.lineStyle(1, 0x6c4b2a, 0.5)
    g.lineBetween(x, y - 70, x, y + 70)
    g.lineBetween(x - 95, y, x + 95, y)
    g.fillStyle(0x55d6ff, 0.07)
    g.fillCircle(x - 25, y + 18, 38)
  }

  private createTitle(w: number): void {
    const title = this.add.text(w / 2, 46, 'Michael Faraday - The Invisible Energy', {
      fontSize: '24px',
      color: '#f4d38a',
      fontFamily: 'Georgia, serif',
      fontStyle: 'italic',
    })
    title.setOrigin(0.5)

    this.add.text(w / 2, 78, '1831: electricity has vanished from the industrial city', {
      fontSize: '12px',
      color: '#9fcfe0',
      fontFamily: 'Georgia, serif',
    }).setOrigin(0.5)
  }

  private async startDialogue(): Promise<void> {
    this.dialogueSystem = new DialogueSystem(this)
    await this.dialogueSystem.playSequence(DIALOGUES.level4_intro.lines)
    this.cameras.main.fadeOut(600, 0, 0, 0)
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.dialogueSystem.destroy()
      this.scene.start('FaradayExperimentScene')
    })
  }
}

