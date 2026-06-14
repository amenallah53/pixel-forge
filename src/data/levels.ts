import type { LevelConfig } from "./types.ts";
import { DISTILLATION_FRAGMENT } from "../levels/level3/types.ts";
import { FARADAY_FRAGMENT } from "../levels/level4/types.ts";

export const LEVELS: Record<string, LevelConfig> = {
  level1: {
    id: "level1",
    title: "level1.title",
    scientist: "level1.scientist",
    era: "level1.era",
    portraitKey: "ibn_haytham",
    fragment: {
      id: "optics",
      name: "fragment.optics",
      description: "fragment.optics",
      color: 0xffd700,
    },
    scenes: [
      "Level1IntroScene",
      "CameraObscuraScene",
      "ObservationScene",
      "MirrorLabyrinthScene",
      "QuizScene",
      "LevelCompleteScene",
    ],
  },
  level3: {
    id: "level3",
    title: "level3.title",
    scientist: "level3.scientist",
    era: "level3.era",
    portraitKey: "lavoisier",
    fragment: DISTILLATION_FRAGMENT,
    scenes: [
      "Level3IntroScene",
      "DistillationScene",
    ],
  },
  level4: {
    id: "level4",
    title: "level4.title",
    scientist: "level4.scientist",
    era: "level4.era",
    portraitKey: "faraday",
    fragment: FARADAY_FRAGMENT,
    scenes: [
      "Level4IntroScene",
      "FaradayExperimentScene",
      "Level4QuizScene",
      "Level4CompleteScene",
    ],
  },
};

export const LEVEL_ORDER = ["level1", "level3", "level4"];
