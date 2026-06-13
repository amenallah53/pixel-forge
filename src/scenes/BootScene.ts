import Phaser from 'phaser'

export class ScientiaBootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ScientiaBootScene' })
  }

  preload(): void {
    const assets: [string, string][] = [
      ['ibn_haytham_portrait', '/assets/ibn_haytham_portrait.png'],
      ['ibn_haytham', '/assets/ibn_haytham_south.png'],
      ['background', '/assets/background.png'],
      ['candle', '/assets/candle.png'],
      ['mirror', '/assets/mirror.png'],
      ['wooden_box', '/assets/wooden_box.png'],
    ]

    for (const [key, url] of assets) {
      this.load.image(key, url)
    }

    const bg = this.add.text(this.scale.width / 2, this.scale.height / 2, 'Loading...', {
      fontSize: '20px',
      color: '#ffd700',
      fontFamily: 'Georgia, serif',
    })
    bg.setOrigin(0.5)
  }

  create(): void {
    this.generateParticleTexture()
    this.generateCrystalTexture()

    this.scene.start('ScientiaMenuScene')
  }

  private generateParticleTexture(): void {
    const g = this.make.graphics({ x: 0, y: 0 }, false)
    g.fillStyle(0xffffff, 1)
    g.fillCircle(4, 4, 4)
    g.generateTexture('particle', 8, 8)
    g.destroy()
  }

  private generateCrystalTexture(): void {
    const g = this.make.graphics({ x: 0, y: 0 }, false)
    const s = 40

    g.fillStyle(0x44aaff, 0.6)
    g.fillTriangle(s / 2, 0, 0, s, s, s)

    g.fillStyle(0x88ccff, 0.4)
    g.fillTriangle(s / 2, 5, 5, s - 5, s - 5, s - 5)

    g.lineStyle(1, 0xffffff, 0.5)
    g.strokeTriangle(s / 2, 0, 0, s, s, s)

    g.generateTexture('crystal', s, s)
    g.destroy()
  }
}
