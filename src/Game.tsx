import { useEffect, useRef } from 'react'
import Phaser from 'phaser'
import { ScientiaBootScene } from './scenes/BootScene.ts'
import { ScientiaMenuScene } from './scenes/MenuScene.ts'
import { Level1IntroScene } from './levels/level1/Level1IntroScene.ts'
import { CameraObscuraScene } from './levels/level1/CameraObscuraScene.ts'
import { ObservationScene } from './levels/level1/ObservationScene.ts'
import { MirrorLabyrinthScene } from './levels/level1/MirrorLabyrinthScene.ts'
import { QuizScene } from './levels/level1/QuizScene.ts'
import { LevelCompleteScene } from './levels/level1/LevelCompleteScene.ts'

const SCENES = [
  ScientiaBootScene,
  ScientiaMenuScene,
  Level1IntroScene,
  CameraObscuraScene,
  ObservationScene,
  MirrorLabyrinthScene,
  QuizScene,
  LevelCompleteScene,
]

export function Game() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      parent: containerRef.current,
      backgroundColor: '#0a0a1a',
      scene: SCENES,
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
