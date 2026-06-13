import Phaser from 'phaser'
import { UIButton } from '../ui/UIButton.ts'

export class ScientiaMenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ScientiaMenuScene' })
  }

  create(): void {
    const w = this.scale.width
    const h = this.scale.height

    this.cameras.main.setBackgroundColor('#0a0a1a')

    const bgImage = this.add.image(w / 2, h / 2, 'background')
    bgImage.setDisplaySize(w, h)
    bgImage.setAlpha(0.3)

    const stars = this.add.graphics()
    for (let i = 0; i < 80; i++) {
      const sx = Math.random() * w
      const sy = Math.random() * h
      const sr = 0.5 + Math.random() * 1.5
      stars.fillStyle(0xffffff, 0.3 + Math.random() * 0.5)
      stars.fillCircle(sx, sy, sr)
    }

    this.tweens.add({
      targets: stars,
      alpha: { from: 0.6, to: 1 },
      duration: 2000 + Math.random() * 2000,
      yoyo: true,
      repeat: -1,
    })

    const titleBg = this.add.graphics()
    titleBg.fillStyle(0x000000, 0.5)
    titleBg.fillRoundedRect(w / 2 - 280, 80, 560, 100, 16)
    titleBg.lineStyle(2, 0xffd700, 0.6)

    const titleLine1 = this.add.text(w / 2, 100, 'SCIENTIA', {
      fontSize: '42px',
      color: '#ffd700',
      fontFamily: 'Georgia, serif',
      fontStyle: 'italic',
    })
    titleLine1.setOrigin(0.5, 0)

    const titleLine2 = this.add.text(w / 2, 148, 'The Lost Discoveries', {
      fontSize: '18px',
      color: '#e0d5c1',
      fontFamily: 'Georgia, serif',
      fontStyle: 'italic',
    })
    titleLine2.setOrigin(0.5, 0)

    const subtitleBox = this.add.graphics()
    subtitleBox.fillStyle(0x000000, 0.4)
    subtitleBox.fillRoundedRect(w / 2 - 250, 220, 500, 40, 8)

    const subtitle = this.add.text(w / 2, 240, 'Level 1: Ibn al-Haytham — The Secret of Light', {
      fontSize: '14px',
      color: '#8a7f6e',
      fontFamily: 'Georgia, serif',
    })
    subtitle.setOrigin(0.5)

    new UIButton(this, w / 2, 320, 240, 50, '▶ BEGIN EXPERIMENT', 0x2a1a0a, 0x4a3728, () => {
      this.cameras.main.fadeOut(600, 0, 0, 0)
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('Level1IntroScene')
      })
    })

    const particleBg = this.add.particles(w / 2, 0, 'particle', {
      x: { min: -w / 2, max: w / 2 },
      y: { min: 0, max: h },
      speed: { min: 5, max: 20 },
      angle: { min: 80, max: 100 },
      scale: { start: 0.5, end: 0 },
      alpha: { start: 0.4, end: 0 },
      frequency: 300,
      lifespan: 6000,
      quantity: 1,
    })
    particleBg.setDepth(-1)

    this.cameras.main.fadeIn(600, 0, 0, 0)

    const timeline = this.add.graphics()
    timeline.lineStyle(1, 0x4a3728, 0.5)
    timeline.beginPath()
    timeline.moveTo(40, 400)
    timeline.lineTo(w - 40, 400)
    timeline.strokePath()

    const dotMarkers = [0.2, 0.4, 0.6, 0.8, 1.0]
    const dotLabels = ['1015', '1666', '1774', '1831', '????']
    for (let i = 0; i < dotMarkers.length; i++) {
      const dx = 40 + (w - 80) * dotMarkers[i]
      timeline.fillStyle(i === 0 ? 0xffd700 : 0x4a3728, i === 0 ? 1 : 0.5)
      timeline.fillCircle(dx, 400, i === 0 ? 5 : 3)

      const label = this.add.text(dx, 415, dotLabels[i], {
        fontSize: '9px',
        color: i === 0 ? '#ffd700' : '#4a3728',
        fontFamily: 'Georgia, serif',
      })
      label.setOrigin(0.5, 0)
    }
  }
}
