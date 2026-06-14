import Phaser from 'phaser'
import { UIButton } from '../ui/UIButton.ts'
import { ProgressSystem } from '../systems/ProgressSystem.ts'
import { t, getLanguages, setLanguage, getLanguage, type Locale } from '../i18n/index.ts'

export class ScientiaMenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ScientiaMenuScene' })
  }

  create(): void {
    const w = this.scale.width
    const h = this.scale.height
    const progressSystem = new ProgressSystem()
    const level3Unlocked = progressSystem.isLevelUnlocked('level3')
    const level4Unlocked = progressSystem.isLevelUnlocked('level4')

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

    const titleLine2 = this.add.text(w / 2, 148, t('menu.subtitle'), {
      fontSize: '18px',
      color: '#e0d5c1',
      fontFamily: 'Georgia, serif',
      fontStyle: 'italic',
    })
    titleLine2.setOrigin(0.5, 0)

    const subtitleBox = this.add.graphics()
    subtitleBox.fillStyle(0x000000, 0.4)
    subtitleBox.fillRoundedRect(w / 2 - 250, 220, 500, 40, 8)

    const subtitle = this.add.text(w / 2, 240, t('menu.choose'), {
      fontSize: '14px',
      color: '#8a7f6e',
      fontFamily: 'Georgia, serif',
    })
    subtitle.setOrigin(0.5)

    new UIButton(this, w / 2, 305, 300, 46, t('menu.level1'), 0x2a1a0a, 0x4a3728, () => {
      this.cameras.main.fadeOut(600, 0, 0, 0)
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('Level1IntroScene')
      })
    })

    const level3BtnLabel = level3Unlocked ? t('menu.level2') : t('menu.level2') + ' ' + t('menu.locked')
    const level3Button = new UIButton(
      this,
      w / 2,
      365,
      300,
      46,
      level3BtnLabel,
      0x4a3020,
      0x6b462f,
      () => {
        if (!level3Unlocked) return
        this.cameras.main.fadeOut(600, 0, 0, 0)
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.scene.start('Level3IntroScene')
        })
      },
    )
    level3Button.enabled = level3Unlocked

    if (!level3Unlocked) {
      this.add.text(w / 2, 416, t('menu.lockedHint1'), {
        fontSize: '12px',
        color: '#8a7f6e',
        fontFamily: 'Georgia, serif',
      }).setOrigin(0.5)
    }

    const level4BtnLabel = level4Unlocked ? t('menu.level3') : t('menu.level3') + ' ' + t('menu.locked')
    const level4Button = new UIButton(
      this,
      w / 2,
      435,
      300,
      46,
      level4BtnLabel,
      0x123225,
      0x1f6349,
      () => {
        if (!level4Unlocked) return
        this.cameras.main.fadeOut(600, 0, 0, 0)
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.scene.start('Level4IntroScene')
        })
      },
    )
    level4Button.enabled = level4Unlocked

    if (!level4Unlocked) {
      this.add.text(w / 2, 486, t('menu.lockedHint3'), {
        fontSize: '12px',
        color: '#8a7f6e',
        fontFamily: 'Georgia, serif',
      }).setOrigin(0.5)
    }

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
    const dotKeys = ['timeline.1015', 'timeline.1666', 'timeline.1774', 'timeline.1831', 'timeline.future']
    for (let i = 0; i < dotMarkers.length; i++) {
      const dx = 40 + (w - 80) * dotMarkers[i]
      const playable = i === 0 || (i === 2 && level3Unlocked) || (i === 3 && level4Unlocked)
      timeline.fillStyle(playable ? 0xffd700 : 0x4a3728, playable ? 1 : 0.5)
      timeline.fillCircle(dx, 400, playable ? 5 : 3)

      const label = this.add.text(dx, 415, t(dotKeys[i]), {
        fontSize: '9px',
        color: playable ? '#ffd700' : '#4a3728',
        fontFamily: 'Georgia, serif',
      })
      label.setOrigin(0.5, 0)
    }

    this.createLanguageSelector(w, h)
  }

  private createLanguageSelector(w: number, h: number): void {
    const langG = this.add.graphics().setDepth(30)
    langG.fillStyle(0x000000, 0.5)
    langG.fillRoundedRect(w / 2 - 130, h - 50, 260, 38, 8)
    langG.lineStyle(1, 0x4a3728, 0.4)
    langG.strokeRoundedRect(w / 2 - 130, h - 50, 260, 38, 8)

    const langs = getLanguages()
    const current = getLanguage()
    const btnW = 80
    const totalW = langs.length * btnW
    const startX = w / 2 - totalW / 2

    langs.forEach((lang, i) => {
      const bx = startX + i * btnW + btnW / 2
      const by = h - 31

      const isActive = lang.code === current

      if (isActive) {
        langG.fillStyle(0xffd700, 0.15)
        langG.fillRoundedRect(bx - btnW / 2 + 4, by - 12, btnW - 8, 24, 4)
      }

      const txt = this.add.text(bx, by, lang.label, {
        fontSize: '11px',
        color: isActive ? '#ffd700' : '#8a7f6e',
        fontFamily: lang.code === 'ar' ? 'Tahoma, sans-serif' : 'Georgia, serif',
      }).setOrigin(0.5).setDepth(31).setInteractive({ useHandCursor: true })

      txt.on('pointerdown', () => {
        if (lang.code === current) return
        setLanguage(lang.code as Locale)
        this.cameras.main.fadeOut(300, 0, 0, 0)
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.scene.restart()
        })
      })

      txt.on('pointerover', () => txt.setColor('#ffffff'))
      txt.on('pointerout', () => txt.setColor(isActive ? '#ffd700' : '#8a7f6e'))
    })
  }
}
