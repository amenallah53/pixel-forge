import Phaser from "phaser";
import { DialogueSystem } from "../../systems/DialogueSystem.ts";
import { ProgressSystem } from "../../systems/ProgressSystem.ts";
import { ThreeDWorld } from "../../systems/ThreeDWorld.ts";
import { DIALOGUES } from "../../data/dialogues.ts";
import { UIButton } from "../../ui/UIButton.ts";
import { t } from "../../i18n/index.ts";

const CLICK_ANGLE = Math.PI / 6;
const HALF_LEN = 50;

type MirrorObj = {
  group: Phaser.GameObjects.Container;
  rotation: number;
  x: number;
  y: number;
  threeObj: ReturnType<ThreeDWorld["create3DMirror"]>;
  clickCount: number;
  label: Phaser.GameObjects.Text;
};

export class MirrorLabyrinthScene extends Phaser.Scene {
  private dialogueSystem!: DialogueSystem;
  private threeWorld!: ThreeDWorld;
  private mirrors: MirrorObj[] = [];
  private lightSource = { x: 50, y: 350 };
  private targetPos = { x: 740, y: 200 };
  private puzzleSolved = false;
  private solved = false;
  private beamG!: Phaser.GameObjects.Graphics;
  private glowG!: Phaser.GameObjects.Graphics;
  private ghostG!: Phaser.GameObjects.Graphics;
  private angleVizG!: Phaser.GameObjects.Graphics;
  private particles: Phaser.GameObjects.Particles.ParticleEmitter[] = [];
  private angleText!: Phaser.GameObjects.Text;
  private hintText!: Phaser.GameObjects.Text;
  private beamTimer = 0;
  private continueButton?: UIButton;
  private transitionLock = false;

  constructor() {
    super({ key: "MirrorLabyrinthScene" });
  }

  create(): void {
    const w = this.scale.width;
    const h = this.scale.height;

    this.cameras.main.setBackgroundColor("#05050a");
    this.cameras.main.fadeIn(800, 0, 0, 0);

    const bgImage = this.add.image(w / 2, h / 2, "background");
    bgImage.setDisplaySize(w, h);
    bgImage.setAlpha(0.08);
    bgImage.setDepth(0);

    this.beamG = this.add.graphics().setDepth(20);
    this.glowG = this.add.graphics().setDepth(18);
    this.ghostG = this.add.graphics().setDepth(12);
    this.angleVizG = this.add.graphics().setDepth(19);

    this.createRoom(w, h);
    this.createEmitter(w, h);
    this.createTarget(w, h);
    this.createMirrors();
    this.createUI(w, h);

    this.threeWorld = new ThreeDWorld(w, h);
    const canvas = this.threeWorld.getCanvas();
    canvas.style.zIndex = "5";
    canvas.style.opacity = "0.95";
    document.getElementById("root")?.appendChild(canvas);

    this.addMirror3DObjects();

    this.time.delayedCall(800, () => this.startIntroDialogue());
  }

  private addMirror3DObjects(): void {
    for (const m of this.mirrors) {
      m.threeObj = this.threeWorld.create3DMirror(m.x, m.y, m.rotation);
      this.threeWorld.addObject(m.threeObj);
    }
  }

  private createRoom(w: number, h: number): void {
    const floor = this.add.graphics().setDepth(0);
    floor.fillGradientStyle(0x05050a, 0x05050a, 0x0a0a14, 0x0a0a14, 1);
    floor.fillRect(0, 0, w, h);

    const grid = this.add.graphics().setDepth(1);
    grid.lineStyle(1, 0x1a1a2a, 0.12);
    for (let x = 0; x < w; x += 50) {
      grid.beginPath();
      grid.moveTo(x, 0);
      grid.lineTo(x, h);
      grid.strokePath();
    }
    for (let y = 0; y < h; y += 50) {
      grid.beginPath();
      grid.moveTo(0, y);
      grid.lineTo(w, y);
      grid.strokePath();
    }

    this.add
      .graphics()
      .setDepth(2)
      .lineStyle(2, 0x2a2a4a, 0.3)
      .strokeRect(15, 15, w - 30, h - 30);
  }

  private createEmitter(w: number, h: number): void {
    const g = this.add.graphics().setDepth(14);
    g.fillStyle(0xffff44, 1);
    g.fillCircle(this.lightSource.x, this.lightSource.y, 8);
    g.fillStyle(0xffff88, 0.2).fillCircle(
      this.lightSource.x,
      this.lightSource.y,
      18,
    );
    g.fillStyle(0xffffff, 0.06).fillCircle(
      this.lightSource.x,
      this.lightSource.y,
      30,
    );

    const glow = this.add.graphics().setDepth(13);
    glow
      .fillStyle(0xffff44, 0.04)
      .fillCircle(this.lightSource.x, this.lightSource.y, 40);
    this.tweens.add({
      targets: glow,
      alpha: 0.5,
      duration: 1000,
      yoyo: true,
      repeat: -1,
    });

    this.tweens.add({
      targets: g,
      alpha: { from: 0.8, to: 1 },
      duration: 600,
      yoyo: true,
      repeat: -1,
    });

    this.add
      .text(
        this.lightSource.x,
        this.lightSource.y - 28,
        t("mirror.lightSource"),
        {
          fontSize: "9px",
          color: "#ffff44",
          fontFamily: "Georgia, serif",
        },
      )
      .setOrigin(0.5)
      .setDepth(15);

    const arrow = this.add.graphics().setDepth(13);
    arrow.fillStyle(0xffff44, 0.2);
    arrow.fillTriangle(70, 345, 70, 355, 95, 350);
    this.tweens.add({
      targets: arrow,
      alpha: { from: 0.3, to: 0.7 },
      duration: 500,
      yoyo: true,
      repeat: -1,
    });
  }

  private createTarget(w: number, h: number): void {
    const tx = this.targetPos.x;
    const ty = this.targetPos.y;

    const g = this.add.graphics().setDepth(14);
    g.fillStyle(0x4488ff, 0.25);
    g.fillCircle(tx, ty, 14);
    g.lineStyle(1.5, 0x88ccff, 0.5);
    g.strokeCircle(tx, ty, 14);
    g.fillStyle(0x88ccff, 0.15);
    g.fillCircle(tx, ty, 8);
    g.fillStyle(0xffffff, 0.08);
    g.fillCircle(tx, ty, 4);

    this.add
      .text(tx, ty + 28, t("mirror.target"), {
        fontSize: "9px",
        color: "#88ccff",
        fontFamily: "Georgia, serif",
      })
      .setOrigin(0.5)
      .setDepth(15);
  }

  private createMirrors(): void {
    const configs = [
      { x: 200, y: 350, label: "M1", startRot: 0 },
      { x: 287, y: 200, label: "M2", startRot: 0 },
    ];

    for (const cfg of configs) {
      const container = this.add.container(cfg.x, cfg.y).setDepth(18);

      const mirrorGlow = this.add.image(0, -6, "mirror");
      mirrorGlow.setScale(1.18);
      mirrorGlow.setAlpha(0.2);
      mirrorGlow.setTint(0xa6ddff);
      container.add(mirrorGlow);

      const mirrorImage = this.add.image(0, -6, "mirror");
      mirrorImage.setScale(1.05);
      container.add(mirrorImage);

      const stand = this.add.graphics();
      stand.lineStyle(1.5, 0x555577, 0.4);
      stand.beginPath();
      stand.moveTo(0, 26);
      stand.lineTo(0, 42);
      stand.strokePath();
      stand.fillStyle(0x333355, 0.4).fillRect(-6, 40, 12, 3);
      container.add(stand);

      const hitZone = this.add.rectangle(0, 0, 64, 92, 0xffffff, 0);
      hitZone.setInteractive({ useHandCursor: true });
      container.add(hitZone);

      const label = this.add
        .text(0, 58, cfg.label + " [0]", {
          fontSize: "10px",
          color: "#88a4ff",
          fontFamily: "Georgia, serif",
        })
        .setOrigin(0.5)
        .setDepth(15);
      container.add(label);

      const mo: MirrorObj = {
        group: container,
        rotation: cfg.startRot,
        x: cfg.x,
        y: cfg.y,
        threeObj: null as unknown as ReturnType<ThreeDWorld["create3DMirror"]>,
        clickCount: 0,
        label,
      };

      hitZone.on("pointerover", () => {
        mirrorGlow.setAlpha(0.35);
        mirrorGlow.setTint(0xffffaa);
      });

      hitZone.on("pointerout", () => {
        mirrorGlow.setAlpha(0.2);
        mirrorGlow.setTint(0xa6ddff);
      });

      hitZone.on("pointerdown", () => {
        if (this.puzzleSolved) return;
        mo.rotation += CLICK_ANGLE;
        if (mo.rotation > Math.PI * 2) mo.rotation -= Math.PI * 2;
        mo.clickCount++;
        mo.label.setText(cfg.label + ` [${mo.clickCount}]`);
        container.setRotation(mo.rotation);

        if (mo.threeObj) this.threeWorld.removeObject(mo.threeObj);
        mo.threeObj = this.threeWorld.create3DMirror(mo.x, mo.y, mo.rotation);
        this.threeWorld.addObject(mo.threeObj);

        this.showClickFlash(cfg.x, cfg.y);
        this.updateBeam();
      });

      this.mirrors.push(mo);
    }
  }

  private showClickFlash(x: number, y: number): void {
    const flash = this.add.graphics().setDepth(25);
    flash.fillStyle(0xffff44, 0.1).fillCircle(x, y, 25);
    this.tweens.add({
      targets: flash,
      alpha: 0,
      scale: 1.5,
      duration: 350,
      onComplete: () => flash.destroy(),
    });
  }

  private createUI(w: number, h: number): void {
    const boxG = this.add.graphics().setDepth(28);
    boxG.fillStyle(0x000000, 0.58);
    boxG.fillRoundedRect(w / 2 - 270, 8, 540, 50, 8);
    boxG.lineStyle(1, 0x444466, 0.3);
    boxG.strokeRoundedRect(w / 2 - 270, 8, 540, 50, 8);

    this.add
      .text(w / 2, 18, t("mirror.step"), {
        fontSize: "11px",
        color: "#ffd700",
        fontFamily: "Georgia, serif",
        fontStyle: "italic",
      })
      .setOrigin(0.5)
      .setDepth(29);

    this.hintText = this.add
      .text(w / 2, 36, t("mirror.goal"), {
        fontSize: "9px",
        color: "#b6b6d9",
        fontFamily: "Georgia, serif",
      })
      .setOrigin(0.5)
      .setDepth(29);

    this.continueButton = new UIButton(
      this,
      w - 118,
      h - 30,
      180,
      30,
      t("mirror.skip"),
      0x2a1a0a,
      0x4a3728,
      () => this.skipToNextScene(),
    );
    this.continueButton.setDepth(29);

    this.angleText = this.add
      .text(w / 2, h - 15, "", {
        fontSize: "10px",
        color: "#5588aa",
        fontFamily: "Georgia, serif",
      })
      .setOrigin(0.5)
      .setDepth(30)
      .setAlpha(0);
  }

  private updateBeam(): void {
    if (this.puzzleSolved) return;

    this.beamG.clear();
    this.glowG.clear();
    this.ghostG.clear();

    for (const p of this.particles) p.destroy();
    this.particles = [];

    const result = this.traceBeam();

    if (result.segments.length < 2) {
      this.angleText.setAlpha(0);
      this.hintText.setText(t("mirror.noHit"));
      return;
    }

    this.drawBeam(result.segments);

    if (result.hitTarget) {
      this.onPuzzleSolved();
    }
  }

  private traceBeam(): {
    segments: { x: number; y: number }[];
    hitTarget: boolean;
  } {
    const segs: { x: number; y: number }[] = [
      { x: this.lightSource.x, y: this.lightSource.y },
    ];
    let angle = 0;
    let cx = this.lightSource.x;
    let cy = this.lightSource.y;
    let hitTarget = false;

    for (let bounce = 0; bounce < 5; bounce++) {
      let bestHit: { x: number; y: number; dist: number; idx: number } | null =
        null;

      for (let i = 0; i < this.mirrors.length; i++) {
        const hit = this.rayMirrorHit(cx, cy, angle, this.mirrors[i]);
        if (hit && (!bestHit || hit.dist < bestHit.dist)) {
          bestHit = { ...hit, idx: i };
        }
      }

      if (!bestHit) {
        const ex = cx + Math.cos(angle) * 750;
        const ey = cy + Math.sin(angle) * 750;
        segs.push({ x: ex, y: ey });
        if (this.distToTarget(ex, ey) < 30) hitTarget = true;
        break;
      }

      segs.push({ x: bestHit.x, y: bestHit.y });

      const mirror = this.mirrors[bestHit.idx];
      const nx = Math.cos(mirror.rotation);
      const ny = Math.sin(mirror.rotation);
      const inAngle = angle;
      const inX = Math.cos(inAngle);
      const inY = Math.sin(inAngle);
      const dot = inX * nx + inY * ny;
      const rx = inX - 2 * dot * nx;
      const ry = inY - 2 * dot * ny;
      const outAngle = Math.atan2(ry, rx);
      angle = outAngle;

      cx = bestHit.x + rx * 10;
      cy = bestHit.y + ry * 10;

      this.showAngles(cx, cy, inAngle, outAngle, mirror.rotation);
    }

    const last = segs[segs.length - 1];
    if (this.distToTarget(last.x, last.y) < 30) hitTarget = true;

    return { segments: segs, hitTarget };
  }

  private rayMirrorHit(
    ox: number,
    oy: number,
    angle: number,
    mirror: MirrorObj,
  ): { x: number; y: number; dist: number } | null {
    const cosA = Math.cos(mirror.rotation);
    const sinA = Math.sin(mirror.rotation);

    const m1x = mirror.x - sinA * HALF_LEN;
    const m1y = mirror.y + cosA * HALF_LEN;
    const m2x = mirror.x + sinA * HALF_LEN;
    const m2y = mirror.y - cosA * HALF_LEN;

    const dx = m2x - m1x;
    const dy = m2y - m1y;
    const rx = Math.cos(angle);
    const ry = Math.sin(angle);

    const denom = rx * dy - ry * dx;
    if (Math.abs(denom) < 0.0001) return null;

    const t = ((m1x - ox) * dy - (m1y - oy) * dx) / denom;
    const u = ((m1x - ox) * ry - (m1y - oy) * rx) / denom;

    if (t <= 5 || u < 0 || u > 1) return null;

    const hx = ox + rx * t;
    const hy = oy + ry * t;

    return { x: hx, y: hy, dist: t };
  }

  private drawBeam(segs: { x: number; y: number }[]): void {
    this.beamTimer += 0.05;
    const pulse = 0.7 + 0.3 * Math.sin(this.beamTimer);

    for (let i = 0; i < segs.length - 1; i++) {
      const s = segs[i];
      const e = segs[i + 1];

      this.glowG.lineStyle(12, 0xffff44, 0.06 * pulse);
      this.glowG.beginPath();
      this.glowG.moveTo(s.x, s.y);
      this.glowG.lineTo(e.x, e.y);
      this.glowG.strokePath();

      this.glowG.lineStyle(6, 0xffff44, 0.12 * pulse);
      this.glowG.beginPath();
      this.glowG.moveTo(s.x, s.y);
      this.glowG.lineTo(e.x, e.y);
      this.glowG.strokePath();

      this.beamG.lineStyle(2.5, 0xffff44, 0.85 * pulse);
      this.beamG.beginPath();
      this.beamG.moveTo(s.x, s.y);
      this.beamG.lineTo(e.x, e.y);
      this.beamG.strokePath();

      this.beamG.fillStyle(0xffffff, 0.3).fillCircle(s.x, s.y, 2);
    }

    if (segs.length >= 2 && !this.solved) {
      const last = segs[segs.length - 1];
      const prev = segs[segs.length - 2];
      const dist = this.distToTarget(last.x, last.y);

      if (dist < 30) {
        this.beamG.fillStyle(0x44ffaa, 2 * pulse).fillCircle(last.x, last.y, 8);
        this.beamG
          .fillStyle(0x44ffaa, 0.3 * pulse)
          .fillCircle(last.x, last.y, 18);
      } else if (dist < 100) {
        this.beamG.fillStyle(0xffff44, 0.4).fillCircle(last.x, last.y, 5);
        this.drawGhostPreview(prev, last);
      } else {
        this.beamG.fillStyle(0xffff44, 0.15).fillCircle(last.x, last.y, 3);
        this.drawGhostPreview(prev, last);
      }
    }

    const lastSeg = segs[segs.length - 1];
    const em = this.add
      .particles(lastSeg.x, lastSeg.y, "particle", {
        speed: { min: 3, max: 10 },
        angle: { min: 0, max: 360 },
        scale: { start: 0.2, end: 0 },
        alpha: { start: 0.3, end: 0 },
        lifespan: 400,
        frequency: 100,
        quantity: 1,
        tint: 0xffff44,
      })
      .setDepth(22);
    this.particles.push(em);
  }

  private drawGhostPreview(
    prev: { x: number; y: number },
    last: { x: number; y: number },
  ): void {
    const dx = last.x - prev.x;
    const dy = last.y - prev.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len < 1) return;
    const nx = dx / len;
    const ny = dy / len;
    const glx = last.x + nx * 60;
    const gly = last.y + ny * 60;

    this.ghostG.lineStyle(1, 0x88ff88, 0.15);
    for (let t = 0; t < 1; t += 0.08) {
      const sx = last.x + (glx - last.x) * t;
      const sy = last.y + (gly - last.y) * t;
      const ex = last.x + (glx - last.x) * Math.min(t + 0.03, 1);
      const ey = last.y + (gly - last.y) * Math.min(t + 0.03, 1);
      this.ghostG.beginPath();
      this.ghostG.moveTo(sx, sy);
      this.ghostG.lineTo(ex, ey);
      this.ghostG.strokePath();
    }
  }

  private showAngles(
    cx: number,
    cy: number,
    inAngle: number,
    outAngle: number,
    _mirrorRotation: number,
  ): void {
    const toNorm = (a: number) =>
      ((a % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    const toLine = (a: number) => {
      const n = ((a % Math.PI) + Math.PI) % Math.PI;
      return n;
    };
    const toSigned = (d: number) =>
      ((((d + Math.PI) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)) -
      Math.PI;

    const inNorm = toNorm(inAngle);
    const outNorm = toNorm(outAngle);

    const inLine = toLine(inNorm);
    const outLine = toLine(outNorm);

    let diff = toSigned(outLine - inLine);
    if (Math.abs(diff) > Math.PI / 2)
      diff = diff > 0 ? diff - Math.PI : diff + Math.PI;

    const halfAngle = Math.abs(diff) / 2;
    const deg = Math.round(Phaser.Math.RadToDeg(halfAngle));

    this.angleText.setText(`Incident = ${deg}°  Reflected = ${deg}°`);
    this.angleText.setAlpha(1);

    const bisectLine = (((inLine + diff / 2) % Math.PI) + Math.PI) % Math.PI;

    const pickBisectorDir = (rayAngle: number): number => {
      const d1 = toSigned(bisectLine - rayAngle);
      const d2 = toSigned(bisectLine + Math.PI - rayAngle);
      return Math.abs(d1) <= Math.abs(d2) ? bisectLine : bisectLine + Math.PI;
    };

    const bInc = pickBisectorDir(inNorm);
    const bRef = pickBisectorDir(outNorm);

    const arcRadius = 28;
    const sweepInc = toSigned(bInc - inNorm);
    const sweepRef = toSigned(outNorm - bRef);

    if (Math.abs(sweepInc) > 0.01) {
      this.angleVizG.lineStyle(1.5, 0x88ddff, 0.7);
      this.angleVizG.beginPath();
      this.angleVizG.arc(cx, cy, arcRadius, inNorm, bInc, sweepInc < 0);
      this.angleVizG.strokePath();
    }

    if (Math.abs(sweepRef) > 0.01) {
      this.angleVizG.lineStyle(1.5, 0xffdd88, 0.7);
      this.angleVizG.beginPath();
      this.angleVizG.arc(cx, cy, arcRadius - 4, bRef, outNorm, sweepRef < 0);
      this.angleVizG.strokePath();
    }

    const midInc = inNorm + sweepInc / 2;
    const midRef = bRef + sweepRef / 2;

    this.angleVizG.fillStyle(0x88ddff, 0.7);
    this.angleVizG.fillCircle(
      cx + Math.cos(midInc) * (arcRadius + 12),
      cy + Math.sin(midInc) * (arcRadius + 12),
      2,
    );
    this.angleVizG.fillStyle(0xffdd88, 0.7);
    this.angleVizG.fillCircle(
      cx + Math.cos(midRef) * (arcRadius + 10),
      cy + Math.sin(midRef) * (arcRadius + 10),
      2,
    );

    const incLabelX = cx + Math.cos(midInc) * (arcRadius + 20);
    const incLabelY = cy + Math.sin(midInc) * (arcRadius + 20);
    const incLabel = this.add
      .text(incLabelX, incLabelY, `${deg}°`, {
        fontSize: "8px",
        color: "#88ddff",
        fontFamily: "Georgia, serif",
        backgroundColor: "#00000099",
        padding: { x: 2, y: 1 },
      })
      .setOrigin(0.5)
      .setDepth(22);
    this.time.delayedCall(300, () => {
      if (incLabel.active) incLabel.destroy();
    });

    const refLabelX = cx + Math.cos(midRef) * (arcRadius + 20);
    const refLabelY = cy + Math.sin(midRef) * (arcRadius + 20);
    const refLabel = this.add
      .text(refLabelX, refLabelY, `${deg}°`, {
        fontSize: "8px",
        color: "#ffdd88",
        fontFamily: "Georgia, serif",
        backgroundColor: "#00000099",
        padding: { x: 2, y: 1 },
      })
      .setOrigin(0.5)
      .setDepth(22);
    this.time.delayedCall(300, () => {
      if (refLabel.active) refLabel.destroy();
    });

    const bisectEndX = cx + Math.cos(bisectLine) * 40;
    const bisectEndY = cy + Math.sin(bisectLine) * 40;
    this.angleVizG.lineStyle(1, 0xffffff, 0.25);
    this.angleVizG.beginPath();
    this.angleVizG.moveTo(cx, cy);
    this.angleVizG.lineTo(bisectEndX, bisectEndY);
    this.angleVizG.strokePath();
  }

  private distToTarget(x: number, y: number): number {
    return Phaser.Math.Distance.Between(
      x,
      y,
      this.targetPos.x,
      this.targetPos.y,
    );
  }

  private onPuzzleSolved(): void {
    if (this.solved) return;
    this.solved = true;
    this.puzzleSolved = true;
    new ProgressSystem().addXP("level1", 50);

    this.beamG.clear();
    this.glowG.clear();
    this.ghostG.clear();
    this.hintText.setText(t("mirror.captured"));

    const result = this.traceBeam();
    for (let i = 0; i < result.segments.length - 1; i++) {
      const s = result.segments[i];
      const e = result.segments[i + 1];
      this.glowG.lineStyle(16, 0x44ffaa, 0.1);
      this.glowG.beginPath();
      this.glowG.moveTo(s.x, s.y);
      this.glowG.lineTo(e.x, e.y);
      this.glowG.strokePath();
      this.beamG.lineStyle(3, 0x44ffaa, 0.95);
      this.beamG.beginPath();
      this.beamG.moveTo(s.x, s.y);
      this.beamG.lineTo(e.x, e.y);
      this.beamG.strokePath();
    }

    const burst = this.add
      .particles(this.targetPos.x, this.targetPos.y, "particle", {
        speed: { min: 40, max: 150 },
        angle: { min: 0, max: 360 },
        scale: { start: 0.7, end: 0 },
        alpha: { start: 0.9, end: 0 },
        lifespan: 2000,
        quantity: 30,
        tint: 0x44ffaa,
        emitting: false,
      })
      .setDepth(25);
    burst.explode(30);
    this.time.delayedCall(400, () => burst.explode(20));
    this.time.delayedCall(800, () => {
      const b2 = this.add
        .particles(this.targetPos.x, this.targetPos.y, "particle", {
          speed: { min: 10, max: 30 },
          angle: { min: 0, max: 360 },
          scale: { start: 0.4, end: 0 },
          alpha: { start: 0.6, end: 0 },
          lifespan: 3000,
          quantity: 10,
          tint: 0x88ddff,
          emitting: false,
        })
        .setDepth(25);
      b2.explode(15);
    });

    const overlay = this.add.graphics().setDepth(28);
    overlay
      .fillStyle(0x000000, 0)
      .fillRect(0, 0, this.scale.width, this.scale.height);
    this.tweens.add({ targets: overlay, alpha: 0.35, duration: 600 });

    const txt = this.add
      .text(
        this.scale.width / 2,
        this.scale.height / 2 - 10,
        t("mirror.reflectionCaptured"),
        {
          fontSize: "22px",
          color: "#44ffaa",
          fontFamily: "Georgia, serif",
          fontStyle: "italic",
        },
      )
      .setOrigin(0.5)
      .setDepth(30)
      .setAlpha(0);
    this.tweens.add({
      targets: txt,
      alpha: 1,
      scale: { from: 0.5, to: 1 },
      duration: 500,
      ease: "Back.easeOut",
    });

    const peda = this.add
      .text(
        this.scale.width / 2,
        this.scale.height / 2 + 30,
        t("mirror.lawOfReflection"),
        {
          fontSize: "12px",
          color: "#88ddff",
          fontFamily: "Georgia, serif",
          fontStyle: "italic",
        },
      )
      .setOrigin(0.5)
      .setDepth(30)
      .setAlpha(0);
    this.tweens.add({ targets: peda, alpha: 1, duration: 600, delay: 600 });

    this.time.delayedCall(2800, () => this.startSuccessDialogue());
  }

  private async startIntroDialogue(): Promise<void> {
    this.dialogueSystem = new DialogueSystem(this);
    const dialogue = DIALOGUES.mirror_intro;
    await this.dialogueSystem.playSequence(dialogue.lines);
    if (this.transitionLock) return;
    this.dialogueSystem.destroy();
    this.hintText.setText(t("mirror.hintClick"));
    this.time.delayedCall(3000, () => {
      if (!this.solved) this.hintText.setText(t("mirror.hintTip"));
    });
    this.updateBeam();
  }

  private skipToNextScene(): void {
    if (this.transitionLock) return;
    this.transitionLock = true;
    this.dialogueSystem?.skip();
    this.dialogueSystem?.destroy();
    this.continueButton?.destroy();
    this.threeWorld.destroy();
    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.cameras.main.once("camerafadeoutcomplete", () => {
      this.scene.start("QuizScene");
    });
  }

  private async startSuccessDialogue(): Promise<void> {
    if (this.transitionLock) return;
    this.transitionLock = true;
    this.dialogueSystem = new DialogueSystem(this);
    const dialogue = DIALOGUES.mirror_success;
    await this.dialogueSystem.playSequence(dialogue.lines);
    this.threeWorld.destroy();
    this.cameras.main.fadeOut(800, 0, 0, 0);
    this.cameras.main.once("camerafadeoutcomplete", () => {
      this.dialogueSystem.destroy();
      this.scene.start("QuizScene");
    });
  }

  update(_time: number, _delta: number): void {
    if (!this.transitionLock) {
      this.threeWorld.render(_delta);
    }
    if (!this.puzzleSolved) this.updateBeam();
  }
}
