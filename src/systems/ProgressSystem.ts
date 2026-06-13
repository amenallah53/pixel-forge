import type { FragmentData } from '../data/types.ts'
import { LEVELS, LEVEL_ORDER } from '../data/levels.ts'

export type LevelProgress = {
  levelId: string
  completed: boolean
  fragments: string[]
  quizScore: number
}

export class ProgressSystem {
  private storageKey = 'scientia_progress'
  private progress: Record<string, LevelProgress> = {}

  constructor() {
    this.load()
  }

  private load(): void {
    try {
      const data = localStorage.getItem(this.storageKey)
      if (data) {
        this.progress = JSON.parse(data)
      }
    } catch {
      this.progress = {}
    }

    for (const id of LEVEL_ORDER) {
      if (!this.progress[id]) {
        this.progress[id] = {
          levelId: id,
          completed: false,
          fragments: [],
          quizScore: 0,
        }
      }
    }
  }

  private save(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.progress))
    } catch {
    }
  }

  getProgress(levelId: string): LevelProgress {
    return this.progress[levelId] ?? {
      levelId,
      completed: false,
      fragments: [],
      quizScore: 0,
    }
  }

  addFragment(levelId: string, fragment: FragmentData): void {
    const p = this.getProgress(levelId)
    if (!p.fragments.includes(fragment.id)) {
      p.fragments.push(fragment.id)
    }
    this.save()
  }

  completeLevel(levelId: string, quizScore: number): void {
    const p = this.getProgress(levelId)
    p.completed = true
    p.quizScore = Math.max(p.quizScore, quizScore)
    this.save()
  }

  isLevelUnlocked(levelId: string): boolean {
    const idx = LEVEL_ORDER.indexOf(levelId)
    if (idx === 0) return true
    const prev = LEVEL_ORDER[idx - 1]
    return this.progress[prev]?.completed ?? false
  }

  getAllProgress(): Record<string, LevelProgress> {
    return { ...this.progress }
  }

  getLevelConfig(levelId: string) {
    return LEVELS[levelId]
  }

  getNextLevel(currentId: string): string | null {
    const idx = LEVEL_ORDER.indexOf(currentId)
    if (idx < LEVEL_ORDER.length - 1) {
      return LEVEL_ORDER[idx + 1]
    }
    return null
  }
}
