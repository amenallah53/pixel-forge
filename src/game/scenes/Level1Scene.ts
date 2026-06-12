import Phaser from 'phaser'

export class Level1Scene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  private currentAnim: string | null = null

  constructor() {
    super({ key: 'Level1Scene' })
  }

  create(): void {
    const worldW = 3200
    const worldH = 600

    this.physics.world.setBounds(0, 0, worldW, worldH)
    this.cameras.main.setBounds(0, 0, worldW, worldH)

    const ground = this.add.rectangle(worldW / 2, worldH - 8, worldW, 16, 0x4a3728)
    this.physics.add.existing(ground, true)

    const groundTop = this.add.rectangle(worldW / 2, worldH - 8, worldW, 4, 0x6b4423)
    groundTop.setDepth(1)

    this.player = this.physics.add.sprite(100, 400, 'idle_1')
    this.player.setScale(0.075)
    this.player.setCollideWorldBounds(true)
    this.player.setBounce(0)

    const body = this.player.body as Phaser.Physics.Arcade.Body
    body.setMaxVelocityX(300)
    body.setMaxVelocityY(700)
    body.setDragX(700)

    this.physics.add.collider(this.player, ground)

    this.cameras.main.startFollow(this.player, true, 0.07, 0.07)
    this.cameras.main.setBackgroundColor('#1a1a2e')

    this.cursors = this.input.keyboard.createCursorKeys()
  }

  update(): void {
    const body = this.player.body as Phaser.Physics.Arcade.Body
    const onGround = body.blocked.down
    const { left, right, space, up } = this.cursors
    const accel = 1000
    const jumpVel = -520

    if ((space.isDown || up.isDown) && onGround) {
      this.player.setVelocityY(jumpVel)
    }

    if (left.isDown) {
      this.player.setAccelerationX(-accel)
      this.player.setFlipX(true)
    } else if (right.isDown) {
      this.player.setAccelerationX(accel)
      this.player.setFlipX(false)
    } else {
      this.player.setAccelerationX(0)
    }

    let target: string
    if (!onGround) {
      target = 'jump'
    } else if (left.isDown || right.isDown) {
      target = 'walk'
    } else {
      target = 'idle'
    }

    if (this.currentAnim !== target) {
      this.currentAnim = target
      this.player.play(target, true)
    }
  }
}
