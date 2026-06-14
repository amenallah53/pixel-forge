import Phaser from "phaser";
import { UIButton } from "../../ui/UIButton.ts";
// FaradayThreeViz removed
import type {
  BatteryNode,
  GeneratorNode,
  GridNode,
  GridState,
} from "./types.ts";

type Placeable = GeneratorNode | BatteryNode;

const BUILDINGS: GridNode[] = [
  {
    id: "hospital",
    kind: "hospital",
    label: "Hospital",
    x: 612,
    y: 176,
    demand: 8,
    critical: true,
    supplied: false,
  },
  {
    id: "water",
    kind: "waterPump",
    label: "Water Pump",
    x: 570,
    y: 410,
    demand: 5,
    critical: true,
    supplied: false,
  },
  {
    id: "school",
    kind: "school",
    label: "School",
    x: 280,
    y: 150,
    demand: 3,
    critical: true,
    supplied: false,
  },
  {
    id: "homesA",
    kind: "house",
    label: "Houses",
    x: 202,
    y: 384,
    demand: 4,
    critical: false,
    supplied: false,
  },
  {
    id: "homesB",
    kind: "house",
    label: "East Homes",
    x: 430,
    y: 285,
    demand: 3,
    critical: false,
    supplied: false,
  },
];

export class PowerGridScene extends Phaser.Scene {
  // visualizer removed
  private state!: GridState;
  private cableGraphics!: Phaser.GameObjects.Graphics;
  private buildingLayer!: Phaser.GameObjects.Container;
  private hudText!: Phaser.GameObjects.Text;
  private statusText!: Phaser.GameObjects.Text;
  private guideText!: Phaser.GameObjects.Text;
  private selectedText!: Phaser.GameObjects.Text;
  private rangeCircle!: Phaser.GameObjects.Arc;
  private selectedSourceId: string | null = null;
  private completionStarted = false;
  private pulseTime = 0;

  // ── Persistent source game objects ──────────────────────────────────────────
  // Kept directly on the scene — NOT inside any Container.
  // The original bug: nodeLayer.removeAll(true) was called on pointerdown,
  // destroying the source object before drag could begin.
  // Storing them here means selection / state changes never require a re-create.
  private sourceShapes = new Map<string, Phaser.GameObjects.Rectangle>();
  private sourceTexts = new Map<string, Phaser.GameObjects.Text>();
  private sourceGlows = new Map<string, Phaser.GameObjects.Rectangle>();
  private sourceTags = new Map<string, Phaser.GameObjects.Text>();

  constructor() {
    super({ key: "PowerGridScene" });
  }

  // ─── Lifecycle ───────────────────────────────────────────────────────────────

  create(): void {
    // Clear Maps so scene.restart() starts clean without reinstantiating the class
    this.selectedSourceId = null;
    this.completionStarted = false;
    this.pulseTime = 0;
    this.sourceShapes.clear();
    this.sourceTexts.clear();
    this.sourceGlows.clear();
    this.sourceTags.clear();

    const w = this.scale.width;
    const h = this.scale.height;

    this.cameras.main.setBackgroundColor("#050e14");
    this.cameras.main.fadeIn(600, 0, 0, 0);

    // visualizer removed

    // Require 8 px of movement before Phaser starts a drag — prevents accidental
    // drag when the player just wants to click-select a source.
    this.input.dragDistanceThreshold = 8;

    this.state = {
      generators: [
        { id: "genA", x: 120, y: 515, output: 12, placed: false },
        { id: "genB", x: 215, y: 515, output: 10, placed: false },
      ],
      batteries: [
        { id: "batA", x: 320, y: 515, capacity: 8, charge: 4, placed: false },
        { id: "batB", x: 415, y: 515, capacity: 7, charge: 3, placed: false },
      ],
      buildings: BUILDINGS.map((b) => ({ ...b })),
      cables: [],
      production: 0,
      demand: 0,
      batteryCharge: 0,
      allCriticalPowered: false,
    };

    this.buildBackground(w, h);
    this.createHud(w);
    this.createGuidePanel();
    this.createTray(h);
    this.createRangeCircle();
    this.createSourceObjects();
    this.renderBuildings();
    this.recalculateGrid();

    // Click on empty canvas → deselect
    this.input.on(
      "pointerdown",
      (_ptr: Phaser.Input.Pointer, hits: Phaser.GameObjects.GameObject[]) => {
        if (hits.length === 0 && this.selectedSourceId) {
          this.selectedSourceId = null;
          this.rangeCircle.setVisible(false);
          this.updateSourceVisuals();
          this.updateSelectedText();
          this.statusText.setText(
            "Deselected. Click a generator or battery to select it.",
          );
        }
      },
    );
  }

  update(_time: number, delta: number): void {
    // viz rendering removed
    this.pulseTime += delta / 1000;
    this.drawCables(); // redraws every frame for the pulse animation
  }

  // ─── Background ──────────────────────────────────────────────────────────────

  private buildBackground(w: number, h: number): void {
    const g = this.add.graphics();
    g.fillGradientStyle(0x050e14, 0x07111c, 0x0e0d0a, 0x060809, 1);
    g.fillRect(0, 0, w, h);

    // City dot grid
    g.fillStyle(0x1a2632, 0.5);
    for (let x = 40; x < w; x += 40)
      for (let y = 72; y < h - 72; y += 40) g.fillCircle(x, y, 1);

    // Roads: thick dark base + thin highlight
    const roads: [number, number, number, number][] = [
      [90, 210, 720, 210],
      [105, 455, 700, 455],
      [350, 80, 350, 470],
      [515, 100, 515, 470],
      [145, 80, 675, 455],
    ];
    g.lineStyle(5, 0x0d1620, 1);
    for (const [x1, y1, x2, y2] of roads) g.lineBetween(x1, y1, x2, y2);
    g.lineStyle(1, 0x253040, 0.45);
    for (const [x1, y1, x2, y2] of roads) g.lineBetween(x1, y1, x2, y2);

    this.cableGraphics = this.add.graphics().setDepth(5);
    this.buildingLayer = this.add.container(0, 0).setDepth(10);

    // Title bar
    this.add.rectangle(w / 2, 30, w, 56, 0x020a12, 0.96).setDepth(19);
    this.add
      .text(w / 2, 15, "RESTORE THE CITY GRID", {
        fontSize: "17px",
        color: "#f4d38a",
        fontFamily: '"Courier New", monospace',
        letterSpacing: 3,
      })
      .setOrigin(0.5)
      .setDepth(20);
    this.add
      .text(
        w / 2,
        41,
        "Power the Hospital, Water Pump, and School  ·  shorter cables = less power loss",
        {
          fontSize: "10px",
          color: "#6aa8c0",
          fontFamily: "Georgia, serif",
        },
      )
      .setOrigin(0.5)
      .setDepth(20);
  }

  // ─── Range circle ─────────────────────────────────────────────────────────────

  private createRangeCircle(): void {
    this.rangeCircle = this.add.arc(0, 0, 120, 0, 360, false, 0x55d6ff, 0.05);
    this.rangeCircle.setStrokeStyle(1, 0x55d6ff, 0.3);
    this.rangeCircle.setDepth(4);
    this.rangeCircle.setVisible(false);
  }

  // ─── Source objects ───────────────────────────────────────────────────────────

  private createSourceObjects(): void {
    for (const gen of this.state.generators)
      this.createSourceObject(gen, 0x55d6ff, 0x07192a);
    for (const bat of this.state.batteries)
      this.createSourceObject(bat, 0x78d677, 0x061a0c);
    // Sync state (no external visualizer)
    const last = this.state.generators[this.state.generators.length - 1];
  }

  private createSourceObject(
    node: Placeable,
    accent: number,
    bg: number,
  ): void {
    const isGen = "output" in node;
    const suffix = node.id.slice(-1).toUpperCase(); // 'A' or 'B'
    const typeLabel = `${isGen ? "GEN" : "BAT"} ${suffix}`;
    const amount = isGen
      ? `${(node as GeneratorNode).output} kW`
      : `${(node as BatteryNode).charge}/${(node as BatteryNode).capacity} kWh`;
    const accentHex = `#${accent.toString(16).padStart(6, "0")}`;

    // Outer glow halo (depth 13)
    const glow = this.add
      .rectangle(node.x, node.y, 82, 54, accent, 0.08)
      .setDepth(13);
    glow.setStrokeStyle(1, accent, 0.2);
    this.sourceGlows.set(node.id, glow);

    // Draggable chip body (depth 14) — interactive lives only here, not on text
    const shape = this.add
      .rectangle(node.x, node.y, 70, 44, bg, 0.97)
      .setDepth(14);
    shape.setStrokeStyle(2, accent, 0.7);
    shape.setInteractive({ draggable: true, useHandCursor: true });
    this.input.setDraggable(shape);
    this.sourceShapes.set(node.id, shape);

    // Label (depth 15, non-interactive — avoids double event firing)
    const text = this.add
      .text(node.x, node.y - 4, `${typeLabel}\n${amount}`, {
        fontSize: "10px",
        color: accentHex,
        align: "center",
        fontFamily: '"Courier New", monospace',
      })
      .setOrigin(0.5)
      .setDepth(15);
    this.sourceTexts.set(node.id, text);

    // "DRAG ME" hint (hidden once placed)
    const tag = this.add
      .text(node.x, node.y + 28, "DRAG ME", {
        fontSize: "8px",
        color: "#f4d38a",
        align: "center",
        fontFamily: '"Courier New", monospace',
      })
      .setOrigin(0.5)
      .setDepth(15);
    tag.setVisible(!node.placed);
    this.sourceTags.set(node.id, tag);

    // ── Drag ─────────────────────────────────────────────────────────────────
    // wasDragged distinguishes a drag gesture from a pure click.
    // dragstart sets it; pointerup checks and resets it.
    let wasDragged = false;

    shape.on("dragstart", () => {
      wasDragged = true;
      this.rangeCircle.setPosition(node.x, node.y).setVisible(true);
    });

    shape.on(
      "drag",
      (_ptr: Phaser.Input.Pointer, dragX: number, dragY: number) => {
        const cx = Phaser.Math.Clamp(dragX, 50, this.scale.width - 50);
        const cy = Phaser.Math.Clamp(dragY, 60, this.scale.height - 80);
        node.x = cx;
        node.y = cy;
        node.placed = true;
        shape.setPosition(cx, cy);
        text.setPosition(cx, cy - 4);
        glow.setPosition(cx, cy);
        tag.setPosition(cx, cy + 28).setVisible(false);
        this.rangeCircle.setPosition(cx, cy);
        if (isGen) {
          // generator position updated; external viz removed
        }
        // cables redraw in update() — no need to call here
      },
    );

    shape.on("dragend", () => {
      this.rangeCircle.setVisible(false);
      const connected = this.tryAutoConnectSource(node);
      this.recalculateGrid();
      this.statusText.setText(
        connected
          ? "Auto-connected! Click the source, then another building for more cables."
          : "Placed. Click this source, then click a building to draw a cable.",
      );
      this.renderBuildings();
    });

    // ── Click: select / deselect ─────────────────────────────────────────────
    // pointerup fires after dragend (wasDragged is still true), so drags are ignored.
    shape.on("pointerup", () => {
      if (!wasDragged) this.handleSourceClick(node.id);
      wasDragged = false;
    });
  }

  private handleSourceClick(id: string): void {
    const node = this.findSource(id);
    if (!node) return;

    this.selectedSourceId = this.selectedSourceId === id ? null : id;
    this.updateSourceVisuals();
    this.updateSelectedText();

    if (this.selectedSourceId) {
      this.rangeCircle.setPosition(node.x, node.y).setVisible(true);
      this.statusText.setText(
        node.placed
          ? "Selected. Now click a red OFFLINE building to draw a cable."
          : "Drag this source into the city first, then select it to cable.",
      );
    } else {
      this.rangeCircle.setVisible(false);
      this.statusText.setText("Deselected.");
    }
  }

  /** Update stroke/fill of existing source shapes — no destroy/recreate needed. */
  private updateSourceVisuals(): void {
    for (const [id, shape] of this.sourceShapes) {
      const sel = id === this.selectedSourceId;
      const accent = id.startsWith("gen") ? 0x55d6ff : 0x78d677;
      const bg = id.startsWith("gen")
        ? sel
          ? 0x0f2840
          : 0x07192a
        : sel
          ? 0x102a12
          : 0x061a0c;

      shape.setFillStyle(bg, 0.97);
      shape.setStrokeStyle(sel ? 3 : 2, accent, sel ? 1.0 : 0.7);

      const glow = this.sourceGlows.get(id);
      if (glow) {
        glow.setFillStyle(accent, sel ? 0.2 : 0.08);
        glow.setStrokeStyle(sel ? 2 : 1, accent, sel ? 0.5 : 0.18);
        glow.setSize(sel ? 90 : 82, sel ? 60 : 54);
      }
    }
  }

  // ─── Buildings ───────────────────────────────────────────────────────────────
  // Only buildings (non-draggable) live in buildingLayer, so removeAll(true) is safe.

  private renderBuildings(): void {
    this.buildingLayer.removeAll(true);
    for (const b of this.state.buildings) this.createBuildingNode(b);
  }

  private createBuildingNode(b: GridNode): void {
    const { supplied, critical } = b;

    // Ambient glow behind the tile
    const glowAlpha = supplied ? 0.12 : critical ? 0.07 : 0;
    if (glowAlpha > 0) {
      const glowColor = supplied ? 0xf9e58a : 0xff3300;
      this.buildingLayer.add(
        new Phaser.GameObjects.Rectangle(
          this,
          b.x,
          b.y,
          106,
          68,
          glowColor,
          glowAlpha,
        ),
      );
    }

    // Main tile
    const tileBg = supplied ? 0x6a4800 : critical ? 0x1a0505 : 0x0b1520;
    const tileBorder = supplied ? 0xf9e58a : critical ? 0xff4400 : 0x3a6a8a;
    const tileOpacity = supplied ? 1 : 0.9;

    const tile = new Phaser.GameObjects.Rectangle(
      this,
      b.x,
      b.y,
      96,
      58,
      tileBg,
      tileOpacity,
    );
    tile.setStrokeStyle(
      supplied ? 2.5 : 2,
      tileBorder,
      supplied ? 1 : critical ? 0.85 : 0.4,
    );
    tile.setInteractive({ useHandCursor: true });
    tile.on("pointerdown", () => this.handleBuildingClick(b.id));
    this.buildingLayer.add(tile);

    // Name row
    const name = new Phaser.GameObjects.Text(
      this,
      b.x,
      b.y - 13,
      `${this.iconFor(b.kind)}  ${b.label}`,
      {
        fontSize: "11px",
        color: supplied ? "#ddc060" : "#ddd0b8",
        fontFamily: "Georgia, serif",
      },
    ).setOrigin(0.5);
    name.setInteractive({ useHandCursor: true });
    name.on("pointerdown", () => this.handleBuildingClick(b.id));
    this.buildingLayer.add(name);

    // Demand
    const demand = new Phaser.GameObjects.Text(
      this,
      b.x,
      b.y + 4,
      `${b.demand} kW`,
      {
        fontSize: "10px",
        color: supplied ? "#a07828" : critical ? "#ff8855" : "#6aa8c0",
        fontFamily: '"Courier New", monospace',
      },
    ).setOrigin(0.5);
    demand.setInteractive({ useHandCursor: true });
    demand.on("pointerdown", () => this.handleBuildingClick(b.id));
    this.buildingLayer.add(demand);

    // Status badge (critical buildings only)
    if (critical || supplied) {
      this.buildingLayer.add(
        new Phaser.GameObjects.Text(
          this,
          b.x,
          b.y + 19,
          supplied ? "ON" : "OFFLINE",
          {
            fontSize: "8px",
            color: supplied ? "#40cc40" : "#cc3322",
            fontFamily: '"Courier New", monospace',
            letterSpacing: 2,
          },
        ).setOrigin(0.5),
      );
    }
  }

  // ─── HUD ─────────────────────────────────────────────────────────────────────

  private createHud(w: number): void {
    this.add
      .rectangle(w - 112, 104, 212, 122, 0x020a12, 0.94)
      .setDepth(19)
      .setStrokeStyle(1, 0x55d6ff, 0.35);
    this.add
      .text(w - 210, 52, "GRID STATUS", {
        fontSize: "9px",
        color: "#55d6ff",
        fontFamily: '"Courier New", monospace',
        letterSpacing: 3,
      })
      .setDepth(20);
    this.hudText = this.add
      .text(w - 210, 66, "", {
        fontSize: "11px",
        color: "#c8f0ff",
        fontFamily: '"Courier New", monospace',
        lineSpacing: 5,
      })
      .setDepth(20);

    // Status bar bottom-left
    this.add
      .rectangle(195, 320, 352, 40, 0x020a12, 0.88)
      .setDepth(19)
      .setStrokeStyle(1, 0x6a4a28, 0.32);
    this.statusText = this.add
      .text(28, 310, "Drag a generator near a red building to begin.", {
        fontSize: "11px",
        color: "#f0dfb8",
        fontFamily: "Georgia, serif",
        wordWrap: { width: 330 },
      })
      .setDepth(20);

    new UIButton(this, 94, 548, 138, 32, "Hint", 0x2a1a0a, 0x4a3728, () =>
      this.showHint(),
    );
    new UIButton(
      this,
      260,
      548,
      140,
      32,
      "Restart Grid",
      0x2a1a0a,
      0x4a3728,
      () => this.scene.restart(),
    );
    new UIButton(
      this,
      445,
      548,
      205,
      32,
      "Skip to Knowledge Check",
      0x332213,
      0x5a3920,
      () => this.skipToQuiz(),
    );
  }

  // ─── Guide panel ─────────────────────────────────────────────────────────────

  private createGuidePanel(): void {
    this.add
      .rectangle(174, 193, 316, 234, 0x020a12, 0.93)
      .setDepth(30)
      .setStrokeStyle(1, 0x55d6ff, 0.28);
    this.add
      .text(32, 87, "HOW TO RESTORE POWER", {
        fontSize: "10px",
        color: "#f4d38a",
        fontFamily: '"Courier New", monospace',
        letterSpacing: 2,
      })
      .setDepth(31);
    this.guideText = this.add
      .text(32, 107, "", {
        fontSize: "10px",
        color: "#c0e0f0",
        fontFamily: "Georgia, serif",
        lineSpacing: 5,
        wordWrap: { width: 280 },
      })
      .setDepth(31);
    this.selectedText = this.add
      .text(32, 250, "Selected: none", {
        fontSize: "10px",
        color: "#8ab8cc",
        fontFamily: '"Courier New", monospace',
      })
      .setDepth(31);
    this.add
      .text(
        32,
        268,
        "Route hint: GEN A→Hospital · GEN B→Water Pump · BAT→School",
        {
          fontSize: "9px",
          color: "#c09050",
          fontFamily: "Georgia, serif",
          wordWrap: { width: 280 },
        },
      )
      .setDepth(31);
  }

  // ─── Tray ────────────────────────────────────────────────────────────────────

  private createTray(h: number): void {
    this.add
      .rectangle(370, h - 55, 600, 70, 0x020a12, 0.94)
      .setStrokeStyle(1, 0x8a6a38, 0.38);
    this.add
      .text(370, h - 68, "2 generators  ·  2 batteries  ·  unlimited cables", {
        fontSize: "10px",
        color: "#cfae82",
        fontFamily: '"Courier New", monospace',
      })
      .setOrigin(0.5);
    this.add
      .text(
        370,
        h - 44,
        "Drag sources into the city   |   Click source → click building to cable",
        {
          fontSize: "9px",
          color: "#5a7888",
          fontFamily: "Georgia, serif",
        },
      )
      .setOrigin(0.5);
  }

  // ─── Interaction ─────────────────────────────────────────────────────────────

  private tryAutoConnectSource(node: Placeable): boolean {
    if (!node.placed) return false;
    const nearby = this.state.buildings
      .map((b) => ({
        b,
        dist: Phaser.Math.Distance.Between(node.x, node.y, b.x, b.y),
      }))
      .filter(({ dist }) => dist <= 120)
      .sort(
        (a, c) =>
          (a.b.critical ? 0 : 1) - (c.b.critical ? 0 : 1) || a.dist - c.dist,
      );

    if (!nearby.length) return false;
    const target = nearby[0].b;
    if (
      this.state.cables.some(
        (c) => c.fromId === node.id && c.toId === target.id,
      )
    )
      return false;
    const len = Phaser.Math.Distance.Between(
      node.x,
      node.y,
      target.x,
      target.y,
    );
    this.state.cables.push({
      fromId: node.id,
      toId: target.id,
      length: len,
      loss: this.lossFromLength(len),
    });
    return true;
  }

  private handleBuildingClick(id: string): void {
    if (!this.selectedSourceId) {
      this.statusText.setText(
        "Select a generator or battery first, then click this building.",
      );
      return;
    }
    const source = this.findSource(this.selectedSourceId);
    const building = this.state.buildings.find((b) => b.id === id);
    if (!source || !building) return;

    if (!source.placed) {
      this.statusText.setText(
        "Drag that source into the city first, then draw a cable.",
      );
      return;
    }

    if (
      !this.state.cables.some(
        (c) => c.fromId === source.id && c.toId === building.id,
      )
    ) {
      const len = Phaser.Math.Distance.Between(
        source.x,
        source.y,
        building.x,
        building.y,
      );
      this.state.cables.push({
        fromId: source.id,
        toId: building.id,
        length: len,
        loss: this.lossFromLength(len),
      });
    }

    this.selectedSourceId = null;
    this.rangeCircle.setVisible(false);
    this.updateSourceVisuals();
    this.updateSelectedText();
    this.recalculateGrid();
    this.renderBuildings();
  }

  // ─── Grid logic ──────────────────────────────────────────────────────────────

  private recalculateGrid(): void {
    this.refreshCableLosses();
    for (const b of this.state.buildings) b.supplied = false;

    const energy = new Map<string, number>();
    for (const g of this.state.generators)
      energy.set(g.id, g.placed ? g.output : 0);
    for (const b of this.state.batteries)
      energy.set(b.id, b.placed ? b.charge : 0);

    const sorted = [...this.state.cables].sort((a, b) => {
      const ac = this.state.buildings.find((n) => n.id === a.toId)?.critical
        ? 0
        : 1;
      const bc = this.state.buildings.find((n) => n.id === b.toId)?.critical
        ? 0
        : 1;
      return ac - bc || a.loss - b.loss;
    });

    for (const cable of sorted) {
      const bld = this.state.buildings.find((b) => b.id === cable.toId);
      if (!bld || bld.supplied) continue;
      const avail = energy.get(cable.fromId) ?? 0;
      const delivered = Math.max(0, avail - cable.loss);
      if (delivered >= bld.demand) {
        bld.supplied = true;
        energy.set(cable.fromId, avail - bld.demand - cable.loss);
      }
    }

    this.state.production = this.state.generators.reduce(
      (s, g) => s + (g.placed ? g.output : 0),
      0,
    );
    this.state.batteryCharge = this.state.batteries.reduce(
      (s, b) => s + (b.placed ? b.charge : 0),
      0,
    );
    this.state.demand = this.state.buildings
      .filter((b) => b.supplied)
      .reduce((s, b) => s + b.demand, 0);
    this.state.allCriticalPowered = this.state.buildings
      .filter((b) => b.critical)
      .every((b) => b.supplied);

    this.updateHud();
    if (this.state.allCriticalPowered && !this.completionStarted)
      this.startCompletion();
  }

  private refreshCableLosses(): void {
    for (const c of this.state.cables) {
      const src = this.findSource(c.fromId);
      const bld = this.state.buildings.find((b) => b.id === c.toId);
      if (!src || !bld) continue;
      c.length = Phaser.Math.Distance.Between(src.x, src.y, bld.x, bld.y);
      c.loss = this.lossFromLength(c.length);
    }
  }

  // ─── Visuals ─────────────────────────────────────────────────────────────────

  /** Called every frame via update() for the pulse animation. */
  private drawCables(): void {
    if (!this.cableGraphics) return;
    this.cableGraphics.clear();
    // energy path visualization removed

    const pulse = 0.65 + 0.35 * Math.sin(this.pulseTime * Math.PI * 1.5);

    for (const cable of this.state.cables) {
      const src = this.findSource(cable.fromId);
      const bld = this.state.buildings.find((b) => b.id === cable.toId);
      if (!src || !bld) continue;

      if (bld.supplied) {
        // Wide glow pass
        this.cableGraphics.lineStyle(10, 0x55d6ff, 0.07 * pulse);
        this.cableGraphics.beginPath();
        this.cableGraphics.moveTo(src.x, src.y);
        this.cableGraphics.lineTo(bld.x, bld.y);
        this.cableGraphics.strokePath();
        // Core line
        this.cableGraphics.lineStyle(2.5, 0x55d6ff, 0.85 * pulse);
        this.cableGraphics.beginPath();
        this.cableGraphics.moveTo(src.x, src.y);
        this.cableGraphics.lineTo(bld.x, bld.y);
        this.cableGraphics.strokePath();
        // energy path visualization removed
      } else {
        // Dim inactive line
        this.cableGraphics.lineStyle(1.5, 0x253545, 0.48);
        this.cableGraphics.beginPath();
        this.cableGraphics.moveTo(src.x, src.y);
        this.cableGraphics.lineTo(bld.x, bld.y);
        this.cableGraphics.strokePath();
      }
    }
  }

  private updateHud(): void {
    const critical = this.state.buildings.filter(
      (b) => b.critical && b.supplied,
    ).length;
    const total = this.state.buildings.filter((b) => b.critical).length;
    const bar = (n: number, m: number) => "█".repeat(n) + "░".repeat(m - n);

    this.hudText.setText(
      [
        `PROD   ${String(this.state.production).padStart(3)} kW`,
        `LOAD   ${String(this.state.demand).padStart(3)} kW`,
        `BAT    ${String(this.state.batteryCharge).padStart(3)} kWh`,
        `CRIT   ${bar(critical, total)} ${critical}/${total}`,
        `CABLES ${this.state.cables.length}`,
      ].join("\n"),
    );
    this.updateGuideProgress(critical, total);
  }

  private updateGuideProgress(critical: number, total: number): void {
    if (!this.guideText) return;
    const placed = [...this.state.generators, ...this.state.batteries].filter(
      (n) => n.placed,
    ).length;
    const cables = this.state.cables.length;
    const tick = (done: boolean) => (done ? "✓" : "○");

    this.guideText.setText(
      [
        `${tick(placed >= 1)} Drag a source near a red building`,
        `${tick(cables >= 1)} Click source → click building to cable`,
        `${tick(cables >= 1)} Keep cables short (less power loss)`,
        `${tick(critical >= total)} Power all ${total} critical buildings`,
        "",
        `${placed}/4 placed · ${cables} cable${cables !== 1 ? "s" : ""} · ${critical}/${total} critical`,
        `Next: ${this.nextActionHint(critical, total)}`,
      ].join("\n"),
    );
  }

  private nextActionHint(critical: number, total: number): string {
    const placed = [...this.state.generators, ...this.state.batteries].filter(
      (n) => n.placed,
    ).length;
    if (placed === 0) return "Drag GEN A near the Hospital";
    if (!this.state.cables.length) return "Click a source, then a red building";
    if (critical < total) return "Cable remaining offline buildings";
    return "All critical buildings powered!";
  }

  // ─── Completion ──────────────────────────────────────────────────────────────

  private startCompletion(): void {
    this.completionStarted = true;
    this.statusText.setText(
      "City grid restored! All critical buildings are powered.",
    );

    for (const b of this.state.buildings) {
      if (!b.supplied) continue;
      this.time.delayedCall(100 + Math.random() * 600, () => {
        const flash = this.add
          .circle(b.x, b.y, 52, 0xfff0a8, 0.22)
          .setDepth(22);
        this.tweens.add({
          targets: flash,
          alpha: 0,
          scale: 2.8,
          duration: 1100,
          ease: "Power2.easeOut",
          onComplete: () => flash.destroy(),
        });
      });
    }

    this.time.delayedCall(1900, () => {
      this.cameras.main.fadeOut(700, 0, 0, 0);
      this.cameras.main.once("camerafadeoutcomplete", () =>
        this.scene.start("Level3QuizScene"),
      );
    });
  }

  // ─── Hints / Skip ────────────────────────────────────────────────────────────

  private showHint(): void {
    const unplaced = [...this.state.generators, ...this.state.batteries].filter(
      (n) => !n.placed,
    );
    if (unplaced.length) {
      this.statusText.setText(
        "Drag GEN A near Hospital, GEN B near Water Pump, one Battery near School.",
      );
      return;
    }
    if (!this.selectedSourceId) {
      this.statusText.setText(
        "Click a generator or battery (bright border = selected), then click a red building.",
      );
      return;
    }
    this.statusText.setText(
      "Click a red OFFLINE building. If nothing lights up, move the source closer first.",
    );
  }

  private skipToQuiz(): void {
    if (this.completionStarted) return;
    this.completionStarted = true;
    this.cameras.main.fadeOut(450, 0, 0, 0);
    this.cameras.main.once("camerafadeoutcomplete", () =>
      this.scene.start("Level3QuizScene"),
    );
  }

  // ─── Utilities ───────────────────────────────────────────────────────────────

  private updateSelectedText(): void {
    if (!this.selectedText) return;
    if (!this.selectedSourceId) {
      this.selectedText.setText("Selected: none");
      return;
    }
    const src = this.findSource(this.selectedSourceId);
    const type = this.selectedSourceId.startsWith("gen")
      ? "Generator"
      : "Battery";
    this.selectedText.setText(
      `Selected: ${type} (${src?.placed ? "placed ✓" : "not placed"})`,
    );
  }

  private findSource(id: string): Placeable | undefined {
    return (
      this.state.generators.find((g) => g.id === id) ??
      this.state.batteries.find((b) => b.id === id)
    );
  }

  private lossFromLength(length: number): number {
    return Math.ceil(length / 120);
  }

  private iconFor(kind: GridNode["kind"]): string {
    if (kind === "hospital") return "+";
    if (kind === "school") return "S";
    if (kind === "waterPump") return "W";
    return "H";
  }

  private cleanupViz(): void {
    // no viz to clean up
  }
}
