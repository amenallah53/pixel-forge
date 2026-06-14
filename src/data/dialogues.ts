import type { DialogueSequence } from './types.ts'

export const DIALOGUES: Record<string, DialogueSequence> = {
  level1_intro: {
    id: 'level1_intro',
    lines: [
      { speaker: 'speaker.narrator', text: 'dialogue.level1_intro.0' },
      { speaker: 'speaker.narrator', text: 'dialogue.level1_intro.1' },
      { speaker: 'speaker.ibn', text: 'dialogue.level1_intro.2', portrait: 'ibn_haytham' },
      { speaker: 'speaker.ibn', text: 'dialogue.level1_intro.3', portrait: 'ibn_haytham' },
    ],
    onComplete: 'CameraObscuraScene',
  },
  camera_obscura_success: {
    id: 'camera_obscura_success',
    lines: [
      { speaker: 'speaker.ibn', text: 'dialogue.camera_obscura_success.0', portrait: 'ibn_haytham' },
      { speaker: 'speaker.ibn', text: 'dialogue.camera_obscura_success.1', portrait: 'ibn_haytham' },
    ],
    onComplete: 'ObservationScene',
  },
  observation_explain: {
    id: 'observation_explain',
    lines: [
      { speaker: 'speaker.ibn', text: 'dialogue.observation_explain.0', portrait: 'ibn_haytham' },
      { speaker: 'speaker.ibn', text: 'dialogue.observation_explain.1', portrait: 'ibn_haytham' },
      { speaker: 'speaker.ibn', text: 'dialogue.observation_explain.2', portrait: 'ibn_haytham' },
    ],
    onComplete: 'MirrorLabyrinthScene',
  },
  mirror_intro: {
    id: 'mirror_intro',
    lines: [
      { speaker: 'speaker.ibn', text: 'dialogue.mirror_intro.0', portrait: 'ibn_haytham' },
      { speaker: 'speaker.ibn', text: 'dialogue.mirror_intro.1', portrait: 'ibn_haytham' },
    ],
    onComplete: '',
  },
  mirror_success: {
    id: 'mirror_success',
    lines: [
      { speaker: 'speaker.ibn', text: 'dialogue.mirror_success.0', portrait: 'ibn_haytham' },
      { speaker: 'speaker.ibn', text: 'dialogue.mirror_success.1', portrait: 'ibn_haytham' },
    ],
    onComplete: 'QuizScene',
  },
  level3_intro: {
    id: 'level3_intro',
    lines: [
      { speaker: 'speaker.narrator', text: 'dialogue.level3_intro.0' },
      { speaker: 'speaker.lavoisier', text: 'dialogue.level3_intro.1' },
      { speaker: 'speaker.lavoisier', text: 'dialogue.level3_intro.2' },
    ],
    onComplete: 'DistillationScene',
  },
  level4_intro: {
    id: 'level4_intro',
    lines: [
      { speaker: 'speaker.narrator', text: 'dialogue.level4_intro.0' },
      { speaker: 'speaker.narrator', text: 'dialogue.level4_intro.1' },
      { speaker: 'speaker.faraday', text: 'dialogue.level4_intro.2' },
      { speaker: 'speaker.faraday', text: 'dialogue.level4_intro.3' },
    ],
    onComplete: 'FaradayExperimentScene',
  },
}
