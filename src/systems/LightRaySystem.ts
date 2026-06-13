import Phaser from 'phaser'
import type { LightRay } from '../data/types.ts'

export type LightRayGraphics = {
  graphics: Phaser.GameObjects.Graphics
  ray: LightRay
  life: number
  maxLife: number
}

export class LightRaySystem {
  private scene: Phaser.Scene
  private rays: LightRayGraphics[] = []
  private beamGraphics: Phaser.GameObjects.Graphics

  constructor(scene: Phaser.Scene) {
    this.scene = scene
    this.beamGraphics = scene.add.graphics()
    this.beamGraphics.setDepth(50)
  }

  drawRay(ray: LightRay, life: number = -1, alpha: number = 0.7): void {
    const g = this.scene.add.graphics()
    g.setDepth(50)

    const dx = ray.endX - ray.startX
    const dy = ray.endY - ray.startY
    const len = Math.sqrt(dx * dx + dy * dy)

    if (len < 1) return

    const steps = Math.floor(len / 4)
    for (let i = 0; i < steps; i++) {
      const t = i / steps
      const x = ray.startX + dx * t
      const y = ray.startY + dy * t
      const flickerAlpha = alpha * (0.8 + Math.random() * 0.2)
      const thickness = 1.5 + Math.random() * 1.5
      g.fillStyle(ray.color ?? 0xffff44, flickerAlpha)
      g.fillCircle(x, y, thickness)
    }

    this.rays.push({ graphics: g, ray, life, maxLife: life })
  }

  drawBeam(
    startX: number,
    startY: number,
    angle: number,
    length: number,
    color: number = 0xffff44,
    thickness: number = 3,
  ): void {
    this.beamGraphics.clear()
    this.beamGraphics.lineStyle(thickness, color, 0.8)

    const endX = startX + Math.cos(angle) * length
    const endY = startY + Math.sin(angle) * length

    this.beamGraphics.beginPath()
    this.beamGraphics.moveTo(startX, startY)
    this.beamGraphics.lineTo(endX, endY)
    this.beamGraphics.strokePath()

    for (let i = 0; i < 8; i++) {
      const t = (i + 1) / 9
      const px = startX + (endX - startX) * t
      const py = startY + (endY - startY) * t
      const glowSize = thickness * 2 + Math.random() * 2
      this.beamGraphics.fillStyle(color, 0.15 + Math.random() * 0.1)
      this.beamGraphics.fillCircle(px, py, glowSize)
    }
  }

  drawReflection(
    segments: { x: number; y: number }[],
    color: number = 0xffff44,
    thickness: number = 3,
  ): void {
    this.beamGraphics.lineStyle(thickness, color, 0.8)
    this.beamGraphics.beginPath()
    this.beamGraphics.moveTo(segments[0].x, segments[0].y)

    for (let i = 1; i < segments.length; i++) {
      this.beamGraphics.lineTo(segments[i].x, segments[i].y)
    }

    this.beamGraphics.strokePath()

    for (const seg of segments) {
      this.beamGraphics.fillStyle(color, 0.2)
      this.beamGraphics.fillCircle(seg.x, seg.y, thickness + 1)
    }
  }

  clearBeam(): void {
    this.beamGraphics.clear()
  }

  update(_time: number, _delta: number): void {
    for (let i = this.rays.length - 1; i >= 0; i--) {
      if (this.rays[i].life > 0) {
        this.rays[i].life--
        this.rays[i].graphics.setAlpha(this.rays[i].life / this.rays[i].maxLife)
      }

      if (this.rays[i].life === 0) {
        this.rays[i].graphics.destroy()
        this.rays.splice(i, 1)
      }
    }
  }

  clearAll(): void {
    for (const r of this.rays) {
      r.graphics.destroy()
    }
    this.rays = []
    this.clearBeam()
  }

  destroy(): void {
    this.clearAll()
    this.beamGraphics.destroy()
  }
}
