import Phaser from 'phaser'

export class ProgressBar extends Phaser.GameObjects.Container {
  private bg: Phaser.GameObjects.Rectangle
  private fill: Phaser.GameObjects.Rectangle
  private labelText!: Phaser.GameObjects.Text
  private _progress = 0

  constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, label?: string) {
    super(scene, x, y)

    this.bg = new Phaser.GameObjects.Rectangle(scene, 0, 0, width, height, 0x2a1a0a)
    this.bg.setStrokeStyle(1, 0x4a3728)
    this.add(this.bg)

    this.fill = new Phaser.GameObjects.Rectangle(scene, -width / 2 + 2, 0, 0, height - 4, 0xffd700)
    this.fill.setOrigin(0, 0.5)
    this.add(this.fill)

    if (label) {
      this.labelText = new Phaser.GameObjects.Text(scene, width / 2 + 8, 0, label, {
        fontSize: '11px',
        color: '#8a7f6e',
        fontFamily: 'Georgia, serif',
      })
      this.labelText.setOrigin(0, 0.5)
      this.add(this.labelText)
    }

    scene.add.existing(this)
  }

  set progress(val: number) {
    this._progress = Phaser.Math.Clamp(val, 0, 1)
    this.fill.width = (this.bg.width - 4) * this._progress
  }

  get progress(): number {
    return this._progress
  }
}
