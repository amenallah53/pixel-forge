import { useEffect, useRef } from 'react'
import Phaser from 'phaser'
import { BootScene } from './game/scenes/BootScene'
import { Level1Scene } from './game/scenes/Level1Scene'

export function Game() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      parent: containerRef.current,
      pixelArt: true,
      backgroundColor: '#1a1a2e',
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 800 },
          debug: false,
        },
      },
      scene: [BootScene, Level1Scene],
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
    }

    const game = new Phaser.Game(config)

    return () => {
      game.destroy(true)
    }
  }, [])

  return <div ref={containerRef} />
}
