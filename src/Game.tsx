import { useEffect, useRef } from "react";
import Phaser from "phaser";
import { ScientiaBootScene } from "./scenes/BootScene.ts";
import { ScientiaMenuScene } from "./scenes/MenuScene.ts";
import { Level1IntroScene } from "./levels/level1/Level1IntroScene.ts";
import { CameraObscuraScene } from "./levels/level1/CameraObscuraScene.ts";
import { ObservationScene } from "./levels/level1/ObservationScene.ts";
import { MirrorLabyrinthScene } from "./levels/level1/MirrorLabyrinthScene.ts";
import { QuizScene } from "./levels/level1/QuizScene.ts";
import { LevelCompleteScene } from "./levels/level1/LevelCompleteScene.ts";
import { Level2IntroScene } from "./levels/level2/Level2IntroScene.ts";
import { DistillationScene } from "./levels/level2/DistillationScene.ts";
import { Level2QuizScene } from "./levels/level2/Level2QuizScene.ts";
import { Level2CompleteScene } from "./levels/level2/Level2CompleteScene.ts";
import { Level3IntroScene } from "./levels/level3/Level3IntroScene.ts";
import { FaradayExperimentScene } from "./levels/level3/FaradayExperimentScene.ts";
import { Level3QuizScene } from "./levels/level3/Level3QuizScene.ts";
import { Level3CompleteScene } from "./levels/level3/Level3CompleteScene.ts";

const SCENES = [
  ScientiaBootScene,
  ScientiaMenuScene,
  Level1IntroScene,
  CameraObscuraScene,
  ObservationScene,
  MirrorLabyrinthScene,
  QuizScene,
  LevelCompleteScene,
  Level2IntroScene,
  DistillationScene,
  Level2QuizScene,
  Level2CompleteScene,
  Level3IntroScene,
  FaradayExperimentScene,
  Level3QuizScene,
  Level3CompleteScene,
];

export function Game() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      parent: containerRef.current,
      backgroundColor: "#0a0a1a",
      scene: SCENES,
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      physics: {
        default: "matter",
        matter: {
          gravity: { x: 0, y: 0.2 },
          debug: false,
        },
      },
    };

    const game = new Phaser.Game(config);

    return () => {
      game.destroy(true);
    };
  }, []);

  return <div ref={containerRef} />;
}
