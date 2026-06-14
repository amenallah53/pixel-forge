import Phaser from 'phaser'
import { DialogueBox } from '../ui/DialogueBox.ts'
import type { DialogueLine } from '../data/types.ts'
import { t } from '../i18n/index.ts'

export class DialogueSystem {
  private dialogueBox: DialogueBox
  private currentLines: DialogueLine[] = []
  private lineIndex = 0
  private active = false
  private resolvePromise: ((value: string) => void) | null = null

  constructor(scene: Phaser.Scene) {
    this.dialogueBox = new DialogueBox(
      scene,
      scene.scale.width / 2,
      scene.scale.height - 160,
      640,
      140,
    )
    this.dialogueBox.setDepth(100)
  }

  async playSequence(lines: DialogueLine[]): Promise<string> {
    this.currentLines = lines
    this.lineIndex = 0
    this.active = true

    return new Promise((resolve) => {
      this.resolvePromise = resolve
      this.showNextLine()
    })
  }

  private async showNextLine(): Promise<void> {
    if (this.lineIndex >= this.currentLines.length) {
      this.active = false
      if (this.resolvePromise) {
        this.resolvePromise('complete')
        this.resolvePromise = null
      }
      return
    }

    const line = this.currentLines[this.lineIndex]
    this.lineIndex++

    await this.dialogueBox.show(t(line.speaker), t(line.text), line.portrait)
    this.showNextLine()
  }

  skip(): void {
    if (this.active) {
      this.lineIndex = this.currentLines.length
      this.dialogueBox.hide()
      this.active = false
      if (this.resolvePromise) {
        this.resolvePromise('skipped')
        this.resolvePromise = null
      }
    }
  }

  isActive(): boolean {
    return this.active
  }

  destroy(): void {
    this.dialogueBox.destroy()
  }
}
