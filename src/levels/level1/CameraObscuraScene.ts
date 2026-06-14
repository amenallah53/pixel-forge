import Phaser from 'phaser'
import { DialogueSystem } from '../../systems/DialogueSystem.ts'
import { ProgressSystem } from '../../systems/ProgressSystem.ts'
import { ThreeDWorld, type ThreeDObject } from '../../systems/ThreeDWorld.ts'
import { DIALOGUES } from '../../data/dialogues.ts'
import { UIButton } from '../../ui/UIButton.ts'
import { t } from '../../i18n/index.ts'

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
  private apertureSize = 4
  private wallDistOffset = 0
  private apertureSizeText!: Phaser.GameObjects.Text
  private wallDistText!: Phaser.GameObjects.Text
  private opticsControlsG!: Phaser.GameObjects.Graphics

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
    this.apertureGraphic = this.add.graphics().setDepth(8)
    this.wallGraphic = this.add.graphics().setDepth(4)
    this.drawAperture()
    this.drawWall()
    this.createDropZones()
    this.createDraggableObjects()
    this.createLabels()
    this.createSceneControls(w, h)
    this.createApertureControls(w, h)

    this.instructionText = this.add.text(w / 2, 16, t('camObscura.instruction'), {
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
    const steps = [t('camObscura.step1'), t('camObscura.step2'), t('camObscura.step3')]
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
    const steps = [t('camObscura.step1'), t('camObscura.step2'), t('camObscura.step3')]
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

  private drawAperture(): void {
    this.apertureGraphic.clear()

    const ax = CameraObscuraScene.APERTURE_X
    const ay = CameraObscuraScene.APERTURE_Y
    const halfW = 20 + this.apertureSize
    const halfH = 50 + this.apertureSize
    const holeW = Math.max(2, this.apertureSize)

    this.apertureGraphic.fillStyle(0x2a2018, 0.9)
    this.apertureGraphic.fillRect(ax - halfW, ay - halfH, halfW * 2, halfH * 2)

    this.apertureGraphic.fillStyle(0x000000, 1)
    this.apertureGraphic.fillRect(ax - holeW, ay - halfH + 10, holeW * 2, halfH * 2 - 20)

    this.apertureGraphic.fillStyle(0x1a1410, 0.9)
    this.apertureGraphic.fillRect(ax - 1, ay - halfH + 10, 2, halfH * 2 - 20)

    this.apertureGraphic.fillStyle(0xffff44, 0.08 + this.apertureSize * 0.01)
    this.apertureGraphic.fillCircle(ax, ay, Math.max(2, holeW))

    this.apertureGraphic.setAlpha(Math.min(1, 0.4 + this.apertureSize * 0.03))
  }

  private drawWall(): void {
    this.wallGraphic.clear()

    const wx = CameraObscuraScene.WALL_X + this.wallDistOffset

    this.wallGraphic.fillStyle(0x1a1814, 0.5)
    this.wallGraphic.fillRect(wx - 4, 80, 8, 400)

    this.wallGraphic.lineStyle(1, 0x3a3020, 0.4)
    this.wallGraphic.beginPath()
    this.wallGraphic.moveTo(wx, 80)
    this.wallGraphic.lineTo(wx, 480)
    this.wallGraphic.strokePath()
  }

  private createLabels(): void {
    const candleLabel = this.add.text(CameraObscuraScene.CANDLE_TARGET.x, CameraObscuraScene.CANDLE_TARGET.y - 45, t('camObscura.dropCandle'), {
      fontSize: '9px',
      color: '#5a4a3a',
      fontFamily: 'Georgia, serif',
      fontStyle: 'italic',
    })
    candleLabel.setOrigin(0.5)
    candleLabel.setDepth(10)

    const boxLabel = this.add.text(CameraObscuraScene.BOX_TARGET.x, CameraObscuraScene.BOX_TARGET.y - 45, t('camObscura.dropBox'), {
      fontSize: '9px',
      color: '#5a4a3a',
      fontFamily: 'Georgia, serif',
      fontStyle: 'italic',
    })
    boxLabel.setOrigin(0.5)
    boxLabel.setDepth(10)

    this.add.text(CameraObscuraScene.APERTURE_X + 50, CameraObscuraScene.APERTURE_Y - 5, t('camObscura.labelAperture'), {
      fontSize: '9px',
      color: '#5a4a3a',
      fontFamily: 'Georgia, serif',
    }).setOrigin(0, 0.5).setDepth(10)

    this.add.text(CameraObscuraScene.WALL_X + 15, CameraObscuraScene.WALL_Y - 5, t('camObscura.labelWall'), {
      fontSize: '9px',
      color: '#5a4a3a',
      fontFamily: 'Georgia, serif',
    }).setOrigin(0, 0.5).setDepth(10)
  }

  private createSceneControls(w: number, _h: number): void {
    this.add.text(w - 18, 18, t('camObscura.shortcut'), {
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
       t('camObscura.skip'),
      0x2a1a0a,
      0x4a3728,
      () => this.skipToNextScene(),
    )
    this.continueButton.setDepth(45)
  }

  private createApertureControls(w: number, _h: number): void {
    this.opticsControlsG = this.add.graphics().setDepth(44)
    this.opticsControlsG.fillStyle(0x000000, 0.5)
    this.opticsControlsG.fillRoundedRect(w - 190, 82, 182, 56, 6)
    this.opticsControlsG.lineStyle(1, 0x5a4a3a, 0.4)
    this.opticsControlsG.strokeRoundedRect(w - 190, 82, 182, 56, 6)

    this.add.text(w - 184, 87, t('camObscura.holeSize'), {
      fontSize: '9px', color: '#b8a88a', fontFamily: 'Georgia, serif',
    }).setDepth(45)

    this.apertureSizeText = this.add.text(w - 130, 87, `${this.apertureSize}px`, {
      fontSize: '9px', color: '#ffd700', fontFamily: 'Georgia, serif',
    }).setDepth(45)

    const holeDec = this.add.text(w - 100, 86, '−', {
      fontSize: '14px', color: '#b8a88a', fontFamily: 'Georgia, serif',
    }).setInteractive({ useHandCursor: true }).setDepth(45)
    holeDec.on('pointerdown', () => { this.apertureSize = Math.max(2, this.apertureSize - 2); this.updateOptics() })
    const holeInc = this.add.text(w - 80, 86, '+', {
      fontSize: '14px', color: '#b8a88a', fontFamily: 'Georgia, serif',
    }).setInteractive({ useHandCursor: true }).setDepth(45)
    holeInc.on('pointerdown', () => { this.apertureSize = Math.min(20, this.apertureSize + 2); this.updateOptics() })

    this.add.text(w - 184, 107, t('camObscura.wallDist'), {
      fontSize: '9px', color: '#b8a88a', fontFamily: 'Georgia, serif',
    }).setDepth(45)

    this.wallDistText = this.add.text(w - 130, 107, `${CameraObscuraScene.WALL_X + this.wallDistOffset}`, {
      fontSize: '9px', color: '#ffd700', fontFamily: 'Georgia, serif',
    }).setDepth(45)

    const distDec = this.add.text(w - 100, 106, '−', {
      fontSize: '14px', color: '#b8a88a', fontFamily: 'Georgia, serif',
    }).setInteractive({ useHandCursor: true }).setDepth(45)
    distDec.on('pointerdown', () => { this.wallDistOffset = Math.max(-70, this.wallDistOffset - 20); this.updateOptics() })
    const distInc = this.add.text(w - 80, 106, '+', {
      fontSize: '14px', color: '#b8a88a', fontFamily: 'Georgia, serif',
    }).setInteractive({ useHandCursor: true }).setDepth(45)
    distInc.on('pointerdown', () => { this.wallDistOffset = Math.min(110, this.wallDistOffset + 20); this.updateOptics() })
  }

  private updateOptics(): void {
    this.apertureSizeText.setText(`${this.apertureSize}px`)
    this.wallDistText.setText(`${CameraObscuraScene.WALL_X + this.wallDistOffset}`)
    this.drawAperture()
    this.drawWall()
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

    const title = new Phaser.GameObjects.Text(this, -150, 12, t('camObscura.panelTitle'), {
      fontSize: '12px', color: '#ffd700', fontFamily: 'Georgia, serif', fontStyle: 'italic',
    })
    panel.add(title)

    const desc = new Phaser.GameObjects.Text(this, -150, 34, t('camObscura.panelDesc'), {
      fontSize: '10px', color: '#b8a8a0', fontFamily: 'Georgia, serif',
      wordWrap: { width: 340 }, lineSpacing: 3,
    })
    panel.add(desc)

    const closeBtn = new Phaser.GameObjects.Text(this, 185, 85, t('camObscura.ok'), {
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
    new ProgressSystem().addXP('level1', 50)
    this.instructionText.setText(t('camObscura.success'))
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

    const disappearText = this.add.text(this.scale.width / 2, 140, t('camObscura.disappear'), {
      fontSize: '10px',
      color: '#b8a88a',
      fontFamily: 'Georgia, serif',
      fontStyle: 'italic',
      align: 'center',
      wordWrap: { width: 400 },
    }).setOrigin(0.5).setDepth(30).setAlpha(0)
    this.tweens.add({ targets: disappearText, alpha: 1, duration: 600 })

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
    const wx = CameraObscuraScene.WALL_X + this.wallDistOffset
    const wy = CameraObscuraScene.WALL_Y

    const flameTop = { x: cx, y: cy - 25 }
    const flameBottom = { x: cx, y: cy + 20 }
    const imageTop = { x: wx, y: wy - 35 }
    const imageBottom = { x: wx, y: wy + 35 }

    this.drawRayPair(flameTop, flameBottom, ax, ay, imageBottom, imageTop)
  }

  private drawRayPair(
    topSrc: { x: number; y: number },
    bottomSrc: { x: number; y: number },
    ax: number, ay: number,
    topDst: { x: number; y: number },
    bottomDst: { x: number; y: number },
  ): void {
    const rayG = this.add.graphics().setDepth(25)
    const glowG = this.add.graphics().setDepth(24)

    const drawStaticRay = (x1: number, y1: number, x2: number, y2: number, color: number) => {
      glowG.lineStyle(8, color, 0.08)
      glowG.beginPath(); glowG.moveTo(x1, y1); glowG.lineTo(x2, y2); glowG.strokePath()
      glowG.lineStyle(4, color, 0.12)
      glowG.beginPath(); glowG.moveTo(x1, y1); glowG.lineTo(x2, y2); glowG.strokePath()
      rayG.lineStyle(2.5, color, 0.85)
      rayG.beginPath(); rayG.moveTo(x1, y1); rayG.lineTo(x2, y2); rayG.strokePath()
    }

    drawStaticRay(topSrc.x, topSrc.y, bottomDst.x, bottomDst.y, 0xffdd44)
    drawStaticRay(bottomSrc.x, bottomSrc.y, topDst.x, topDst.y, 0xffaa22)

    rayG.fillStyle(0xffffff, 0.3)
    rayG.fillCircle(ax, ay, 4)
    rayG.fillStyle(0xffff44, 0.25)
    rayG.fillCircle(ax, ay, 8)

    this.add.text(ax + 8, ay + 12, t('camObscura.crossHere'), {
      fontSize: '9px', color: '#ffff44', fontFamily: 'Georgia, serif', fontStyle: 'italic',
    }).setOrigin(0, 0.5).setDepth(30)

    this.add.text((topSrc.x + bottomDst.x) / 2 - 20, Math.min(topSrc.y, bottomDst.y) - 24, t('camObscura.topToBottom'), {
      fontSize: '9px', color: '#ffe066', fontFamily: 'Georgia, serif', fontStyle: 'italic',
    }).setOrigin(0.5).setDepth(30)

    this.add.text((bottomSrc.x + topDst.x) / 2 - 20, Math.min(bottomSrc.y, topDst.y) + 16, t('camObscura.bottomToTop'), {
      fontSize: '9px', color: '#ffbb44', fontFamily: 'Georgia, serif', fontStyle: 'italic',
    }).setOrigin(0.5).setDepth(30)

    const wx = CameraObscuraScene.WALL_X + this.wallDistOffset
    const wy = CameraObscuraScene.WALL_Y
    const arrowG = this.add.graphics().setDepth(8).setAlpha(0)
    arrowG.lineStyle(1.5, 0xffff44, 0.6)
    arrowG.beginPath()
    arrowG.moveTo(CameraObscuraScene.CANDLE_TARGET.x + 30, CameraObscuraScene.CANDLE_TARGET.y - 30)
    arrowG.lineTo(wx - 20, wy + 20)
    arrowG.strokePath()
    arrowG.beginPath()
    arrowG.moveTo(CameraObscuraScene.CANDLE_TARGET.x + 30, CameraObscuraScene.CANDLE_TARGET.y + 30)
    arrowG.lineTo(wx - 20, wy - 20)
    arrowG.strokePath()
    this.tweens.add({ targets: arrowG, alpha: 1, duration: 800, delay: 500 })
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

    const invertLabel = this.add.text(wx, wy + 72, t('camObscura.inverted'), {
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
