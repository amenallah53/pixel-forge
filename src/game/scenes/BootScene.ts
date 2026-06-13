import Phaser from 'phaser'

const walkFiles = import.meta.glob('../../assets/characters/Walk/*.png', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>

const idleFiles = import.meta.glob('../../assets/characters/Idle/*.png', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>

const jumpFiles = import.meta.glob('../../assets/characters/Jump/*.png', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>

function sortedEntries(
  mod: Record<string, string>,
): { key: string; url: string }[] {
  return Object.entries(mod)
    .sort(([a], [b]) => {
      const na = parseInt(a.match(/(\d+)\.png$/)?.[1] ?? '0', 10)
      const nb = parseInt(b.match(/(\d+)\.png$/)?.[1] ?? '0', 10)
      return na - nb
    })
    .map(([path, url]) => ({
      key: `${path.match(/([A-Z][a-z]+)\/(\d+)/)?.[1]?.toLowerCase() ?? 'f'}_${path.match(/(\d+)\.png$/)?.[1] ?? '0'}`,
      url,
    }))
}

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' })
  }

  preload(): void {
    const w = sortedEntries(walkFiles)
    const i = sortedEntries(idleFiles)
    const j = sortedEntries(jumpFiles)

    for (const { key, url } of w) this.load.image(key, url)
    for (const { key, url } of i) this.load.image(key, url)
    for (const { key, url } of j) this.load.image(key, url)
    this.load.image('candle', '/assets/candle.png')
    this.load.image('mirror', '/assets/mirror.png')
    this.load.image('wooden_box', '/assets/wooden_box.png')

    this.add.text(400, 300, 'Loading...', {
      fontSize: '24px',
      color: '#ffffff',
    }).setOrigin(0.5)
  }

  create(): void {
    this.anims.create({
      key: 'walk',
      frames: [
        { key: 'walk_1' },
        { key: 'walk_2' },
        { key: 'walk_3' },
        { key: 'walk_4' },
        { key: 'walk_5' },
        { key: 'walk_6' },
      ],
      frameRate: 12,
      repeat: -1,
    })

    this.anims.create({
      key: 'idle',
      frames: [
        { key: 'idle_1' },
        { key: 'idle_2' },
        { key: 'idle_3' },
        { key: 'idle_4' },
      ],
      frameRate: 8,
      repeat: -1,
    })

    this.anims.create({
      key: 'jump',
      frames: [
        { key: 'jump_1' },
        { key: 'jump_2' },
        { key: 'jump_3' },
        { key: 'jump_4' },
        { key: 'jump_5' },
        { key: 'jump_6' },
      ],
      frameRate: 10,
      repeat: -1,
    })

    this.scene.start('Level1Scene')
  }
}
