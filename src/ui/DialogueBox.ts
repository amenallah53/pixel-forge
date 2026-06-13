import Phaser from 'phaser'

export class DialogueBox extends Phaser.GameObjects.Container {
  private bg: Phaser.GameObjects.Rectangle
  private speakerText: Phaser.GameObjects.Text
  private textContent: Phaser.GameObjects.Text
  private skipHint: Phaser.GameObjects.Text
  private portraitSprite: Phaser.GameObjects.Image | null = null
  private portraitBorder: Phaser.GameObjects.Graphics | null = null
  private portraitPanel: Phaser.GameObjects.Rectangle | null = null
  private fullText = ''
  private displayedText = ''
  private charIndex = 0
  private typingTimer: Phaser.Time.TimerEvent | null = null
  private onComplete: (() => void) | null = null
  private isComplete = false
  private accentLine: Phaser.GameObjects.Rectangle

  constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number) {
    super(scene, x, y)

    this.bg = new Phaser.GameObjects.Rectangle(scene, 0, 0, width, height, 0x0d0d1a, 0.95)
    this.bg.setStrokeStyle(1, 0x4a3728, 0.6)
    this.add(this.bg)

    this.accentLine = new Phaser.GameObjects.Rectangle(scene, -width / 2, -height / 2, 4, height, 0xffd700, 0.6)
    this.accentLine.setOrigin(0, 0)
    this.add(this.accentLine)

    this.speakerText = new Phaser.GameObjects.Text(scene, -width / 2 + 100, -height / 2 + 14, '', {
      fontSize: '13px',
      color: '#ffd700',
      fontFamily: 'Georgia, serif',
      fontStyle: 'italic',
    })
    this.add(this.speakerText)

    this.textContent = new Phaser.GameObjects.Text(scene, -width / 2 + 100, -height / 2 + 38, '', {
      fontSize: '13px',
      color: '#d4c8b0',
      wordWrap: { width: width - 120 },
      lineSpacing: 5,
      fontFamily: 'Georgia, serif',
    })
    this.add(this.textContent)

    this.skipHint = new Phaser.GameObjects.Text(scene, width / 2 - 20, height / 2 - 22, '▼', {
      fontSize: '14px',
      color: '#8a7f6e',
      fontFamily: 'Georgia, serif',
    })
    this.skipHint.setOrigin(1, 1)
    this.add(this.skipHint)

    this.setSize(width, height)
    this.setInteractive()
    this.on('pointerdown', this.handleClick, this)

    this.setVisible(false)
    scene.add.existing(this)
  }

  show(speaker: string, text: string, portraitKey?: string): Promise<void> {
    return new Promise((resolve) => {
      this.fullText = text
      this.displayedText = ''
      this.charIndex = 0
      this.isComplete = false
      this.setVisible(true)
      this.speakerText.setText(speaker)

      if (portraitKey) {
        if (!this.portraitSprite) {
          this.portraitPanel = new Phaser.GameObjects.Rectangle(
            this.scene, -this.bg.width / 2 + 40, 0, 72, 100, 0x000000, 0.3,
          )
          this.portraitPanel.setStrokeStyle(1, 0xffd700, 0.4)
          this.add(this.portraitPanel)

          this.portraitSprite = this.scene.add.image(-this.bg.width / 2 + 40, -2, portraitKey)
          this.portraitSprite.setScale(1.4)
          this.add(this.portraitSprite)
          this.portraitSprite.setDepth(1)

          this.portraitBorder = new Phaser.GameObjects.Graphics(this.scene)
          this.portraitBorder.lineStyle(1, 0xffd700, 0.3)
          const px = -this.bg.width / 2 + 4
          this.portraitBorder.strokeRoundedRect(px, -54, 72, 100, 4)
          this.add(this.portraitBorder)
          this.portraitBorder.setDepth(2)
        } else {
          this.portraitSprite.setTexture(portraitKey)
          this.portraitSprite.setVisible(true)
          this.portraitPanel!.setVisible(true)
          this.portraitBorder!.setVisible(true)
        }
      } else if (this.portraitSprite) {
        this.portraitSprite.setVisible(false)
        this.portraitPanel!.setVisible(false)
        this.portraitBorder!.setVisible(false)
      }

      this.skipHint.setVisible(false)

      if (this.typingTimer) {
        this.typingTimer.destroy()
      }

      this.typingTimer = this.scene.time.addEvent({
        delay: 28,
        callback: this.typeChar,
        callbackScope: this,
        repeat: text.length - 1,
      })

      this.onComplete = () => resolve()
    })
  }

  private typeChar(): void {
    if (this.charIndex < this.fullText.length) {
      this.displayedText += this.fullText[this.charIndex]
      this.textContent.setText(this.displayedText)
      this.charIndex++
    } else {
      this.finishTyping()
    }
  }

  private finishTyping(): void {
    this.isComplete = true
    this.skipHint.setVisible(true)
    if (this.typingTimer) {
      this.typingTimer.destroy()
      this.typingTimer = null
    }
  }

  private handleClick(): void {
    if (!this.isComplete) {
      this.charIndex = this.fullText.length
      this.displayedText = this.fullText
      this.textContent.setText(this.displayedText)
      this.finishTyping()
    } else {
      this.setVisible(false)
      if (this.onComplete) {
        this.onComplete()
      }
    }
  }

  hide(): void {
    this.setVisible(false)
    if (this.typingTimer) {
      this.typingTimer.destroy()
      this.typingTimer = null
    }
  }

  destroy(): void {
    if (this.typingTimer) {
      this.typingTimer.destroy()
    }
    super.destroy()
  }
}
