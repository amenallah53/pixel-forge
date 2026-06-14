import Phaser from 'phaser'
import { UIButton } from '../../ui/UIButton.ts'
import { ProgressSystem } from '../../systems/ProgressSystem.ts'
import { LEVELS } from '../../data/levels.ts'

const LEVEL2 = LEVELS.level2

export class Level2CompleteScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Level2CompleteScene' })
  }

  create(): void {
    const progressSystem = new ProgressSystem()
    if (!progressSystem.isLevelUnlocked('level2')) {
      this.scene.start('ScientiaMenuScene')
      return
    }

    const w = this.scale.width
    const h = this.scale.height

    this.cameras.main.setBackgroundColor('#120d0b')
    this.cameras.main.fadeIn(700, 0, 0, 0)

    this.createPerfumeRoom(w, h)
    this.createTimelineDisplay(w)
    this.createFragment(w, h)
    this.createCompletionText(w, h, progressSystem)
    this.createParticles(w, h)
    this.createContinueButton(w, h)
  }

  private createPerfumeRoom(w: number, h: number): void {
    const bg = this.add.graphics()
    bg.setDepth(0)
    bg.fillGradientStyle(0x120d0b, 0x1f1711, 0x2f1c10, 0x120d0b, 1)
    bg.fillRect(0, 0, w, h)

    for (let i = 0; i < 64; i++) {
      bg.fillStyle(0xf2c86f, 0.02 + Math.random() * 0.04)
      bg.fillCircle(Math.random() * w, Math.random() * h, 0.5 + Math.random() * 1.4)
    }

    const desk = this.add.graphics()
    desk.fillStyle(0x2a1a0d, 0.96)
    desk.fillRect(0, h - 130, w, 130)

    const flaskX = w / 2 - 120
    const flaskY = h / 2 + 24
    const g = this.add.graphics()
    g.setDepth(1)
    g.lineStyle(3, 0xe8f3f6, 0.82)
    g.fillStyle(0x0b1118, 0.44)
    g.fillCircle(flaskX, flaskY + 12, 56)
    g.strokeCircle(flaskX, flaskY + 12, 56)
    g.fillRoundedRect(flaskX - 14, flaskY - 56, 28, 76, 8)
    g.strokeRoundedRect(flaskX - 14, flaskY - 56, 28, 76, 8)
    g.fillStyle(LEVEL2.fragment.color, 0.8)
    g.fillCircle(flaskX, flaskY + 22, 38)
    g.fillStyle(0xfff1a8, 0.25)
    g.fillTriangle(flaskX - 12, flaskY + 7, flaskX, flaskY - 22, flaskX + 12, flaskY + 7)

    const bottleX = w / 2 + 132
    g.fillStyle(0x0b1118, 0.44)
    g.fillRoundedRect(bottleX - 44, flaskY - 52, 88, 120, 10)
    g.lineStyle(3, 0xe8f3f6, 0.82)
    g.strokeRoundedRect(bottleX - 44, flaskY - 52, 88, 120, 10)
    g.fillStyle(LEVEL2.fragment.color, 0.72)
    g.fillRect(bottleX - 32, flaskY + 6, 64, 48)
    g.lineStyle(2, 0xf2d58c, 0.35)
    g.lineBetween(bottleX - 28, flaskY + 6, bottleX + 28, flaskY + 6)

    this.add.text(w / 2, 40, 'Science Fragment Recovered:', {
      fontSize: '18px',
      color: '#f2c86f',
      fontFamily: 'Georgia, serif',
    }).setOrigin(0.5)

    this.add.text(w / 2, 68, LEVEL2.fragment.name, {
      fontSize: '24px',
      color: '#ffd7a1',
      fontFamily: 'Georgia, serif',
      fontStyle: 'italic',
    }).setOrigin(0.5)
  }

  private createTimelineDisplay(w: number): void {
    const y = 110
    const g = this.add.graphics()
    g.setDepth(2)
    g.lineStyle(2, 0x8d6b3c, 0.6)
    g.lineBetween(60, y, w - 60, y)

    const eras = [
      { year: '1015', label: 'Ibn al-Haytham', active: true },
      { year: '1666', label: 'Newton', active: true },
      { year: '1774', label: 'Lavoisier', active: true },
      { year: '1831', label: 'Faraday', active: false },
      { year: '????', label: 'Future', active: false },
    ]

    for (let i = 0; i < eras.length; i++) {
      const era = eras[i]
      const x = 60 + (w - 120) * (i / (eras.length - 1))

      g.fillStyle(era.active ? 0xf2c86f : 0x333333, era.active ? 1 : 0.55)
      g.fillCircle(x, y, era.active ? 6 : 4)

      this.add.text(x, y + 15, era.year, {
        fontSize: '9px',
        color: era.active ? '#f2c86f' : '#5f5347',
        fontFamily: 'Georgia, serif',
      }).setOrigin(0.5, 0)

      this.add.text(x, y + 28, era.label, {
        fontSize: '8px',
        color: era.active ? '#e8d9be' : '#44403a',
        fontFamily: 'Georgia, serif',
      }).setOrigin(0.5, 0)
    }
  }

  private createFragment(w: number, h: number): void {
    const cx = w / 2
    const cy = h / 2

    const frag = this.add.graphics()
    frag.setDepth(5)
    frag.fillStyle(LEVEL2.fragment.color, 0.82)
    frag.fillRoundedRect(cx - 68, cy - 68, 136, 136, 18)
    frag.lineStyle(2, 0xffffff, 0.45)
    frag.strokeRoundedRect(cx - 68, cy - 68, 136, 136, 18)

    const drop = this.add.graphics()
    drop.setDepth(6)
    drop.fillStyle(0xfff1a8, 0.9)
    drop.beginPath()
    drop.moveTo(cx, cy - 36)
    drop.lineTo(cx + 26, cy)
    drop.lineTo(cx, cy + 36)
    drop.lineTo(cx - 26, cy)
    drop.closePath()
    drop.fillPath()
    drop.lineStyle(2, 0xffffff, 0.55)
    drop.strokePath()
    drop.setScale(0)
    this.tweens.add({ targets: drop, scale: 1, duration: 1300, ease: 'Back.easeOut' })
    this.tweens.add({ targets: drop, angle: 360, duration: 9000, repeat: -1, ease: 'Linear', delay: 1300 })

    this.add.text(cx, cy + 86, LEVEL2.fragment.description, {
      fontSize: '13px',
      color: '#e8d9be',
      fontFamily: 'Georgia, serif',
      fontStyle: 'italic',
      align: 'center',
      wordWrap: { width: 340 },
    }).setOrigin(0.5)
  }

  private createCompletionText(w: number, h: number, progressSystem: ProgressSystem): void {
    const levelProgress = progressSystem.getProgress('level2')

    const xpText = this.add.text(w / 2, h * 0.14, `XP Score: ${levelProgress.xpScore}`, {
      fontSize: '16px',
      color: '#69db7c',
      fontFamily: 'Georgia, serif',
    })
    xpText.setOrigin(0.5)
    xpText.setDepth(10)
    xpText.setAlpha(0)
    this.tweens.add({ targets: xpText, alpha: 1, duration: 800, delay: 3000 })

    const restoredText = this.add.text(w / 2, h * 0.22, 'Perfume Recovered!', {
      fontSize: '20px',
      color: '#f2c86f',
      fontFamily: 'Georgia, serif',
      fontStyle: 'italic',
    })
    restoredText.setOrigin(0.5)
    restoredText.setDepth(10)
    restoredText.setAlpha(0)

    this.tweens.add({
      targets: restoredText,
      alpha: 1,
      y: restoredText.y - 10,
      duration: 1000,
      delay: 500,
      ease: 'Power2',
    })

    this.add.text(w / 2, h - 92, 'Next timeline mission unlocked.', {
      fontSize: '12px',
      color: '#f0dfb8',
      fontFamily: 'Georgia, serif',
    }).setOrigin(0.5)

    const descText = this.add.text(
      w / 2,
      h * 0.84,
      'Distillation separates liquids using differences in boiling temperatures. Heating produces vapor. Cooling turns vapor back into liquid. This allows valuable substances to be separated and collected.',
      {
        fontSize: '13px',
        color: '#e8d9be',
        fontFamily: 'Georgia, serif',
        fontStyle: 'italic',
        wordWrap: { width: 620 },
        align: 'center',
      },
    )
    descText.setOrigin(0.5)
    descText.setDepth(10)
    descText.setAlpha(0)

    this.tweens.add({
      targets: descText,
      alpha: 1,
      duration: 800,
      delay: 2500,
    })
  }

  private createParticles(w: number, h: number): void {
    const cx = w / 2
    const cy = h / 2

    const convergeParticles = this.add.particles(cx, cy, 'particle', {
      x: { min: -w / 2, max: w / 2 },
      y: { min: -h / 2, max: h / 2 },
      speed: { min: 35, max: 75 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.5, end: 0 },
      alpha: { start: 0.8, end: 0 },
      frequency: 100,
      lifespan: 3000,
      quantity: 2,
      tint: LEVEL2.fragment.color,
    })
    convergeParticles.setDepth(4)

    this.time.delayedCall(4000, () => {
      this.tweens.add({
        targets: convergeParticles,
        alpha: 0,
        duration: 1000,
      })
    })
  }

  private createContinueButton(w: number, h: number): void {
    const btn = this.add.text(w / 2, h - 60, '[ CONTINUE ]', {
      fontSize: '16px',
      color: '#f2c86f',
      fontFamily: 'Georgia, serif',
    })
    btn.setOrigin(0.5)
    btn.setDepth(20)
    btn.setAlpha(0)
    btn.setInteractive({ useHandCursor: true })

    btn.on('pointerover', () => btn.setColor('#ffffff'))
    btn.on('pointerout', () => btn.setColor('#f2c86f'))
    btn.on('pointerdown', () => {
      this.cameras.main.fadeOut(600, 0, 0, 0)
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('ScientiaMenuScene')
      })
    })

    this.tweens.add({
      targets: btn,
      alpha: 1,
      duration: 800,
      delay: 3000,
    })
  }
}
