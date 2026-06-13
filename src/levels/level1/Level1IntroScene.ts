import Phaser from 'phaser'
import { DialogueSystem } from '../../systems/DialogueSystem.ts'
import { DIALOGUES } from '../../data/dialogues.ts'

export class Level1IntroScene extends Phaser.Scene {
  private dialogueSystem!: DialogueSystem
  private dustParticles!: Phaser.GameObjects.Particles.ParticleEmitter

  constructor() {
    super({ key: 'Level1IntroScene' })
  }

  create(): void {
    const w = this.scale.width
    const h = this.scale.height

    this.cameras.main.setBackgroundColor('#050508')
    this.cameras.main.fadeIn(1000, 0, 0, 0)

    const bgImage = this.add.image(w / 2, h / 2, 'background')
    bgImage.setDisplaySize(w, h)
    bgImage.setAlpha(0.15)
    bgImage.setDepth(0)

    this.createPrisonBackground(w, h)
    this.createParallaxElements(w, h)
    this.createTorchLighting(w, h)
    this.createMoonlight(w, h)
    this.createDustParticles(w)

    const portrait = this.add.image(w / 2, 200, 'ibn_haytham_portrait')
    portrait.setScale(2)
    portrait.setAlpha(0)

    this.tweens.add({
      targets: portrait,
      alpha: 1,
      y: portrait.y - 20,
      duration: 2000,
      ease: 'Power2',
    })

    const fadeBg = this.add.graphics()
    fadeBg.fillStyle(0x000000, 0.7)
    fadeBg.fillRect(0, h - 200, w, 200)

    this.time.delayedCall(2500, () => {
      this.startDialogue()
    })
  }

  private createPrisonBackground(w: number, h: number): void {
    const bg = this.add.graphics()
    bg.setDepth(0)

    bg.fillGradientStyle(0x0a0a0a, 0x0a0a0a, 0x1a1a0a, 0x1a1a0a, 1)
    bg.fillRect(0, 0, w, h)

    const stoneColor1 = 0x2a2a1a
    const stoneColor2 = 0x1a1a0a

    const rows = 12
    const cols = 10
    const stoneW = Math.ceil(w / cols)
    const stoneH = Math.ceil(h / rows)

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const offset = r % 2 === 0 ? 0 : stoneW / 2
        const color = (r + c) % 2 === 0 ? stoneColor1 : stoneColor2
        bg.fillStyle(color, 0.4)
        bg.fillRect(c * stoneW + offset, r * stoneH, stoneW - 2, stoneH - 2)

        bg.lineStyle(1, 0x000000, 0.3)
        bg.strokeRect(c * stoneW + offset, r * stoneH, stoneW - 2, stoneH - 2)
      }
    }
  }

  private createParallaxElements(w: number, h: number): void {
    const chains = this.add.graphics()
    chains.setDepth(2)
    chains.lineStyle(2, 0x444444, 0.5)
    for (let i = 0; i < 3; i++) {
      const cx = w * 0.2 + i * w * 0.3
      chains.beginPath()
      chains.moveTo(cx, 0)
      chains.lineTo(cx, h * 0.3)
      chains.strokePath()
    }
  }

  private createTorchLighting(w: number, h: number): void {
    const leftTorch = this.add.graphics()
    leftTorch.setDepth(3)
    const tx = 60
    const ty = h * 0.3
    leftTorch.fillStyle(0x8b4513, 0.8)
    leftTorch.fillRect(tx - 4, ty, 8, 40)
    leftTorch.fillStyle(0xff6600, 0.6)
    leftTorch.fillCircle(tx, ty, 12)
    leftTorch.fillStyle(0xffaa00, 0.4)
    leftTorch.fillCircle(tx, ty, 20)

    this.tweens.add({
      targets: leftTorch,
      alpha: { from: 0.8, to: 1 },
      duration: 400 + Math.random() * 200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    })

    const rightTorch = this.add.graphics()
    rightTorch.setDepth(3)
    const rx = w - 60
    rightTorch.fillStyle(0x8b4513, 0.8)
    rightTorch.fillRect(rx - 4, ty, 8, 40)
    rightTorch.fillStyle(0xff6600, 0.6)
    rightTorch.fillCircle(rx, ty, 12)
    rightTorch.fillStyle(0xffaa00, 0.4)
    rightTorch.fillCircle(rx, ty, 20)

    this.tweens.add({
      targets: rightTorch,
      alpha: { from: 0.7, to: 1 },
      duration: 500 + Math.random() * 150,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    })
  }

  private createMoonlight(w: number, h: number): void {
    const windowX = w * 0.75
    const windowY = h * 0.15
    const windowSize = 50

    const windowG = this.add.graphics()
    windowG.setDepth(1)
    windowG.fillStyle(0x1a1a2e, 0.9)
    windowG.fillRect(windowX - windowSize / 2, windowY - windowSize / 2, windowSize, windowSize)
    windowG.lineStyle(3, 0x444444, 0.8)
    windowG.strokeRect(windowX - windowSize / 2, windowY - windowSize / 2, windowSize, windowSize)
    windowG.lineStyle(1, 0x444444, 0.5)
    windowG.beginPath()
    windowG.moveTo(windowX, windowY - windowSize / 2)
    windowG.lineTo(windowX, windowY + windowSize / 2)
    windowG.strokePath()
    windowG.beginPath()
    windowG.moveTo(windowX - windowSize / 2, windowY)
    windowG.lineTo(windowX + windowSize / 2, windowY)
    windowG.strokePath()

    const moonBeam = this.add.graphics()
    moonBeam.setDepth(1)
    moonBeam.fillStyle(0x8888ff, 0.06)
    moonBeam.fillTriangle(
      windowX - 15, windowY + windowSize / 2,
      windowX + 15, windowY + windowSize / 2,
      windowX + 80, h,
    )
    moonBeam.fillTriangle(
      windowX - 15, windowY + windowSize / 2,
      windowX + 15, windowY + windowSize / 2,
      windowX - 80, h,
    )

    this.tweens.add({
      targets: moonBeam,
      alpha: { from: 0.6, to: 1 },
      duration: 3000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    })
  }

  private createDustParticles(w: number): void {
    this.dustParticles = this.add.particles(w / 2, 0, 'particle', {
      x: { min: 0, max: w },
      y: { min: 0, max: 400 },
      speed: { min: 2, max: 8 },
      angle: { min: 80, max: 100 },
      scale: { start: 0.3, end: 0 },
      alpha: { start: 0.2, end: 0 },
      frequency: 500,
      lifespan: 8000,
      quantity: 1,
      tint: 0xaaaaff,
    })
    this.dustParticles.setDepth(5)
  }

  private async startDialogue(): Promise<void> {
    this.dialogueSystem = new DialogueSystem(this)
    const dialogue = DIALOGUES.level1_intro
    await this.dialogueSystem.playSequence(dialogue.lines)

    this.cameras.main.fadeOut(800, 0, 0, 0)
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.dialogueSystem.destroy()
      this.dustParticles.destroy()
      this.scene.start('CameraObscuraScene')
    })
  }
}
