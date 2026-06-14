import Phaser from 'phaser'
import { UIButton } from '../../ui/UIButton.ts'
import { ProgressSystem } from '../../systems/ProgressSystem.ts'
import { LEVELS } from '../../data/levels.ts'

type Bubble = {
  x: number
  y: number
  radius: number
  speed: number
  alpha: number
}

type Vapor = {
  t: number
  speed: number
  contaminated: boolean
  wobble: number
  alpha: number
}

type Droplet = {
  x: number
  y: number
  vx: number
  vy: number
  contaminated: boolean
  alpha: number
  radius: number
}

const DISTILLATION = LEVELS.level2

export class DistillationScene extends Phaser.Scene {
  private progressSystem!: ProgressSystem
  private apparatusG!: Phaser.GameObjects.Graphics
  private effectG!: Phaser.GameObjects.Graphics
  private uiG!: Phaser.GameObjects.Graphics
  private titleText!: Phaser.GameObjects.Text
  private instructionText!: Phaser.GameObjects.Text
  private heatText!: Phaser.GameObjects.Text
  private statusText!: Phaser.GameObjects.Text
  private collectionText!: Phaser.GameObjects.Text
  private purityText!: Phaser.GameObjects.Text
  private warningText!: Phaser.GameObjects.Text
  private sliderKnob!: Phaser.GameObjects.Ellipse
  private sliderTrack!: Phaser.GameObjects.Rectangle
  private sliderHit!: Phaser.GameObjects.Rectangle
  private collectionLevel = 0
  private purity = 1
  private heat = 35
  private completed = false
  private draggingHeat = false
  private bubbleAccumulator = 0
  private vaporAccumulator = 0
  private dropletAccumulator = 0
  private bubbles: Bubble[] = []
  private vapors: Vapor[] = []
  private droplets: Droplet[] = []
  private continueButton?: UIButton

  constructor() {
    super({ key: 'DistillationScene' })
  }

  create(): void {
    this.progressSystem = new ProgressSystem()
    if (!this.progressSystem.isLevelUnlocked('level2')) {
      this.scene.start('ScientiaMenuScene')
      return
    }

    const w = this.scale.width
    const h = this.scale.height

    this.cameras.main.setBackgroundColor('#0d1116')
    this.cameras.main.fadeIn(700, 0, 0, 0)

    this.drawBackground(w, h)
    this.drawApparatus(w, h)
    this.createHud(w, h)
    this.createSlider(w, h)
    this.createControls(w, h)
    this.createInputHandlers()
    this.updateUi()
  }

  update(_time: number, delta: number): void {
    const dt = delta / 1000

    if (!this.completed) {
      this.updateExperiment(dt)
    }

    this.updateParticles(dt)
    this.drawDynamicElements()
    this.updateUi()
  }

  private drawBackground(w: number, h: number): void {
    const bg = this.add.graphics()
    bg.fillGradientStyle(0x0d1116, 0x151922, 0x2a1a0d, 0x0d1116, 1)
    bg.fillRect(0, 0, w, h)

    for (let i = 0; i < 72; i++) {
      bg.fillStyle(0xffffff, 0.02 + Math.random() * 0.03)
      bg.fillCircle(Math.random() * w, Math.random() * h, 0.5 + Math.random() * 1.4)
    }

    const table = this.add.graphics()
    table.fillStyle(0x2a1a0d, 0.94)
    table.fillRect(0, h - 130, w, 130)
    table.lineStyle(1, 0x6d4b2e, 0.35)
    table.lineBetween(0, h - 130, w, h - 130)

    this.titleText = this.add.text(w / 2, 26, DISTILLATION.title, {
      fontSize: '19px',
      color: '#f2c86f',
      fontFamily: 'Georgia, serif',
    }).setOrigin(0.5)

    this.add.text(w / 2, 50, 'HEAT -> VAPOR -> COOLING -> LIQUID', {
      fontSize: '12px',
      color: '#9fcfe0',
      fontFamily: 'Georgia, serif',
      letterSpacing: 1,
    }).setOrigin(0.5)

    this.instructionText = this.add.text(w / 2, 74, 'Use the heat slider to keep the flask in the optimal range.', {
      fontSize: '12px',
      color: '#e8d9be',
      fontFamily: 'Georgia, serif',
    }).setOrigin(0.5)
  }

  private drawApparatus(w: number, h: number): void {
    this.apparatusG = this.add.graphics()
    this.effectG = this.add.graphics()
    this.uiG = this.add.graphics()

    const flaskX = 200
    const flaskY = 280
    const tubeY = 220
    const tubeStartX = 258
    const tubeEndX = 550
    const receiverX = 635
    const receiverY = 318

    this.apparatusG.lineStyle(3, 0xe8f3f6, 0.82)
    this.apparatusG.fillStyle(0x0c1117, 0.38)

    this.apparatusG.fillCircle(flaskX, flaskY + 24, 68)
    this.apparatusG.strokeCircle(flaskX, flaskY + 24, 68)
    this.apparatusG.fillRoundedRect(flaskX - 15, flaskY - 58, 30, 84, 8)
    this.apparatusG.strokeRoundedRect(flaskX - 15, flaskY - 58, 30, 84, 8)
    this.apparatusG.lineStyle(6, 0xe8f3f6, 0.72)
    this.apparatusG.beginPath()
    this.apparatusG.moveTo(flaskX + 15, flaskY - 16)
    this.apparatusG.lineTo(tubeStartX, tubeY)
    this.apparatusG.lineTo(tubeEndX, tubeY)
    this.apparatusG.strokePath()
    this.apparatusG.lineStyle(2, 0x9fcfe0, 0.45)
    this.apparatusG.lineBetween(tubeStartX, tubeY - 4, tubeEndX, tubeY - 4)

    this.apparatusG.fillStyle(0x0c1117, 0.36)
    this.apparatusG.fillRoundedRect(receiverX - 52, receiverY - 72, 104, 140, 12)
    this.apparatusG.lineStyle(3, 0xe8f3f6, 0.82)
    this.apparatusG.strokeRoundedRect(receiverX - 52, receiverY - 72, 104, 140, 12)
    this.apparatusG.lineStyle(2, 0x9fcfe0, 0.5)
    this.apparatusG.lineBetween(receiverX - 40, receiverY - 60, receiverX + 40, receiverY - 60)
    this.apparatusG.lineBetween(receiverX, receiverY - 92, receiverX, receiverY - 72)

    this.apparatusG.fillStyle(0x100c08, 1)
    this.apparatusG.fillRect(0, h - 84, w, 84)
    this.apparatusG.fillStyle(0x24150b, 0.9)
    this.apparatusG.fillRect(flaskX - 85, h - 106, 132, 16)
    this.apparatusG.fillRect(flaskX - 10, h - 96, 18, 52)
    this.apparatusG.fillRect(flaskX - 45, h - 96, 18, 52)

    this.apparatusG.fillStyle(0x8d6b3c, 0.8)
    this.apparatusG.fillRect(flaskX - 42, h - 136, 84, 12)
    this.apparatusG.lineStyle(1, 0xcfae82, 0.4)
    this.apparatusG.lineBetween(flaskX - 52, h - 136, flaskX + 52, h - 136)

    this.apparatusG.fillStyle(0xffb347, 0.65)
    this.apparatusG.fillTriangle(flaskX - 16, h - 110, flaskX, h - 146, flaskX + 16, h - 110)
    this.apparatusG.fillStyle(0xfff1a8, 0.55)
    this.apparatusG.fillTriangle(flaskX - 8, h - 112, flaskX, h - 136, flaskX + 8, h - 112)

    this.add.text(flaskX, flaskY - 82, 'Heated flask', {
      fontSize: '10px',
      color: '#cfae82',
      fontFamily: 'Georgia, serif',
    }).setOrigin(0.5)

    this.add.text((tubeStartX + tubeEndX) / 2, tubeY - 26, 'Vapor tube / condenser', {
      fontSize: '10px',
      color: '#9fcfe0',
      fontFamily: 'Georgia, serif',
    }).setOrigin(0.5)

    this.add.text(receiverX, receiverY - 98, 'Receiving container', {
      fontSize: '10px',
      color: '#cfae82',
      fontFamily: 'Georgia, serif',
    }).setOrigin(0.5)

    this.add.text(flaskX + 108, flaskY + 108, 'Heat the mixture carefully', {
      fontSize: '11px',
      color: '#e8d9be',
      fontFamily: 'Georgia, serif',
      fontStyle: 'italic',
    }).setOrigin(0.5)

    this.add.text(120, 160, 'This setup is already assembled.', {
      fontSize: '12px',
      color: '#f2c86f',
      fontFamily: 'Georgia, serif',
    })
  }

  private createHud(w: number, h: number): void {
    this.heatText = this.add.text(40, h - 108, '', {
      fontSize: '14px',
      color: '#f2c86f',
      fontFamily: 'Georgia, serif',
    })

    this.collectionText = this.add.text(40, h - 88, '', {
      fontSize: '12px',
      color: '#e8d9be',
      fontFamily: 'Georgia, serif',
    })

    this.purityText = this.add.text(40, h - 68, '', {
      fontSize: '12px',
      color: '#e8d9be',
      fontFamily: 'Georgia, serif',
    })

    this.statusText = this.add.text(w / 2, h - 108, '', {
      fontSize: '13px',
      color: '#9fcfe0',
      fontFamily: 'Georgia, serif',
      align: 'center',
      wordWrap: { width: 400 },
    }).setOrigin(0.5, 0)

    this.warningText = this.add.text(w / 2, h - 82, '', {
      fontSize: '12px',
      color: '#f5d0a9',
      fontFamily: 'Georgia, serif',
      fontStyle: 'italic',
      align: 'center',
    }).setOrigin(0.5, 0)
  }

  private createSlider(w: number, h: number): void {
    const trackX = w / 2 - 170
    const trackY = h - 48
    const trackW = 340

    this.uiG.fillStyle(0x0b1118, 0.92)
    this.uiG.fillRoundedRect(trackX - 24, trackY - 24, trackW + 48, 48, 12)
    this.uiG.lineStyle(1, 0x9fcfe0, 0.35)
    this.uiG.strokeRoundedRect(trackX - 24, trackY - 24, trackW + 48, 48, 12)

    this.sliderTrack = this.add.rectangle(trackX + trackW / 2, trackY, trackW, 10, 0x3f4d5d, 0.95)
    this.sliderTrack.setStrokeStyle(2, 0x9fcfe0, 0.5)
    this.sliderKnob = this.add.ellipse(trackX, trackY, 22, 22, 0xf2c86f, 1)
    this.sliderKnob.setStrokeStyle(2, 0xffffff, 0.75)

    const marks = [0, 40, 80, 100]
    for (const mark of marks) {
      const x = Phaser.Math.Linear(trackX, trackX + trackW, mark / 100)
      this.add.text(x, trackY + 18, `${mark}%`, {
        fontSize: '9px',
        color: mark === 40 || mark === 80 ? '#9fcfe0' : '#6c7a88',
        fontFamily: 'Georgia, serif',
      }).setOrigin(0.5, 0)
    }

    this.add.text(trackX - 86, trackY - 9, 'Heat Slider', {
      fontSize: '12px',
      color: '#f2c86f',
      fontFamily: 'Georgia, serif',
    })

    this.sliderHit = this.add.rectangle(trackX + trackW / 2, trackY, trackW + 36, 40, 0x000000, 0)
    this.sliderHit.setInteractive({ useHandCursor: true })
    this.sliderHit.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.draggingHeat = true
      this.setHeatFromPointer(pointer.x, trackX, trackW)
    })
  }

  private createControls(w: number, h: number): void {
    new UIButton(this, 98, 166, 120, 30, 'Hint', 0x2a1a0a, 0x4a3728, () =>
      this.showHint(),
    )
    new UIButton(this, 236, 166, 160, 30, 'Restart', 0x2a1a0a, 0x4a3728, () =>
      this.scene.restart(),
    )

    const continueButton = new UIButton(
      this,
      w - 115,
      h - 52,
      185,
      36,
      'Take the Quiz',
      0x123225,
      0x1f6349,
      () => {
        this.cameras.main.fadeOut(500, 0, 0, 0)
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.scene.start('Level2QuizScene')
        })
      },
    )
    continueButton.enabled = false
    this.continueButton = continueButton
  }

  private createInputHandlers(): void {
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (!this.draggingHeat) return
      this.setHeatFromPointer(pointer.x, this.sliderTrack.x - this.sliderTrack.width / 2, this.sliderTrack.width)
    })

    this.input.on('pointerup', () => {
      this.draggingHeat = false
    })
  }

  private setHeatFromPointer(pointerX: number, trackX: number, trackW: number): void {
    const ratio = Phaser.Math.Clamp((pointerX - trackX) / trackW, 0, 1)
    this.heat = Math.round(ratio * 100)
    this.updateSliderPosition(trackX, trackW)
  }

  private updateSliderPosition(trackX: number, trackW: number): void {
    this.sliderKnob.x = Phaser.Math.Linear(trackX, trackX + trackW, this.heat / 100)
    const inOptimal = this.heat >= 40 && this.heat <= 80
    this.sliderKnob.setFillStyle(inOptimal ? 0x69db7c : this.heat > 80 ? 0xff9f1c : 0xf2c86f, 1)
  }

  private updateExperiment(dt: number): void {
    const inOptimal = this.heat >= 40 && this.heat <= 80
    const overheated = this.heat > 80
    const heatedEnough = this.heat > 24

    if (heatedEnough) {
      this.spawnBubbles(dt)
    }

    if (this.heat >= 40) {
      this.spawnVapor(dt, overheated)
      this.spawnDroplets(dt, overheated)
    }

    if (inOptimal) {
      const centerDistance = Math.abs(this.heat - 60) / 20
      const efficiency = 0.45 + (1 - Phaser.Math.Clamp(centerDistance, 0, 1)) * 0.55
      const purityFactor = 0.5 + this.purity * 0.5
      this.collectionLevel = Math.min(100, this.collectionLevel + dt * (8 + 8 * efficiency * purityFactor))
      this.purity = Math.min(1, this.purity + dt * 0.03)
    } else if (overheated) {
      this.purity = Math.max(0.2, this.purity - dt * (0.12 + (this.heat - 80) * 0.01))
    } else {
      this.purity = Math.min(1, this.purity + dt * 0.01)
    }

    if (this.collectionLevel >= 100 && !this.completed) {
      this.completeExperiment()
    }
  }

  private spawnBubbles(dt: number): void {
    this.bubbleAccumulator += dt * (this.heat / 12)
    while (this.bubbleAccumulator >= 1) {
      this.bubbleAccumulator -= 1
      const spread = 44
      this.bubbles.push({
        x: 200 + Phaser.Math.Between(-spread / 2, spread / 2),
        y: 322 + Phaser.Math.Between(-10, 16),
        radius: Phaser.Math.Between(3, 7),
        speed: Phaser.Math.FloatBetween(28, 48),
        alpha: Phaser.Math.FloatBetween(0.55, 0.9),
      })
    }
  }

  private spawnVapor(dt: number, contaminated: boolean): void {
    this.vaporAccumulator += dt * (3 + this.heat * 0.06)
    while (this.vaporAccumulator >= 1) {
      this.vaporAccumulator -= 1
      this.vapors.push({
        t: 0,
        speed: Phaser.Math.FloatBetween(0.18, 0.28),
        contaminated,
        wobble: Phaser.Math.FloatBetween(0, Math.PI * 2),
        alpha: contaminated ? 0.75 : 0.92,
      })
    }
  }

  private spawnDroplets(dt: number, contaminated: boolean): void {
    this.dropletAccumulator += dt * (contaminated ? 3 : 4 + this.heat * 0.03)
    while (this.dropletAccumulator >= 1) {
      this.dropletAccumulator -= 1
      this.droplets.push({
        x: 550 + Phaser.Math.Between(-6, 6),
        y: 224,
        vx: Phaser.Math.FloatBetween(-5, 5),
        vy: Phaser.Math.FloatBetween(34, 56),
        contaminated,
        alpha: contaminated ? 0.72 : 0.9,
        radius: Phaser.Math.Between(2, 4),
      })
    }
  }

  private updateParticles(dt: number): void {
    this.bubbles = this.bubbles.filter((bubble) => {
      bubble.y -= bubble.speed * dt
      bubble.x += Math.sin((bubble.y + bubble.radius) * 0.08) * 10 * dt
      bubble.alpha -= dt * 0.14
      return bubble.y > 250 && bubble.alpha > 0
    })

    this.vapors = this.vapors.filter((vapor) => {
      vapor.t += vapor.speed * dt
      vapor.alpha -= dt * 0.04
      if (vapor.t >= 1) {
        return false
      }
      return vapor.alpha > 0
    })

    this.droplets = this.droplets.filter((droplet) => {
      droplet.x += droplet.vx * dt
      droplet.y += droplet.vy * dt
      droplet.vy += 52 * dt
      droplet.alpha -= dt * 0.08
      if (droplet.y >= 345) {
        droplet.alpha = 0
      }
      return droplet.alpha > 0 && droplet.y < 380
    })
  }

  private drawDynamicElements(): void {
    const flaskX = 200
    const flaskY = 280
    const tubeStartX = 258
    const tubeY = 220
    const tubeEndX = 550
    const receiverX = 635
    const receiverY = 318
    const receiverBottom = receiverY + 70

    this.effectG.clear()

    const flameStrength = Phaser.Math.Clamp(this.heat / 100, 0, 1)
    this.effectG.fillStyle(0xff9f1c, 0.18 + flameStrength * 0.28)
    this.effectG.fillCircle(flaskX, 486, 50 + flameStrength * 18)

    this.effectG.fillStyle(0xffb347, 0.35 + flameStrength * 0.4)
    this.effectG.fillTriangle(flaskX - 18, 478, flaskX, 448 - flameStrength * 18, flaskX + 18, 478)
    this.effectG.fillStyle(0xfff1a8, 0.22 + flameStrength * 0.3)
    this.effectG.fillTriangle(flaskX - 10, 476, flaskX, 460 - flameStrength * 12, flaskX + 10, 476)

    const flaskLiquidHeight = 20 + this.collectionLevel * 0.14
    const flaskColor = this.mixColor(0xf2c86f, 0xa56c47, 1 - this.purity)
    this.effectG.fillStyle(flaskColor, 0.55)
    this.effectG.fillEllipse(flaskX, flaskY + 34, 80, flaskLiquidHeight)

    const receiverFillHeight = 12 + this.collectionLevel * 1.15
    const receiverColor = this.mixColor(0xf2d58c, 0x8e623d, 1 - this.purity)
    this.effectG.fillStyle(receiverColor, 0.88)
    this.effectG.fillRect(receiverX - 40, receiverBottom - receiverFillHeight, 80, receiverFillHeight)
    this.effectG.fillStyle(0xffffff, 0.12)
    this.effectG.fillRect(receiverX - 34, receiverBottom - receiverFillHeight, 10, receiverFillHeight)

    for (const bubble of this.bubbles) {
      this.effectG.fillStyle(0xffffff, bubble.alpha * 0.38)
      this.effectG.fillCircle(bubble.x, bubble.y, bubble.radius)
      this.effectG.lineStyle(1, 0xcff4ff, bubble.alpha * 0.35)
      this.effectG.strokeCircle(bubble.x, bubble.y, bubble.radius + 1)
    }

    for (const vapor of this.vapors) {
      const x = Phaser.Math.Linear(tubeStartX + 6, tubeEndX - 6, vapor.t)
      const y = tubeY + Math.sin(vapor.t * Math.PI * 5 + vapor.wobble) * 3
      const color = vapor.contaminated ? 0xdca06a : 0xf8f0dc
      this.effectG.fillStyle(color, vapor.alpha)
      this.effectG.fillCircle(x, y, vapor.contaminated ? 4 : 3)
    }

    for (const droplet of this.droplets) {
      const color = droplet.contaminated ? 0x8d5f3c : 0xffdfaa
      this.effectG.fillStyle(color, droplet.alpha)
      this.effectG.fillCircle(droplet.x, droplet.y, droplet.radius)
    }

    this.updateSliderPosition(this.sliderTrack.x - this.sliderTrack.width / 2, this.sliderTrack.width)
  }

  private updateUi(): void {
    this.heatText.setText(`Heat: ${this.heat}%`)
    this.collectionText.setText(`Recovered perfume: ${Math.floor(this.collectionLevel)}%`)
    this.purityText.setText(`Purity: ${Math.floor(this.purity * 100)}%`)

    if (this.completed) {
      return
    }

    if (this.heat < 40) {
      this.statusText.setText('Not enough heat. Nothing happens.')
      this.warningText.setText('Raise the heat into the optimal zone.')
      this.warningText.setColor('#f5d0a9')
    } else if (this.heat <= 80) {
      this.statusText.setText('Good distillation. Vapor rises, cools, and collects as liquid perfume.')
      this.warningText.setText('Keep it steady here until the container fills.')
      this.warningText.setColor('#9fcfe0')
    } else {
      this.statusText.setText('Too much heat. The perfume becomes contaminated.')
      this.warningText.setText('Reduce heat before the purity drops too far.')
      this.warningText.setColor('#ff9f1c')
    }
  }

  private completeExperiment(): void {
    this.completed = true
    this.draggingHeat = false
    this.sliderHit.disableInteractive()
    if (this.continueButton) {
      this.continueButton.enabled = true
    }
    this.statusText.setText('Perfume recovered. Take the quiz to confirm the formula.')
    this.warningText.setText('The apparatus is stable. The next step is knowledge validation.')
    this.warningText.setColor('#f2c86f')
    this.instructionText.setText('Distillation complete. Press Take the Quiz when you are ready.')
  }

  private mixColor(start: number, end: number, amount: number): number {
    const mix = Phaser.Math.Clamp(amount, 0, 1)
    const sr = (start >> 16) & 0xff
    const sg = (start >> 8) & 0xff
    const sb = start & 0xff
    const er = (end >> 16) & 0xff
    const eg = (end >> 8) & 0xff
    const eb = end & 0xff
    const r = Math.round(Phaser.Math.Linear(sr, er, mix))
    const g = Math.round(Phaser.Math.Linear(sg, eg, mix))
    const b = Math.round(Phaser.Math.Linear(sb, eb, mix))
    return Phaser.Display.Color.GetColor(r, g, b)
  }
}
