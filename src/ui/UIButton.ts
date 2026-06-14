import Phaser from 'phaser'

export class UIButton extends Phaser.GameObjects.Container {
  private bg: Phaser.GameObjects.Rectangle
  private labelText: Phaser.GameObjects.Text
  private readonly color: number
  private readonly hoverColor: number
  private readonly callback: () => void
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
    this.color = color
    this.hoverColor = hoverColor
    this.callback = callback

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
        this.bg.setFillStyle(this.hoverColor)
      }
    })

    this.on('pointerout', () => {
      if (this._enabled) {
        this.bg.setFillStyle(this.color)
      }
    })

    this.on('pointerdown', () => {
      if (this._enabled) {
        this.callback()
      }
    })

    scene.add.existing(this)
  }

  set enabled(val: boolean) {
    this._enabled = val
    this.bg.setFillStyle(val ? this.color : 0x2b2b2b)
    this.bg.setAlpha(val ? 1 : 0.55)
    this.labelText.setAlpha(val ? 1 : 0.7)
    this.labelText.setColor(val ? '#ffd700' : '#8e8268')
    if (val) {
      this.setInteractive({ useHandCursor: true })
    } else {
      this.disableInteractive()
    }
  }

  get enabled(): boolean {
    return this._enabled
  }
}
