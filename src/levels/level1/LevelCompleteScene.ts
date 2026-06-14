import Phaser from 'phaser'
import { ProgressSystem } from '../../systems/ProgressSystem.ts'
import { LEVELS } from '../../data/levels.ts'

const LEVEL1 = LEVELS['level1']

export class LevelCompleteScene extends Phaser.Scene {
  constructor() {
    super({ key: 'LevelCompleteScene' })
  }

  create(): void {
    const w = this.scale.width
    const h = this.scale.height

    this.cameras.main.setBackgroundColor('#0a0a1a')
    this.cameras.main.fadeIn(600, 0, 0, 0)

    const bgImage = this.add.image(w / 2, h / 2, 'background')
    bgImage.setDisplaySize(w, h)
    bgImage.setAlpha(0.08)
    bgImage.setDepth(0)

    this.createBackground(w, h)
    this.createTimelineDisplay(w)
    this.createFragment(w, h)
    this.createCompletionText(w, h)
    this.createParticles(w, h)
    this.createContinueButton(w, h)
  }

  private createBackground(w: number, h: number): void {
    const bg = this.add.graphics()
    bg.setDepth(0)
    bg.fillGradientStyle(0x0a0a1a, 0x0a0a1a, 0x1a0a2e, 0x1a0a2e, 1)
    bg.fillRect(0, 0, w, h)

    for (let i = 0; i < 60; i++) {
      bg.fillStyle(0xffffff, 0.02 + Math.random() * 0.04)
      bg.fillCircle(Math.random() * w, Math.random() * h, 0.5 + Math.random() * 1.5)
    }
  }

  private createTimelineDisplay(w: number): void {
    const timelineY = 80
    const timelineG = this.add.graphics()
    timelineG.setDepth(2)

    timelineG.lineStyle(2, 0x4a3728, 0.6)
    timelineG.beginPath()
    timelineG.moveTo(60, timelineY)
    timelineG.lineTo(w - 60, timelineY)
    timelineG.strokePath()

    const eras = [
      { year: '1015', label: 'Ibn al-Haytham', active: true },
      { year: '1666', label: 'Newton', active: false },
      { year: '1774', label: 'Lavoisier', active: false },
      { year: '1831', label: 'Faraday', active: false },
      { year: '????', label: 'Future', active: false },
    ]

    for (let i = 0; i < eras.length; i++) {
      const era = eras[i]
      const x = 60 + (w - 120) * (i / (eras.length - 1))

      if (era.active) {
        timelineG.fillStyle(0xffd700, 1)
        timelineG.fillCircle(x, timelineY, 6)
        timelineG.fillStyle(0xffd700, 0.2)
        timelineG.fillCircle(x, timelineY, 12)
      } else {
        timelineG.fillStyle(0x333333, 0.6)
        timelineG.fillCircle(x, timelineY, 4)
      }

      const label = this.add.text(x, timelineY + 15, era.year, {
        fontSize: '9px',
        color: era.active ? '#ffd700' : '#4a3728',
        fontFamily: 'Georgia, serif',
      })
      label.setOrigin(0.5, 0)

      const subLabel = this.add.text(x, timelineY + 28, era.label, {
        fontSize: '8px',
        color: era.active ? '#e0d5c1' : '#333333',
        fontFamily: 'Georgia, serif',
      })
      subLabel.setOrigin(0.5, 0)
    }
  }

  private createFragment(w: number, h: number): void {
    const cx = w / 2
    const cy = h / 2

    const fragmentBg = this.add.graphics()
    fragmentBg.setDepth(5)
    fragmentBg.fillStyle(0x000000, 0.6)
    fragmentBg.fillRoundedRect(cx - 80, cy - 80, 160, 160, 16)
    fragmentBg.lineStyle(2, LEVEL1.fragment.color, 0.8)

    const fragG = this.add.graphics()
    fragG.setDepth(6)

    const fragSize = 50
    const points = [
      { x: cx, y: cy - fragSize },
      { x: cx + fragSize * 0.7, y: cy - fragSize * 0.4 },
      { x: cx + fragSize * 0.4, y: cy + fragSize * 0.7 },
      { x: cx - fragSize * 0.4, y: cy + fragSize * 0.7 },
      { x: cx - fragSize * 0.7, y: cy - fragSize * 0.4 },
    ]

    const fragment = this.add.graphics()
    fragment.setDepth(6)
    fragment.fillStyle(LEVEL1.fragment.color, 0.8)
    fragment.beginPath()
    fragment.moveTo(points[0].x, points[0].y)
    for (let i = 1; i < points.length; i++) {
      fragment.lineTo(points[i].x, points[i].y)
    }
    fragment.closePath()
    fragment.fillPath()

    fragment.lineStyle(2, 0xffffff, 0.5)
    fragment.beginPath()
    fragment.moveTo(cx, cy - 15)
    fragment.lineTo(cx, cy + 15)
    fragment.strokePath()
    fragment.beginPath()
    fragment.moveTo(cx - 15, cy)
    fragment.lineTo(cx + 15, cy)
    fragment.strokePath()

    fragment.setScale(0)
    fragment.setAlpha(0)

    this.tweens.add({
      targets: fragment,
      scale: 1,
      alpha: 1,
      duration: 1500,
      ease: 'Back.easeOut',
    })

    this.tweens.add({
      targets: fragment,
      angle: { from: -10, to: 10 },
      duration: 3000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
      delay: 2000,
    })

    const fragmentName = this.add.text(cx, cy + 85, LEVEL1.fragment.name, {
      fontSize: '14px',
      color: '#ffd700',
      fontFamily: 'Georgia, serif',
      fontStyle: 'italic',
    })
    fragmentName.setOrigin(0.5)
    fragmentName.setDepth(10)
    fragmentName.setAlpha(0)

    this.tweens.add({
      targets: fragmentName,
      alpha: 1,
      duration: 800,
      delay: 1500,
    })
  }

  private createCompletionText(w: number, h: number): void {
    const progressSystem = new ProgressSystem()
    const levelProgress = progressSystem.getProgress('level1')

    const xpText = this.add.text(w / 2, h * 0.15, `XP Score: ${levelProgress.xpScore}`, {
      fontSize: '16px',
      color: '#69db7c',
      fontFamily: 'Georgia, serif',
    })
    xpText.setOrigin(0.5)
    xpText.setDepth(10)
    xpText.setAlpha(0)
    this.tweens.add({ targets: xpText, alpha: 1, duration: 800, delay: 3000 })

    const restoredText = this.add.text(w / 2, h * 0.22, 'Science Fragment Recovered!', {
      fontSize: '20px',
      color: '#ffd700',
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

    const descText = this.add.text(w / 2, h * 0.85, LEVEL1.fragment.description, {
      fontSize: '13px',
      color: '#e0d5c1',
      fontFamily: 'Georgia, serif',
      fontStyle: 'italic',
    })
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
      speed: { min: 40, max: 80 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.5, end: 0 },
      alpha: { start: 0.8, end: 0 },
      frequency: 100,
      lifespan: 3000,
      quantity: 2,
      tint: LEVEL1.fragment.color,
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
      color: '#ffd700',
      fontFamily: 'Georgia, serif',
    })
    btn.setOrigin(0.5)
    btn.setDepth(20)
    btn.setAlpha(0)
    btn.setInteractive({ useHandCursor: true })

    btn.on('pointerover', () => btn.setColor('#ffffff'))
    btn.on('pointerout', () => btn.setColor('#ffd700'))
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
