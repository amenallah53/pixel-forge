import Phaser from 'phaser'
import { DialogueSystem } from '../../systems/DialogueSystem.ts'
import { ThreeDWorld, type ThreeDObject } from '../../systems/ThreeDWorld.ts'
import { DIALOGUES } from '../../data/dialogues.ts'
import { UIButton } from '../../ui/UIButton.ts'

type DragObject = {
  sprite: Phaser.GameObjects.Image
  initialX: number
  initialY: number
  placed: boolean
  threeObj?: ThreeDObject
}

export class CameraObscuraScene extends Phaser.Scene {
  private dialogueSystem!: DialogueSystem
  private threeWorld!: ThreeDWorld
  private candle!: DragObject
  private box!: DragObject
  private apertureGraphic!: Phaser.GameObjects.Graphics
  private wallGraphic!: Phaser.GameObjects.Graphics
  private setupComplete = false
  private instructionText!: Phaser.GameObjects.Text
  private stepText!: Phaser.GameObjects.Text
  private stepIndicator!: Phaser.GameObjects.Graphics
  private projectionImage?: Phaser.GameObjects.Image
  private transitionLock = false
  private continueButton?: UIButton
  private threeFlame: ThreeDObject | null = null

  private static readonly CANDLE_TARGET = { x: 180, y: 340 }
  private static readonly BOX_TARGET = { x: 420, y: 330 }
  private static readonly APERTURE_X = 450
  private static readonly APERTURE_Y = 300
  private static readonly WALL_X = 590
  private static readonly WALL_Y = 300

  constructor() {
    super({ key: 'CameraObscuraScene' })
  }

  create(): void {
    const w = this.scale.width
    const h = this.scale.height

    this.cameras.main.setBackgroundColor('#08080f')
    this.cameras.main.fadeIn(800, 0, 0, 0)

    const bgImage = this.add.image(w / 2, h / 2, 'background')
    bgImage.setDisplaySize(w, h)
    bgImage.setAlpha(0.08)
    bgImage.setDepth(0)

    this.threeWorld = new ThreeDWorld(w, h)
    const canvas = this.threeWorld.getCanvas()
    canvas.style.zIndex = '5'
    canvas.style.opacity = '0.6'
    document.getElementById('root')?.appendChild(canvas)

    this.createStepIndicator(w)
    this.createLabBackground(w, h)
    this.createFloor(w, h)
    this.createTable(w, h)
    this.createAperture()
    this.createWall()
    this.createDropZones()
    this.createDraggableObjects()
    this.createLabels()
    this.createSceneControls(w, h)

    this.instructionText = this.add.text(w / 2, 16, 'Place the candle and box, then reveal the inverted image on the wall.', {
      fontSize: '12px',
      color: '#b8a88a',
      fontFamily: 'Georgia, serif',
    })
    this.instructionText.setOrigin(0.5, 0)
    this.instructionText.setDepth(20)

    this.showTutorialHand(w)
    this.createPedagogicalPanel(w, h)
  }

  private createStepIndicator(w: number): void {
    this.stepIndicator = this.add.graphics()
    this.stepIndicator.setDepth(30)
    const steps = ['Drag Objects', 'Align Aperture', 'Observe Inversion']
    const startX = w / 2 - 180
    for (let i = 0; i < steps.length; i++) {
      const x = startX + i * 180
      this.stepIndicator.fillStyle(i === 0 ? 0xffd700 : 0x333333, 0.6)
      this.stepIndicator.fillCircle(x, 40, 6)
      this.stepIndicator.fillStyle(i === 0 ? 0xffd700 : 0x333333, 0.4)
      this.stepIndicator.fillCircle(x, 40, 10)
      this.stepText = this.add.text(x, 52, steps[i], {
        fontSize: '9px',
        color: i === 0 ? '#ffd700' : '#555555',
        fontFamily: 'Georgia, serif',
      })
      this.stepText.setOrigin(0.5, 0)
      this.stepText.setDepth(30)
      if (i < steps.length - 1) {
        this.stepIndicator.lineStyle(1, 0x333333, 0.4)
        this.stepIndicator.beginPath()
        this.stepIndicator.moveTo(x + 10, 40)
        this.stepIndicator.lineTo(x + 170, 40)
        this.stepIndicator.strokePath()
      }
    }
  }

  private updateStepIndicator(step: number): void {
    this.stepIndicator.clear()
    const steps = ['Drag Objects', 'Align Aperture', 'Observe Inversion']
    const startX = this.scale.width / 2 - 180
    for (let i = 0; i < steps.length; i++) {
      const x = startX + i * 180
      const active = i <= step
      this.stepIndicator.fillStyle(active ? 0xffd700 : 0x333333, active ? 1 : 0.6)
      this.stepIndicator.fillCircle(x, 40, 6)
      this.stepIndicator.fillStyle(active ? 0xffd700 : 0x333333, active ? 0.3 : 0.4)
      this.stepIndicator.fillCircle(x, 40, 10)
      if (i < steps.length - 1) {
        this.stepIndicator.lineStyle(2, active ? 0xffd700 : 0x333333, active ? 0.5 : 0.3)
        this.stepIndicator.beginPath()
        this.stepIndicator.moveTo(x + 10, 40)
        this.stepIndicator.lineTo(x + 170, 40)
        this.stepIndicator.strokePath()
      }
    }
  }

  private createLabBackground(w: number, h: number): void {
    const bg = this.add.graphics()
    bg.setDepth(0)
    bg.fillGradientStyle(0x080810, 0x080810, 0x141408, 0x141408, 1)
    bg.fillRect(0, 0, w, h)

    for (let i = 0; i < 30; i++) {
      bg.fillStyle(0xffffff, 0.015 + Math.random() * 0.025)
      bg.fillCircle(Math.random() * w, Math.random() * h * 0.25, 0.5 + Math.random() * 1.2)
    }
  }

  private createFloor(w: number, h: number): void {
    const floor = this.add.graphics()
    floor.setDepth(1)
    floor.fillStyle(0x1a1410, 0.9)
    floor.fillRect(0, h - 45, w, 45)
    floor.lineStyle(1, 0x2a2018, 0.5)
    for (let x = 0; x < w; x += 40) {
      floor.beginPath()
      floor.moveTo(x, h - 45)
      floor.lineTo(x, h)
      floor.strokePath()
    }
  }

  private createTable(w: number, h: number): void {
    const tableG = this.add.graphics()
    tableG.setDepth(2)

    const tw = 520
    const tx = (w - tw) / 2
    const ty = h - 100

    tableG.fillStyle(0x3a2818, 0.85)
    tableG.fillRect(tx, ty, tw, 12)
    tableG.fillStyle(0x2a1a0a, 0.8)
    tableG.fillRect(tx + 5, ty + 12, 8, 55)
    tableG.fillRect(tx + tw - 13, ty + 12, 8, 55)

    tableG.lineStyle(1, 0x4a3828, 0.4)
    tableG.beginPath()
    tableG.moveTo(tx, ty)
    tableG.lineTo(tx + tw, ty)
    tableG.strokePath()
  }

  private createDropZones(): void {
    const dropG = this.add.graphics()
    dropG.setDepth(3)

    const candleZone = { x: CameraObscuraScene.CANDLE_TARGET.x, y: CameraObscuraScene.CANDLE_TARGET.y }
    const boxZone = { x: CameraObscuraScene.BOX_TARGET.x, y: CameraObscuraScene.BOX_TARGET.y }

    dropG.lineStyle(1, 0x5a4a3a, 0.3)
    dropG.strokeRoundedRect(candleZone.x - 30, candleZone.y - 30, 60, 60, 4)
    dropG.strokeRoundedRect(boxZone.x - 35, boxZone.y - 30, 70, 60, 4)

    dropG.fillStyle(0xffffff, 0.03)
    dropG.fillRect(candleZone.x - 30, candleZone.y - 30, 60, 60)
    dropG.fillRect(boxZone.x - 35, boxZone.y - 30, 70, 60)
  }

  private createAperture(): void {
    this.apertureGraphic = this.add.graphics()
    this.apertureGraphic.setDepth(8)

    const ax = CameraObscuraScene.APERTURE_X
    const ay = CameraObscuraScene.APERTURE_Y

    this.apertureGraphic.fillStyle(0x2a2018, 0.9)
    this.apertureGraphic.fillRect(ax - 25, ay - 55, 50, 110)

    this.apertureGraphic.fillStyle(0x000000, 1)
    this.apertureGraphic.fillRect(ax - 20, ay - 50, 40, 100)

    this.apertureGraphic.fillStyle(0x1a1410, 0.9)
    this.apertureGraphic.fillRect(ax - 2, ay - 50, 4, 100)

    this.apertureGraphic.fillStyle(0xffff44, 0.08)
    this.apertureGraphic.fillCircle(ax, ay, 3)

    this.apertureGraphic.setAlpha(0.6)
  }

  private createWall(): void {
    this.wallGraphic = this.add.graphics()
    this.wallGraphic.setDepth(4)

    const wx = CameraObscuraScene.WALL_X

    this.wallGraphic.fillStyle(0x1a1814, 0.5)
    this.wallGraphic.fillRect(wx - 4, 80, 8, 400)

    this.wallGraphic.lineStyle(1, 0x3a3020, 0.4)
    this.wallGraphic.beginPath()
    this.wallGraphic.moveTo(wx, 80)
    this.wallGraphic.lineTo(wx, 480)
    this.wallGraphic.strokePath()
  }

  private createLabels(): void {
    const candleLabel = this.add.text(CameraObscuraScene.CANDLE_TARGET.x, CameraObscuraScene.CANDLE_TARGET.y - 45, 'Place candle here', {
      fontSize: '9px',
      color: '#5a4a3a',
      fontFamily: 'Georgia, serif',
      fontStyle: 'italic',
    })
    candleLabel.setOrigin(0.5)
    candleLabel.setDepth(10)

    const boxLabel = this.add.text(CameraObscuraScene.BOX_TARGET.x, CameraObscuraScene.BOX_TARGET.y - 45, 'Place box here', {
      fontSize: '9px',
      color: '#5a4a3a',
      fontFamily: 'Georgia, serif',
      fontStyle: 'italic',
    })
    boxLabel.setOrigin(0.5)
    boxLabel.setDepth(10)

    this.add.text(CameraObscuraScene.APERTURE_X + 50, CameraObscuraScene.APERTURE_Y - 5, '- Aperture', {
      fontSize: '9px',
      color: '#5a4a3a',
      fontFamily: 'Georgia, serif',
    }).setOrigin(0, 0.5).setDepth(10)

    this.add.text(CameraObscuraScene.WALL_X + 15, CameraObscuraScene.WALL_Y - 5, '| Projection Wall', {
      fontSize: '9px',
      color: '#5a4a3a',
      fontFamily: 'Georgia, serif',
    }).setOrigin(0, 0.5).setDepth(10)
  }

  private createSceneControls(w: number, _h: number): void {
    this.add.text(w - 18, 18, 'Need a shortcut?', {
      fontSize: '9px',
      color: '#7f6b4c',
      fontFamily: 'Georgia, serif',
    }).setOrigin(1, 0).setDepth(45)

    this.continueButton = new UIButton(
      this,
      w - 118,
      44,
      180,
      30,
      'Skip to explanation',
      0x2a1a0a,
      0x4a3728,
      () => this.skipToNextScene(),
    )
    this.continueButton.setDepth(45)
  }

  private createPedagogicalPanel(w: number, _h: number): void {
    const panel = this.add.container(w / 2, 0).setDepth(40)

    const bg = new Phaser.GameObjects.Graphics(this)
    bg.fillStyle(0x000000, 0.7)
    bg.fillRoundedRect(-200, 0, 400, 100, 8)
    bg.lineStyle(1, 0xffd700, 0.3)
    bg.strokeRoundedRect(-200, 0, 400, 100, 8)
    panel.add(bg)

    const icon = new Phaser.GameObjects.Text(this, -180, 14, '!', {
      fontSize: '16px', color: '#ffd700', fontFamily: 'Georgia, serif', fontStyle: 'bold',
    })
    panel.add(icon)

    const title = new Phaser.GameObjects.Text(this, -150, 12, 'Camera Obscura - Ibn al-Haytham\'s Experiment', {
      fontSize: '12px', color: '#ffd700', fontFamily: 'Georgia, serif', fontStyle: 'italic',
    })
    panel.add(title)

    const desc = new Phaser.GameObjects.Text(this, -150, 34, 'Drag the candle and box to their positions.\nWe will observe how light behaves through a small hole.', {
      fontSize: '10px', color: '#b8a8a0', fontFamily: 'Georgia, serif',
      wordWrap: { width: 340 }, lineSpacing: 3,
    })
    panel.add(desc)

    const closeBtn = new Phaser.GameObjects.Text(this, 185, 85, '[OK]', {
      fontSize: '11px', color: '#ffd700', fontFamily: 'Georgia, serif',
    }).setOrigin(1, 0.5)
    closeBtn.setInteractive({ useHandCursor: true })
    closeBtn.on('pointerdown', () => {
      this.tweens.add({ targets: panel, alpha: 0, duration: 300, onComplete: () => panel.destroy() })
    })
    panel.add(closeBtn)

    panel.setAlpha(0)
    this.tweens.add({ targets: panel, y: 70, alpha: 1, duration: 500, ease: 'Back.easeOut' })
  }

  private showTutorialHand(_w: number): void {
    const hand = this.add.graphics()
    hand.setDepth(35)
    hand.fillStyle(0xffd700, 0.4)
    hand.fillCircle(120, 460, 12)
    hand.fillStyle(0xffd700, 0.15)
    hand.fillCircle(120, 460, 20)

    this.tweens.add({
      targets: hand,
      x: { from: 0, to: 80 },
      y: { from: 0, to: -80 },
      alpha: { from: 1, to: 0.3 },
      duration: 1200,
      yoyo: true,
      repeat: 3,
      ease: 'Sine.easeInOut',
    })

    this.time.delayedCall(5000, () => {
      this.tweens.add({ targets: hand, alpha: 0, duration: 500 })
    })
  }

  private createDraggableObjects(): void {
    this.candle = this.createDraggableItem('candle', 100, 470)
    this.box = this.createDraggableItem('box', 300, 470)
  }

  private createDraggableItem(key: string, x: number, y: number): DragObject {
    const isCandle = key === 'candle'
    const textureKey = isCandle ? 'candle' : 'wooden_box'
    const baseScale = isCandle ? 1.55 : 1.38
    const sprite = this.add.image(x, y, textureKey).setDepth(20)
    sprite.setScale(baseScale)
    sprite.setInteractive({ useHandCursor: true })
    this.input.setDraggable(sprite)

    const obj: DragObject = { sprite, initialX: x, initialY: y, placed: false }

    if (isCandle) {
      obj.threeObj = this.threeWorld.createCandle(x, y)
      this.threeWorld.addObject(obj.threeObj)
    } else {
      obj.threeObj = this.threeWorld.create3DBox(x, y)
      this.threeWorld.addObject(obj.threeObj)
    }

    sprite.on('dragstart', () => {
      sprite.setAlpha(0.95)
      sprite.setScale(baseScale * 1.08)
    })

    sprite.on('drag', (_pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
      sprite.x = dragX
      sprite.y = dragY
      if (obj.threeObj) {
        this.threeWorld.removeObject(obj.threeObj)
        obj.threeObj = isCandle
          ? this.threeWorld.createCandle(dragX, dragY)
          : this.threeWorld.create3DBox(dragX, dragY)
        this.threeWorld.addObject(obj.threeObj)
      }

      if (isCandle) {
        const dist = Phaser.Math.Distance.Between(dragX, dragY, CameraObscuraScene.CANDLE_TARGET.x, CameraObscuraScene.CANDLE_TARGET.y)
        sprite.setTint(dist < 50 ? 0x9dff9d : 0xffffff)
      } else {
        const dist = Phaser.Math.Distance.Between(dragX, dragY, CameraObscuraScene.BOX_TARGET.x, CameraObscuraScene.BOX_TARGET.y)
        sprite.setTint(dist < 50 ? 0xc8ffde : 0xffffff)
      }
    })

    sprite.on('dragend', () => {
      sprite.setAlpha(1)
      sprite.setScale(baseScale)
      sprite.clearTint()

      let targetX: number; let targetY: number
      if (isCandle) {
        targetX = CameraObscuraScene.CANDLE_TARGET.x
        targetY = CameraObscuraScene.CANDLE_TARGET.y
      } else {
        targetX = CameraObscuraScene.BOX_TARGET.x
        targetY = CameraObscuraScene.BOX_TARGET.y
      }

      const dist = Phaser.Math.Distance.Between(sprite.x, sprite.y, targetX, targetY)
      if (dist < 50) {
        sprite.x = targetX
        sprite.y = targetY
        obj.placed = true
        sprite.disableInteractive()
        this.tweens.add({ targets: sprite, alpha: 0, scale: baseScale * 0.9, duration: 500 })

        if (obj.threeObj) {
          this.threeWorld.removeObject(obj.threeObj)
        }
        obj.threeObj = isCandle
          ? this.threeWorld.createCandle(targetX, targetY)
          : this.threeWorld.create3DBox(targetX, targetY)
        this.threeWorld.addObject(obj.threeObj)

        if (isCandle) {
          this.threeFlame = obj.threeObj
        }

        const successG = this.add.graphics().setDepth(25)
        successG.fillStyle(0x44ff44, 0.12).fillCircle(targetX, targetY, 30)
        this.tweens.add({ targets: successG, alpha: 0, scale: 2, duration: 600, onComplete: () => successG.destroy() })
      } else {
        this.tweens.add({ targets: sprite, x: obj.initialX, y: obj.initialY, duration: 300, ease: 'Back.easeOut' })
      }

      this.checkExperimentComplete()
    })

    return obj
  }

  private checkExperimentComplete(): void {
    if (this.setupComplete) return
    if (!this.candle.placed || !this.box.placed) return

    this.setupComplete = true
    this.updateStepIndicator(1)

    this.time.delayedCall(600, () => {
      this.showExperimentSuccess()
    })
  }

  private showExperimentSuccess(): void {
    if (this.transitionLock) return
    this.instructionText.setText('✓ Experiment complete! Watch the light rays...')
    this.updateStepIndicator(2)

    this.apertureGraphic.setAlpha(1)
    this.apertureGraphic.clear()
    this.apertureGraphic.fillStyle(0x2a2018, 0.9)
    this.apertureGraphic.fillRect(CameraObscuraScene.APERTURE_X - 25, CameraObscuraScene.APERTURE_Y - 55, 50, 110)
    this.apertureGraphic.fillStyle(0x111108, 1)
    this.apertureGraphic.fillRect(CameraObscuraScene.APERTURE_X - 2, CameraObscuraScene.APERTURE_Y - 50, 4, 100)
    this.apertureGraphic.fillStyle(0xffff44, 0.2)
    this.apertureGraphic.fillCircle(CameraObscuraScene.APERTURE_X, CameraObscuraScene.APERTURE_Y, 4)

    this.wallGraphic.setAlpha(1)
    this.wallGraphic.clear()
    this.wallGraphic.fillStyle(0x3a3020, 0.6)
    this.wallGraphic.fillRect(CameraObscuraScene.WALL_X - 4, 80, 8, 400)
    this.wallGraphic.lineStyle(1, 0x5a4a30, 0.5)
    this.wallGraphic.beginPath()
    this.wallGraphic.moveTo(CameraObscuraScene.WALL_X, 80)
    this.wallGraphic.lineTo(CameraObscuraScene.WALL_X, 480)
    this.wallGraphic.strokePath()

    this.animateInversionRays()
    this.spawnFlareParticles(CameraObscuraScene.CANDLE_TARGET.x, CameraObscuraScene.CANDLE_TARGET.y, 0xffff44)

    this.createInvertedProjection()

    this.time.delayedCall(4000, () => {
      this.startSuccessDialogue()
    })
  }

  private animateInversionRays(): void {
    const cx = CameraObscuraScene.CANDLE_TARGET.x
    const cy = CameraObscuraScene.CANDLE_TARGET.y
    const ax = CameraObscuraScene.APERTURE_X
    const ay = CameraObscuraScene.APERTURE_Y
    const wx = CameraObscuraScene.WALL_X
    const wy = CameraObscuraScene.WALL_Y

    const flameTop = { x: cx, y: cy - 25 }
    const flameBottom = { x: cx, y: cy + 20 }
    const imageTop = { x: wx, y: wy - 35 }
    const imageBottom = { x: wx, y: wy + 35 }

    this.animateRayWithParticles(
      flameTop.x, flameTop.y,
      ax, ay,
      imageBottom.x, imageBottom.y,
      0xffdd44, 'Top ray -> crosses DOWN to bottom',
    )
    this.animateRayWithParticles(
      flameBottom.x, flameBottom.y,
      ax, ay,
      imageTop.x, imageTop.y,
      0xffaa22, 'Bottom ray -> crosses UP to top',
    )
  }

  private animateRayWithParticles(
    startX: number, startY: number,
    midX: number, midY: number,
    endX: number, endY: number,
    color: number,
    label: string,
  ): void {
    const rayG = this.add.graphics()
    rayG.setDepth(25)
    const glowG = this.add.graphics()
    glowG.setDepth(24)

    const totalSteps = 80
    let step = 0

    const rayParticles = this.add.particles(startX, startY, 'particle', {
      speed: { min: 2, max: 8 },
      scale: { start: 0.4, end: 0 },
      alpha: { start: 0.6, end: 0 },
      lifespan: 1200,
      frequency: 80,
      quantity: 1,
      tint: color,
    })
    rayParticles.setDepth(26)

    const labelText = this.add.text((startX + endX) / 2, Math.min(startY, endY) - 30, label, {
      fontSize: '9px',
      color: '#ffff44',
      fontFamily: 'Georgia, serif',
      fontStyle: 'italic',
    })
    labelText.setOrigin(0.5)
    labelText.setDepth(30)
    labelText.setAlpha(0)

    this.time.addEvent({
      delay: 30,
      repeat: totalSteps,
      callback: () => {
        step++
        rayG.clear()
        glowG.clear()

        const t1 = Math.min(step / 25, 1)
        const t2 = step > 25 ? Math.min((step - 25) / 30, 1) : 0

        const midProgressX = Phaser.Math.Linear(startX, midX, t1)
        const midProgressY = Phaser.Math.Linear(startY, midY, t1)
        const endProgressX = Phaser.Math.Linear(midX, endX, t2)
        const endProgressY = Phaser.Math.Linear(midY, endY, t2)

        const alpha = 0.5 + 0.3 * Math.sin(step * 0.3)

        if (t1 < 1) {
          this.drawGlowRay(rayG, glowG, startX, startY, midProgressX, midProgressY, color, alpha, 2.5)
        } else {
          this.drawGlowRay(rayG, glowG, startX, startY, midX, midY, color, alpha, 2.5)
          const p = (step - 25) / 30
          const glowR = 4 + 6 * (1 - Math.abs(p - 0.5) * 2)
          glowG.fillStyle(0xffffff, 0.15)
          glowG.fillCircle(midX, midY, glowR)
          glowG.fillStyle(color, 0.1 + 0.1 * Math.sin(step * 0.5))
          glowG.fillCircle(midX, midY, glowR + 8)

          this.drawGlowRay(rayG, glowG, midX, midY, endProgressX, endProgressY, color, alpha, 2)
        }

        if (step > 30 && !labelText.alpha) {
          this.tweens.add({ targets: labelText, alpha: 1, duration: 400 })
        }

        if (step >= totalSteps) {
          rayParticles.stop()
          this.tweens.add({
            targets: [rayParticles],
            alpha: 0,
            duration: 800,
            delay: 2000,
          })
        }
      },
    })
  }

  private drawGlowRay(
    rayG: Phaser.GameObjects.Graphics,
    glowG: Phaser.GameObjects.Graphics,
    x1: number, y1: number,
    x2: number, y2: number,
    color: number,
    alpha: number,
    width: number,
  ): void {
    rayG.lineStyle(width, color, alpha)
    rayG.beginPath()
    rayG.moveTo(x1, y1)
    rayG.lineTo(x2, y2)
    rayG.strokePath()

    glowG.lineStyle(width + 4, color, alpha * 0.15)
    glowG.beginPath()
    glowG.moveTo(x1, y1)
    glowG.lineTo(x2, y2)
    glowG.strokePath()

    rayG.fillStyle(0xffffff, alpha * 0.3)
    rayG.fillCircle(x1, y1, width * 0.8)
    rayG.fillCircle(x2, y2, width * 0.8)
  }

  private spawnFlareParticles(x: number, y: number, color: number): void {
    const flare = this.add.particles(x, y - 20, 'particle', {
      speed: { min: 5, max: 25 },
      angle: { min: 260, max: 280 },
      scale: { start: 0.3, end: 0 },
      alpha: { start: 0.6, end: 0 },
      frequency: 150,
      lifespan: 800,
      quantity: 1,
      tint: color,
    })
    flare.setDepth(15)
  }

  private createInvertedProjection(): void {
    const wx = CameraObscuraScene.WALL_X
    const wy = CameraObscuraScene.WALL_Y

    if (this.projectionImage) {
      this.projectionImage.destroy()
    }

    const projectionGlow = this.add.image(wx, wy - 4, 'candle')
    projectionGlow.setDepth(6)
    projectionGlow.setScale(1.35)
    projectionGlow.setRotation(Math.PI)
    projectionGlow.setTint(0xffe7a1)
    projectionGlow.setAlpha(0)
    projectionGlow.setBlendMode(Phaser.BlendModes.ADD)

    const projection = this.add.image(wx, wy - 4, 'candle')
    projection.setDepth(7)
    projection.setScale(1.18)
    projection.setRotation(Math.PI)
    projection.setAlpha(0)
    this.projectionImage = projection

    this.tweens.add({
      targets: [projectionGlow, projection],
      alpha: { from: 0, to: 1 },
      duration: 1200,
      ease: 'Power2',
    })

    const arrowG = this.add.graphics()
    arrowG.setDepth(8)
    arrowG.setAlpha(0)
    arrowG.lineStyle(1.5, 0xffff44, 0.6)
    arrowG.beginPath()
    arrowG.moveTo(CameraObscuraScene.CANDLE_TARGET.x + 30, CameraObscuraScene.CANDLE_TARGET.y - 30)
    arrowG.lineTo(wx - 20, wy + 20)
    arrowG.strokePath()
    arrowG.beginPath()
    arrowG.moveTo(CameraObscuraScene.CANDLE_TARGET.x + 30, CameraObscuraScene.CANDLE_TARGET.y + 30)
    arrowG.lineTo(wx - 20, wy - 20)
    arrowG.strokePath()

    this.tweens.add({ targets: arrowG, alpha: 1, duration: 800, delay: 1500 })

    const invertLabel = this.add.text(wx, wy + 72, 'INVERTED IMAGE', {
      fontSize: '10px',
      color: '#ffff44',
      fontFamily: 'Georgia, serif',
    })
    invertLabel.setOrigin(0.5)
    invertLabel.setDepth(10)
    invertLabel.setAlpha(0)
    this.tweens.add({ targets: invertLabel, alpha: 1, duration: 600, delay: 2000 })

    const crossMark = this.add.text(wx - 34, CameraObscuraScene.APERTURE_Y - 18, 'x', {
      fontSize: '18px',
      color: '#ffff44',
      fontFamily: 'Georgia, serif',
    })
    crossMark.setOrigin(0.5)
    crossMark.setDepth(10)
    crossMark.setAlpha(0)
    this.tweens.add({ targets: crossMark, alpha: 0.6, duration: 500, delay: 500 })
  }

  private createInvertedCandle(): void {
    const wx = CameraObscuraScene.WALL_X
    const wy = CameraObscuraScene.WALL_Y

    const invBody = this.add.graphics()
    invBody.setDepth(7)
    invBody.fillStyle(0x222222, 0.5)
    invBody.fillRect(wx - 6, wy - 5, 12, 40)
    invBody.fillStyle(0x333333, 0.3)
    invBody.fillRect(wx - 5, wy - 3, 10, 36)

    const invFlame = this.add.graphics()
    invFlame.setDepth(7)
    invFlame.fillStyle(0xff6600, 0.4)
    invFlame.fillTriangle(wx, wy - 12, wx - 4, wy - 5, wx + 4, wy - 5)
    invFlame.fillStyle(0xffaa00, 0.2)
    invFlame.fillCircle(wx, wy - 12, 3)

    invBody.setAlpha(0)
    invFlame.setAlpha(0)
    this.tweens.add({ targets: [invBody, invFlame], alpha: 1, duration: 1200, ease: 'Power2' })

    const arrowG = this.add.graphics()
    arrowG.setDepth(8)
    arrowG.setAlpha(0)

    arrowG.lineStyle(1.5, 0xffff44, 0.6)
    arrowG.beginPath()
    arrowG.moveTo(CameraObscuraScene.CANDLE_TARGET.x + 30, CameraObscuraScene.CANDLE_TARGET.y - 30)
    arrowG.lineTo(wx - 20, wy + 20)
    arrowG.strokePath()
    arrowG.beginPath()
    arrowG.moveTo(CameraObscuraScene.CANDLE_TARGET.x + 30, CameraObscuraScene.CANDLE_TARGET.y + 30)
    arrowG.lineTo(wx - 20, wy - 20)
    arrowG.strokePath()

    this.tweens.add({ targets: arrowG, alpha: 1, duration: 800, delay: 1500 })

    const invertLabel = this.add.text(wx, wy + 70, '⬇ INVERTED ⬇', {
      fontSize: '10px',
      color: '#ffff44',
      fontFamily: 'Georgia, serif',
    })
    invertLabel.setOrigin(0.5)
    invertLabel.setDepth(10)
    invertLabel.setAlpha(0)
    this.tweens.add({ targets: invertLabel, alpha: 1, duration: 600, delay: 2000 })

    const crossMark = this.add.text(wx - 30, CameraObscuraScene.APERTURE_Y - 15, '✕', {
      fontSize: '18px',
      color: '#ffff44',
      fontFamily: 'Georgia, serif',
    })
    crossMark.setOrigin(0.5)
    crossMark.setDepth(10)
    crossMark.setAlpha(0)
    this.tweens.add({ targets: crossMark, alpha: 0.6, duration: 500, delay: 500 })
  }

  private skipToNextScene(): void {
    if (this.transitionLock) return
    this.transitionLock = true
    this.continueButton?.destroy()
    this.threeWorld.destroy()
    this.cameras.main.fadeOut(500, 0, 0, 0)
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('ObservationScene')
    })
  }

  private async startSuccessDialogue(): Promise<void> {
    if (this.transitionLock) return
    this.transitionLock = true
    this.dialogueSystem = new DialogueSystem(this)
    const dialogue = DIALOGUES.camera_obscura_success
    await this.dialogueSystem.playSequence(dialogue.lines)

    this.threeWorld.destroy()
    this.cameras.main.fadeOut(800, 0, 0, 0)
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.dialogueSystem.destroy()
      this.scene.start('ObservationScene')
    })
  }

  update(_time: number, _delta: number): void {
    if (!this.transitionLock) {
      this.threeWorld.render(_delta)
    }
  }
}
