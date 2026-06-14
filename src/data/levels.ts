import type { LevelConfig } from "./types.ts";
import { DISTILLATION_FRAGMENT } from "../levels/level3/types.ts";
import { FARADAY_FRAGMENT } from "../levels/level4/types.ts";

export const LEVELS: Record<string, LevelConfig> = {
  level1: {
    id: "level1",
    title: "Ibn al-Haytham – The Secret of Light",
    scientist: "Ibn al-Haytham",
    era: "11th Century Cairo",
    portraitKey: "ibn_haytham",
    fragment: {
      id: "optics",
      name: "OPTICS",
      description: "The science of light and vision",
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
    title: "Antoine Lavoisier - The Lost Perfume Formula",
    scientist: "Antoine Lavoisier",
    era: "1774 Paris",
    portraitKey: "lavoisier",
    fragment: DISTILLATION_FRAGMENT,
    scenes: [
      "Level3IntroScene",
      "DistillationScene",
    ],
  },
  level4: {
    id: "level4",
    title: "Michael Faraday - The Invisible Energy",
    scientist: "Michael Faraday",
    era: "1831 London",
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
