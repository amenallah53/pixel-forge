import Phaser from 'phaser'

export class UIButton extends Phaser.GameObjects.Container {
  private bg: Phaser.GameObjects.Rectangle
  private labelText: Phaser.GameObjects.Text
  private _enabled = true

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    width: number,
    height: number,
    text: string,
    color: number = 0x4a3728,
    hoverColor: number = 0x6b4423,
    callback: () => void,
  ) {
    super(scene, x, y)

    this.bg = new Phaser.GameObjects.Rectangle(scene, 0, 0, width, height, color)
    this.bg.setStrokeStyle(1, 0xffd700)
    this.add(this.bg)

    this.labelText = new Phaser.GameObjects.Text(scene, 0, 0, text, {
      fontSize: '14px',
      color: '#ffd700',
      fontFamily: 'Georgia, serif',
    })
    this.labelText.setOrigin(0.5)
    this.add(this.labelText)

    this.setSize(width, height)
    this.setInteractive({ useHandCursor: true })

    this.on('pointerover', () => {
      if (this._enabled) {
        this.bg.setFillStyle(hoverColor)
      }
    })

    this.on('pointerout', () => {
      if (this._enabled) {
        this.bg.setFillStyle(color)
      }
    })

    this.on('pointerdown', () => {
      if (this._enabled) {
        callback()
      }
    })

    scene.add.existing(this)
  }

  set enabled(val: boolean) {
    this._enabled = val
    this.bg.setAlpha(val ? 1 : 0.5)
  }

  get enabled(): boolean {
    return this._enabled
  }
}
