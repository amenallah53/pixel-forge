import Phaser from 'phaser'
import { UIButton } from '../../ui/UIButton.ts'
import { ProgressSystem } from '../../systems/ProgressSystem.ts'
import { LEVELS } from '../../data/levels.ts'
import { t } from '../../i18n/index.ts'

const LEVEL3 = LEVELS.level3

export class Level3CompleteScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Level3CompleteScene' })
  }

  create(): void {
    const progressSystem = new ProgressSystem()
    if (!progressSystem.isLevelUnlocked('level3')) {
      this.scene.start('ScientiaMenuScene')
      return
    }

    const w = this.scale.width
    const h = this.scale.height
    this.cameras.main.setBackgroundColor('#05080d')
    this.cameras.main.fadeIn(700, 0, 0, 0)

    this.createLitCity(w, h)
    this.createFragment(w, h)
    this.createTimeline(w)

    this.add.text(w / 2, 38, t('level4complete.fragment'), {
      fontSize: '18px',
      color: '#f4d38a',
      fontFamily: 'Georgia, serif',
    }).setOrigin(0.5)

    this.add.text(w / 2, 68, LEVEL3.fragment.name, {
      fontSize: '24px',
      color: '#55d6ff',
      fontFamily: 'Georgia, serif',
      fontStyle: 'italic',
    }).setOrigin(0.5)

    const levelProgress = progressSystem.getProgress('level3')

    this.add.text(w / 2, h - 116, `${t('level4complete.xp')} ${levelProgress.xpScore}`, {
      fontSize: '16px',
      color: '#69db7c',
      fontFamily: 'Georgia, serif',
    }).setOrigin(0.5)

    this.add.text(w / 2, h - 90, t('level4complete.unlocked'), {
      fontSize: '12px',
      color: '#f0dfb8',
      fontFamily: 'Georgia, serif',
    }).setOrigin(0.5)

    new UIButton(this, w / 2, h - 48, 180, 34, t('level4complete.return'), 0x123225, 0x1f6349, () => {
      this.cameras.main.fadeOut(500, 0, 0, 0)
      this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('ScientiaMenuScene'))
    })
  }

  private createLitCity(w: number, h: number): void {
    const g = this.add.graphics()
    g.fillGradientStyle(0x05080d, 0x071c24, 0x17120e, 0x08070d, 1)
    g.fillRect(0, 0, w, h)

    for (let i = 0; i < 12; i++) {
      const bw = 42 + (i % 3) * 18
      const bh = 105 + (i % 4) * 30
      const x = i * 72 - 15
      const y = h - 125 - bh
      g.fillStyle(0x121a24, 0.96)
      g.fillRect(x, y, bw, bh)
      g.lineStyle(1, 0x38556a, 0.32)
      g.strokeRect(x, y, bw, bh)
      for (let wy = y + 14; wy < y + bh - 12; wy += 21) {
        for (let wx = x + 9; wx < x + bw - 8; wx += 16) {
          const lit = (wx + wy + i) % 3 !== 0
          g.fillStyle(lit ? 0xffe68a : 0x223341, lit ? 0.85 : 0.5)
          g.fillRect(wx, wy, 5, 8)
        }
      }
    }

    g.fillStyle(0x130e0b, 1)
    g.fillRect(0, h - 126, w, 126)

    const pulse = this.add.particles(w / 2, h / 2, 'particle', {
      x: { min: -w / 2, max: w / 2 },
      y: { min: -h / 2, max: h / 2 },
      speed: { min: 15, max: 80 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.7, end: 0 },
      alpha: { start: 0.8, end: 0 },
      frequency: 80,
      lifespan: 2200,
      tint: 0x55d6ff,
    })
    pulse.setDepth(1)
  }

  private createFragment(w: number, h: number): void {
    const cx = w / 2
    const cy = h / 2 - 10
    const fragment = this.add.graphics().setDepth(5)
    const size = 58
    fragment.fillStyle(LEVEL3.fragment.color, 0.86)
    fragment.beginPath()
    for (let i = 0; i < 6; i++) {
      const angle = Phaser.Math.DegToRad(30 + i * 60)
      const r = i % 2 === 0 ? size : size * 0.62
      const x = cx + Math.cos(angle) * r
      const y = cy + Math.sin(angle) * r
      if (i === 0) fragment.moveTo(x, y)
      else fragment.lineTo(x, y)
    }
    fragment.closePath()
    fragment.fillPath()
    fragment.lineStyle(2, 0xffffff, 0.55)
    fragment.strokePath()
    fragment.lineStyle(3, 0xffffff, 0.72)
    fragment.strokeCircle(cx, cy, 22)
    fragment.lineBetween(cx - 34, cy, cx + 34, cy)
    fragment.lineBetween(cx, cy - 34, cx, cy + 34)
    fragment.setScale(0)
    this.tweens.add({ targets: fragment, scale: 1, duration: 1300, ease: 'Back.easeOut' })
    this.tweens.add({ targets: fragment, angle: 360, duration: 9000, repeat: -1, ease: 'Linear', delay: 1300 })
  }

  private createTimeline(w: number): void {
    const y = 112
    const g = this.add.graphics()
    g.lineStyle(2, 0x38556a, 0.65)
    g.lineBetween(80, y, w - 80, y)
    const eras = [t('timeline.1015'), t('timeline.1666'), t('timeline.1774'), t('timeline.1831'), t('timeline.future')]
    for (let i = 0; i < eras.length; i++) {
      const x = 80 + (w - 160) * (i / (eras.length - 1))
      const active = i <= 3
      g.fillStyle(active ? 0x55d6ff : 0x333333, active ? 1 : 0.55)
      g.fillCircle(x, y, active ? 6 : 4)
      this.add.text(x, y + 14, eras[i], {
        fontSize: '9px',
        color: active ? '#9fcfe0' : '#555555',
        fontFamily: 'Georgia, serif',
      }).setOrigin(0.5, 0)
    }
  }
}

