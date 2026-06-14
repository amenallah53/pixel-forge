import Phaser from "phaser";
import { UIButton } from "../../ui/UIButton.ts";
import type { ExperimentMetrics, ExperimentStage } from "./types.ts";

type MatterImage = Phaser.Physics.Matter.Image;

const COIL_CX = 407;
const COIL_CY = 304;
const COIL_ZONE = { xMin: 330, xMax: 485, yMin: 245, yMax: 360 };
const NEAR_DIST = 180;

const STEP_OBSERVATIONS: Record<number, string> = {
  1: "The galvanometer needle stays at zero. A stationary magnet, even near the coil, produces no electric current.",
  2: "The needle deflects to the right! Electric current is flowing through the circuit.",
  3: "The needle returns to zero. Even with the magnet inside the coil, no current flows while it remains still.",
  4: "The needle deflects to the left! Current flows in the opposite direction.",
};

const STEP_EXPLANATIONS: Record<number, string> = {
  1: "A constant magnetic field does not induce electricity. This tells us that CHANGE is necessary.",
  2: "When the magnetic field through a coil changes, it induces a voltage. This is electromagnetic induction!",
  3: "It is not the magnet itself, but the CHANGE in magnetic field that generates electricity.",
  4: "When the magnetic field decreases instead of increasing, the induced current reverses direction.",
};

export class FaradayExperimentScene extends Phaser.Scene {
  // visualizer removed
  private magnet!: MatterImage;
  private coilGraphic!: Phaser.GameObjects.Graphics;
  private wiresGraphic!: Phaser.GameObjects.Graphics;
  private sparks!: Phaser.GameObjects.Particles.ParticleEmitter;
  private needle!: Phaser.GameObjects.Line;
  private needleLabel!: Phaser.GameObjects.Text;
  private stage: ExperimentStage = "step1_stationary";
  private lastMagnetX = 165;
  private stableTimer = 0;
  private discoveryPlayed = false;
  private metrics: ExperimentMetrics = {
    current: 0,
    voltage: 0,
    coilTurns: 12,
    magnetSpeed: 0,
    ironCoreInserted: false,
    fieldVisible: false,
  };

  private currentText!: Phaser.GameObjects.Text;
  private voltageText!: Phaser.GameObjects.Text;
  private turnsText!: Phaser.GameObjects.Text;
  private speedText!: Phaser.GameObjects.Text;
  private instructionText!: Phaser.GameObjects.Text;
  private phaseLabel!: Phaser.GameObjects.Text;
  private stepCounter!: Phaser.GameObjects.Text;
  private faradayText!: Phaser.GameObjects.Text;
  private ironCore!: Phaser.GameObjects.Rectangle;
  private coreToggle!: Phaser.GameObjects.Text;
  private continueButton?: UIButton;

  private obsPanel!: Phaser.GameObjects.Container;
  private obsText!: Phaser.GameObjects.Text;
  private explPanel!: Phaser.GameObjects.Container;
  private explText!: Phaser.GameObjects.Text;
  private stepLinkLines!: Phaser.GameObjects.Graphics;
  private stepCircles: Phaser.GameObjects.Graphics[] = [];
  private stepLabels: Phaser.GameObjects.Text[] = [];
  private stepCirclePos: { x: number; y: number }[] = [];

  private step = 1;
  private subPhase: "interact" | "observe" | "explain" = "interact";
  private subTimer = 0;
  private clickToAdvance = false;

  constructor() {
    super({ key: "FaradayExperimentScene" });
  }

  preload(): void {
    this.createGeneratedTexture("faraday_magnet", 92, 34, (g) => {
      g.fillStyle(0xb73333, 1);
      g.fillRoundedRect(0, 0, 46, 34, 6);
      g.fillStyle(0x2f6fd6, 1);
      g.fillRoundedRect(46, 0, 46, 34, 6);
      g.fillStyle(0xffffff, 0.9);
      g.fillRect(44, 3, 4, 28);
    });
  }

  create(): void {
    const w = this.scale.width;
    const h = this.scale.height;
    this.cameras.main.setBackgroundColor("#0b0d10");
    this.cameras.main.fadeIn(600, 0, 0, 0);

    this.matter.world.setBounds(0, 0, w, h);
    // Visualizer removed: no external 3D canvas appended
    // prior viz toggling removed
    // visualization removed — current still affects needles/sparks only
    // visualization removed — stop visual effects
    // no viz to clean up

    this.createLab(w, h);
    this.createCoil();
    this.createGalvanometer();
    this.createMagnet();
    this.createControls(w, h);
    this.createObservationPanel(w, h);
    this.createExplanationPanel(w, h);
    this.createAccessibilityPanel(w);
    this.createParticles();
    this.updateHud();
    this.updateStepUI();
    this.updatePhaseLabel("Expérience interactive");
    this.stepCounter.setText("Step 1 / 5");
    this.instructionText.setText(
      "Drag the magnet close to the coil and hold it still. Observe the galvanometer.",
    );

    this.input.on("pointerdown", () => {
      if (this.subPhase !== "interact") {
        this.clickToAdvance = true;
      }
    });

    this.input.on("pointerup", () => {
      if (this.magnet) {
        this.magnet.setVelocity(0, 0);
        this.magnet.setAngularVelocity(0);
      }
    });
  }

  update(_time: number, delta: number): void {
    const dt = delta / 1000;
    // this.viz.render(dt); // Removed rendering of the viz
    this.trackMagnet(dt);
    this.updateNeedle();
    this.updateHud();
    this.updateStepProgression(dt);
  }

  private createGeneratedTexture(
    key: string,
    width: number,
    height: number,
    draw: (g: Phaser.GameObjects.Graphics) => void,
  ): void {
    if (this.textures.exists(key)) return;
    const g = this.make.graphics({ x: 0, y: 0 }, false);
    draw(g);
    g.generateTexture(key, width, height);
    g.destroy();
  }

  private createLab(w: number, h: number): void {
    const g = this.add.graphics();
    g.fillGradientStyle(0x0b0d10, 0x111820, 0x24170d, 0x0d1115, 1);
    g.fillRect(0, 0, w, h);

    g.fillStyle(0x2a1a0d, 0.9);
    g.fillRect(0, h - 145, w, 145);
    g.fillStyle(0x4b2e17, 0.9);
    g.fillRect(55, 380, w - 110, 18);
    g.fillStyle(0x2d1b0d, 0.9);
    g.fillRect(75, 398, 18, 92);
    g.fillRect(w - 94, 398, 18, 92);

    for (let x = 80; x < w - 80; x += 55) {
      g.lineStyle(1, 0x6c4a2c, 0.25);
      g.lineBetween(x, 380, x + 28, h);
    }

    this.add
      .text(w / 2, 16, "Faraday: Electromagnetic Induction", {
        fontSize: "17px",
        color: "#f4d38a",
        fontFamily: "Georgia, serif",
      })
      .setOrigin(0.5);

    this.phaseLabel = this.add
      .text(w / 2, 40, "", {
        fontSize: "13px",
        color: "#55d6ff",
        fontFamily: "Georgia, serif",
      })
      .setOrigin(0.5);

    this.stepCounter = this.add
      .text(w / 2, 58, "", {
        fontSize: "11px",
        color: "#9fcfe0",
        fontFamily: "Georgia, serif",
      })
      .setOrigin(0.5);

    this.createStepCircles(w);
    this.instructionText = this.add
      .text(w / 2, 112, "", {
        fontSize: "12px",
        color: "#b8e9ff",
        fontFamily: "Georgia, serif",
        wordWrap: { width: 500 },
      })
      .setOrigin(0.5);

    this.faradayText = this.add.text(28, h - 92, "", {
      fontSize: "12px",
      color: "#f0dfb8",
      fontFamily: "Georgia, serif",
      wordWrap: { width: 320 },
    });
    this.faradayText.setDepth(20);
  }

  private createStepCircles(w: number): void {
    const y = 82;
    const count = 5;
    const spacing = 52;
    const startX = w / 2 - (spacing * (count - 1)) / 2;

    this.stepLinkLines = this.add.graphics();
    this.stepLinkLines.lineStyle(1, 0x333333, 0.5);

    for (let i = 0; i < count; i++) {
      const cx = startX + i * spacing;
      this.stepCirclePos.push({ x: cx, y });

      if (i < count - 1) {
        const nextCx = startX + (i + 1) * spacing;
        this.stepLinkLines.lineBetween(cx + 8, y, nextCx - 8, y);
      }
    }

    for (let i = 0; i < count; i++) {
      const g = this.add.graphics();
      g.fillStyle(0x333333, 1);
      g.fillCircle(this.stepCirclePos[i].x, this.stepCirclePos[i].y, 8);
      g.lineStyle(1, 0x555555, 0.6);
      g.strokeCircle(this.stepCirclePos[i].x, this.stepCirclePos[i].y, 8);
      this.stepCircles.push(g);

      const label = this.add
        .text(this.stepCirclePos[i].x, this.stepCirclePos[i].y, `${i + 1}`, {
          fontSize: "10px",
          color: "#999999",
          fontFamily: "Georgia, serif",
        })
        .setOrigin(0.5);
      this.stepLabels.push(label);
    }
    this.stepLabels[0].setColor("#ffffff");
  }

  private createCoil(): void {
    this.wiresGraphic = this.add.graphics();
    this.coilGraphic = this.add.graphics();
    this.drawCoil();

    this.ironCore = this.add.rectangle(405, 304, 126, 16, 0x8b9399, 0.35);
    this.ironCore.setStrokeStyle(1, 0xcbd8df, 0.45);
    this.ironCore.setVisible(false);
  }

  private drawCoil(): void {
    this.coilGraphic.clear();
    this.wiresGraphic.clear();
    this.wiresGraphic.lineStyle(3, 0xc77932, 0.75);
    this.wiresGraphic.beginPath();
    this.wiresGraphic.moveTo(468, 305);
    this.wiresGraphic.lineTo(560, 305);
    this.wiresGraphic.lineTo(604, 332);
    this.wiresGraphic.strokePath();

    const turnCount = Math.round(this.metrics.coilTurns / 2);
    for (let i = 0; i < turnCount; i++) {
      const x = 350 + i * (105 / Math.max(1, turnCount - 1));
      this.coilGraphic.lineStyle(4, 0xd58632, 0.9);
      this.coilGraphic.strokeEllipse(x, 304, 34, 86);
      this.coilGraphic.lineStyle(1, 0xffdca1, 0.45);
      this.coilGraphic.strokeEllipse(x - 1, 302, 28, 76);
    }
    this.add
      .text(407, 238, "Copper coil", {
        fontSize: "10px",
        color: "#cfae82",
        fontFamily: "Georgia, serif",
      })
      .setOrigin(0.5);
  }

  private createGalvanometer(): void {
    const g = this.add.graphics();
    g.fillStyle(0x131820, 0.96);
    g.fillRoundedRect(548, 250, 130, 98, 10);
    g.lineStyle(2, 0xb9894e, 0.8);
    g.strokeRoundedRect(548, 250, 130, 98, 10);
    g.lineStyle(1, 0x9fcfe0, 0.55);
    g.beginPath();
    g.arc(613, 319, 35, Math.PI, 0);
    g.strokePath();
    for (let i = -3; i <= 3; i++) {
      const x = 613 + i * 10;
      g.lineBetween(x, 314, x, 322);
    }
    g.lineStyle(1, 0x555555, 0.4);
    g.lineBetween(613 - 35, 319, 613 + 35, 319);

    this.add
      .text(578, 325, "-", {
        fontSize: "11px",
        color: "#ff9999",
        fontFamily: "Georgia, serif",
      })
      .setOrigin(0.5);
    this.add
      .text(648, 325, "+", {
        fontSize: "11px",
        color: "#99ff99",
        fontFamily: "Georgia, serif",
      })
      .setOrigin(0.5);
    this.add
      .text(613, 332, "Galvanometer", {
        fontSize: "10px",
        color: "#e8d4a8",
        fontFamily: "Georgia, serif",
      })
      .setOrigin(0.5);

    this.needle = this.add.line(613, 319, 0, 0, 0, -32, 0xff5e5e, 1);
    this.needle.setLineWidth(3);
    this.needleLabel = this.add
      .text(613, 283, "", {
        fontSize: "10px",
        color: "#ffdddd",
        fontFamily: "Georgia, serif",
      })
      .setOrigin(0.5);
  }

  private createMagnet(): void {
    this.magnet = this.matter.add.image(165, 304, "faraday_magnet");
    this.magnet.setIgnoreGravity(true);
    this.magnet.setFrictionAir(0.12);
    this.magnet.setFriction(0.08);
    this.magnet.setBounce(0.0);
    this.magnet.setMass(2);
    this.magnet.setFixedRotation();
    this.magnet.setInteractive({ useHandCursor: true });
    this.matter.add.pointerConstraint({
      stiffness: 0.18,
      angularStiffness: 1.0,
      render: { visible: false },
    });
    this.add
      .text(165, 250, "Magnet", {
        fontSize: "10px",
        color: "#d7e7ff",
        fontFamily: "Georgia, serif",
      })
      .setOrigin(0.5);
  }

  private createObservationPanel(w: number, h: number): void {
    const y = h - 156;
    const bg = this.add.rectangle(w / 2, y + 24, 500, 52, 0x081219, 0.92);
    bg.setStrokeStyle(1, 0x55d6ff, 0.3);
    const label = this.add.text(w / 2 - 240, y + 8, "Observation", {
      fontSize: "11px",
      color: "#55d6ff",
      fontFamily: "Georgia, serif",
      fontStyle: "italic",
    });
    this.obsText = this.add
      .text(w / 2, y + 30, "", {
        fontSize: "12px",
        color: "#d4f0ff",
        fontFamily: "Georgia, serif",
        wordWrap: { width: 460 },
        align: "center",
      })
      .setOrigin(0.5);
    this.obsPanel = this.add.container(0, 0, [bg, label, this.obsText]);
    this.obsPanel.setDepth(15);
    this.obsPanel.setVisible(false);
  }

  private createExplanationPanel(w: number, h: number): void {
    const y = h - 156;
    const bg = this.add.rectangle(w / 2, y + 24, 500, 52, 0x141008, 0.92);
    bg.setStrokeStyle(1, 0xf4d38a, 0.3);
    const label = this.add.text(w / 2 - 240, y + 8, "Explication", {
      fontSize: "11px",
      color: "#f4d38a",
      fontFamily: "Georgia, serif",
      fontStyle: "italic",
    });
    this.explText = this.add
      .text(w / 2, y + 30, "", {
        fontSize: "12px",
        color: "#f0e4c8",
        fontFamily: "Georgia, serif",
        wordWrap: { width: 460 },
        align: "center",
      })
      .setOrigin(0.5);
    this.explPanel = this.add.container(0, 0, [bg, label, this.explText]);
    this.explPanel.setDepth(15);
    this.explPanel.setVisible(false);
  }

  private createControls(w: number, h: number): void {
    const panel = this.add.rectangle(w - 116, 105, 204, 142, 0x071019, 0.88);
    panel.setStrokeStyle(1, 0x55d6ff, 0.45);
    this.currentText = this.add.text(w - 208, 48, "", {
      fontSize: "12px",
      color: "#e4fbff",
      fontFamily: "Georgia, serif",
    });
    this.voltageText = this.add.text(w - 208, 70, "", {
      fontSize: "12px",
      color: "#e4fbff",
      fontFamily: "Georgia, serif",
    });
    this.turnsText = this.add.text(w - 208, 92, "", {
      fontSize: "12px",
      color: "#e4fbff",
      fontFamily: "Georgia, serif",
    });
    this.speedText = this.add.text(w - 208, 114, "", {
      fontSize: "12px",
      color: "#e4fbff",
      fontFamily: "Georgia, serif",
    });

    new UIButton(this, w - 174, 153, 48, 28, "- Coil", 0x132332, 0x1d4254, () =>
      this.changeTurns(-4),
    );
    new UIButton(this, w - 112, 153, 48, 28, "+ Coil", 0x132332, 0x1d4254, () =>
      this.changeTurns(4),
    );

    this.coreToggle = this.add
      .text(w - 206, 180, "[ Insert iron core ]", {
        fontSize: "12px",
        color: "#9fcfe0",
        fontFamily: "Georgia, serif",
      })
      .setInteractive({ useHandCursor: true });
    this.coreToggle.on("pointerdown", () => this.toggleCore());

    new UIButton(this, 90, 165, 120, 30, "Hint", 0x2a1a0a, 0x4a3728, () =>
      this.showHint(),
    );
    new UIButton(this, 230, 165, 160, 30, "Restart", 0x2a1a0a, 0x4a3728, () =>
      this.scene.restart(),
    );

    this.continueButton = new UIButton(
      this,
      w - 115,
      h - 52,
      185,
      36,
      "Take the Quiz",
      0x123225,
      0x1f6349,
      () => {
        this.cameras.main.fadeOut(500, 0, 0, 0);
        this.cameras.main.once("camerafadeoutcomplete", () =>
          this.scene.start("Level4QuizScene"),
        );
      },
    );
    this.continueButton.enabled = false;
  }

  private createAccessibilityPanel(w: number): void {
    const box = this.add.rectangle(w - 103, 223, 178, 42, 0x080b0d, 0.72);
    box.setStrokeStyle(1, 0x777777, 0.25);
    const label = this.add.text(
      w - 185,
      211,
      "Accessibility: high contrast sparks",
      {
        fontSize: "9px",
        color: "#d6d6d6",
        fontFamily: "Georgia, serif",
      },
    );
    const toggle = this.add
      .text(w - 185, 229, "[ Toggle field lines ]", {
        fontSize: "10px",
        color: "#55d6ff",
        fontFamily: "Georgia, serif",
      })
      .setInteractive({ useHandCursor: true });
    toggle.on("pointerdown", () => {
      this.metrics.fieldVisible = !this.metrics.fieldVisible;
      // field line visualization removed
    });
    label.setDepth(20);
    toggle.setDepth(20);
  }

  private createParticles(): void {
    this.sparks = this.add.particles(474, 304, "particle", {
      speed: { min: 15, max: 75 },
      angle: { min: -35, max: 35 },
      scale: { start: 0.7, end: 0 },
      alpha: { start: 0.9, end: 0 },
      frequency: 80,
      lifespan: 450,
      tint: 0x55d6ff,
      emitting: false,
    });
    this.sparks.setDepth(12);
  }

  private trackMagnet(dt: number): void {
    const dx = this.magnet.x - this.lastMagnetX;
    const rawSpeed = dx / Math.max(dt, 0.016);
    const absSpeed = Math.abs(rawSpeed);
    this.metrics.magnetSpeed = Phaser.Math.Linear(
      this.metrics.magnetSpeed,
      absSpeed / 90,
      0.18,
    );
    this.lastMagnetX = this.magnet.x;

    const inCoilZone =
      this.magnet.x > COIL_ZONE.xMin &&
      this.magnet.x < COIL_ZONE.xMax &&
      this.magnet.y > COIL_ZONE.yMin &&
      this.magnet.y < COIL_ZONE.yMax;
    const nearCoil =
      Phaser.Math.Distance.Between(
        this.magnet.x,
        this.magnet.y,
        COIL_CX,
        COIL_CY,
      ) < NEAR_DIST;
    const movingFast = absSpeed / 90 > 1.3;
    const signedSpeed = Phaser.Math.Clamp(rawSpeed / 90, -4.5, 4.5);

    if (nearCoil && !movingFast) {
      this.stableTimer += dt;
    } else {
      this.stableTimer = 0;
    }

    const inducing = inCoilZone && movingFast;
    const targetCurrent = inducing ? this.calculateCurrent(signedSpeed) : 0;

    if (inducing) {
      this.metrics.current = Phaser.Math.Linear(
        this.metrics.current,
        targetCurrent,
        0.32,
      );
    } else {
      this.metrics.current = Phaser.Math.Linear(this.metrics.current, 0, 0.08);
    }
    this.metrics.voltage = Math.abs(this.metrics.current) * 2.1;

    if (inducing) {
      this.sparks.start();
      // this.viz.setCurrent(this.metrics.current); // Removed viz current setting
      this.metrics.fieldVisible = true;
    } else if (Math.abs(this.metrics.current) < 0.25) {
      this.sparks.stop();
      // visualization removed — stop visual current
    }
  }

  private calculateCurrent(signedSpeed: number): number {
    const turnsFactor = this.metrics.coilTurns / 12;
    const coreFactor = this.metrics.ironCoreInserted ? 1.55 : 1;
    return Phaser.Math.Clamp(
      signedSpeed * turnsFactor * coreFactor * 1.85,
      -10,
      10,
    );
  }

  private updateNeedle(): void {
    const angle = Phaser.Math.DegToRad(-90 + this.metrics.current * 5.5);
    this.needle.setTo(0, 0, Math.cos(angle) * 32, Math.sin(angle) * 32);

    if (Math.abs(this.metrics.current) > 0.3) {
      const dir = this.metrics.current > 0 ? "→" : "←";
      this.needleLabel.setText(dir);
    } else {
      this.needleLabel.setText("");
    }
  }

  private updateHud(): void {
    this.currentText.setText(`Current: ${this.metrics.current.toFixed(2)} A`);
    this.voltageText.setText(`Voltage: ${this.metrics.voltage.toFixed(1)} V`);
    this.turnsText.setText(`Coil turns: ${this.metrics.coilTurns}`);
    this.speedText.setText(
      `Magnet speed: ${this.metrics.magnetSpeed.toFixed(1)}`,
    );
  }

  private updateStepProgression(dt: number): void {
    if (this.discoveryPlayed) return;

    if (this.subPhase !== "interact") {
      this.subTimer -= dt;
      if (this.subTimer <= 0 || this.clickToAdvance) {
        this.clickToAdvance = false;
        if (this.subPhase === "observe") {
          this.showExplanation();
        } else if (this.subPhase === "explain") {
          this.advanceToNextStep();
        }
      }
      return;
    }

    const nearCoil =
      Phaser.Math.Distance.Between(
        this.magnet.x,
        this.magnet.y,
        COIL_CX,
        COIL_CY,
      ) < NEAR_DIST;
    const inCoilZone =
      this.magnet.x > COIL_ZONE.xMin &&
      this.magnet.x < COIL_ZONE.xMax &&
      this.magnet.y > COIL_ZONE.yMin &&
      this.magnet.y < COIL_ZONE.yMax;
    const stable = this.stableTimer > 1.0;

    switch (this.stage) {
      case "step1_stationary":
        if (nearCoil && stable) {
          this.completeStep("A stationary magnet produces no current.");
        }
        break;
      case "step2_moving_in":
        if (this.metrics.current > 1.5) {
          this.completeStep("Moving the magnet generates electricity!");
        }
        break;
      case "step3_stationary_inside":
        if (inCoilZone && stable) {
          this.completeStep(
            "A still magnet inside the coil produces no current.",
          );
        }
        break;
      case "step4_moving_out":
        if (this.metrics.current < -1.5) {
          this.completeStep("Pulling the magnet out reverses the current!");
        }
        break;
      case "step5_optimization":
        if (Math.abs(this.metrics.current) > 7.2 && !this.discoveryPlayed) {
          this.playDiscovery();
        }
        break;
    }
  }

  private completeStep(feedback: string): void {
    this.say(feedback);
    this.obsText.setText(STEP_OBSERVATIONS[this.step]);
    this.obsPanel.setVisible(true);
    this.explPanel.setVisible(false);
    this.instructionText.setText("");
    this.subPhase = "observe";
    this.subTimer = 3.5;
    this.clickToAdvance = false;
    this.updatePhaseLabel("Observation");
  }

  private showExplanation(): void {
    this.obsPanel.setVisible(false);
    this.explText.setText(STEP_EXPLANATIONS[this.step]);
    this.explPanel.setVisible(true);
    this.subPhase = "explain";
    this.subTimer = 4.0;
    this.clickToAdvance = false;
    this.updatePhaseLabel("Explication");
  }

  private advanceToNextStep(): void {
    this.explPanel.setVisible(false);
    this.obsPanel.setVisible(false);
    this.stableTimer = 0;

    if (this.step >= 4) {
      this.stage = "step5_optimization";
      this.step = 5;
      this.subPhase = "interact";
      this.updatePhaseLabel("Défi");
      this.stepCounter.setText("Défi — Maximisez le courant!");
      this.instructionText.setText(
        "Generate enough current to power the city! Move the magnet faster, add coil turns, and insert the iron core.",
      );
      this.updateStepUI();
      return;
    }

    this.step++;
    this.subPhase = "interact";
    this.updatePhaseLabel("Expérience interactive");
    this.stepCounter.setText(`Step ${this.step} / 5`);
    this.updateStepUI();

    const instructions: Record<number, string> = {
      2: "Now push the magnet rapidly through the coil.",
      3: "Stop the magnet inside the coil and hold it still.",
      4: "Pull the magnet back out of the coil.",
    };
    this.instructionText.setText(instructions[this.step] ?? "");

    const stages: Record<number, ExperimentStage> = {
      2: "step2_moving_in",
      3: "step3_stationary_inside",
      4: "step4_moving_out",
    };
    this.stage = stages[this.step] ?? this.stage;
  }

  private updateStepUI(): void {
    for (let i = 0; i < this.stepCircles.length; i++) {
      const completed = i + 1 < this.step;
      const current = i + 1 === this.step;
      const circle = this.stepCircles[i];
      const label = this.stepLabels[i];
      const pos = this.stepCirclePos[i];

      circle.clear();
      if (completed) {
        circle.fillStyle(0x33aa55, 1);
        circle.fillCircle(pos.x, pos.y, 8);
        circle.lineStyle(1, 0x55dd77, 0.7);
        circle.strokeCircle(pos.x, pos.y, 8);
        label.setText("✓");
        label.setColor("#ffffff");
        label.setFontSize(9);
      } else if (current) {
        circle.fillStyle(0x55d6ff, 1);
        circle.fillCircle(pos.x, pos.y, 8);
        circle.lineStyle(2, 0x88eeff, 0.8);
        circle.strokeCircle(pos.x, pos.y, 10);
        label.setText(`${i + 1}`);
        label.setColor("#ffffff");
        label.setFontSize(10);
      } else {
        circle.fillStyle(0x333333, 1);
        circle.fillCircle(pos.x, pos.y, 8);
        circle.lineStyle(1, 0x555555, 0.6);
        circle.strokeCircle(pos.x, pos.y, 8);
        label.setText(`${i + 1}`);
        label.setColor("#666666");
        label.setFontSize(10);
      }
    }
  }

  private updatePhaseLabel(phase: string): void {
    this.phaseLabel.setText(phase);
  }

  private changeTurns(delta: number): void {
    this.metrics.coilTurns = Phaser.Math.Clamp(
      this.metrics.coilTurns + delta,
      8,
      28,
    );
    this.drawCoil();
  }

  private toggleCore(): void {
    this.metrics.ironCoreInserted = !this.metrics.ironCoreInserted;
    this.ironCore.setVisible(this.metrics.ironCoreInserted);
    this.coreToggle.setText(
      this.metrics.ironCoreInserted
        ? "[ Remove iron core ]"
        : "[ Insert iron core ]",
    );
  }

  private showHint(): void {
    const hints: Record<number, string> = {
      1: "Place the magnet near the coil and hold it perfectly still. Watch the needle.",
      2: "Push the magnet through the coil quickly. Speed matters!",
      3: "Stop the magnet inside the coil and wait. Does the needle stay deflected?",
      4: "Pull the magnet back out of the coil. Watch which way the needle moves.",
      5: "Move faster! Add more coil turns. Insert the iron core. Maximize everything!",
    };
    this.say(hints[this.step] ?? "Experiment with the magnet and coil.");
  }

  private say(text: string): void {
    this.faradayText.setText(`Faraday: "${text}"`);
  }

  private playDiscovery(): void {
    this.discoveryPlayed = true;
    this.stage = "restored";
    this.continueButton!.enabled = true;
    this.subPhase = "interact";
    this.obsPanel.setVisible(false);
    this.explPanel.setVisible(false);
    this.updatePhaseLabel("Fragment de science récupéré");
    this.instructionText.setText(
      "Electromagnetic Induction Restored! You have rediscovered how motion and magnetism create electricity.",
    );
    this.stepCounter.setText("");
    this.faradayText.setText(
      'Faraday: "Motion and magnetism can awaken electricity. The principle is restored!"',
    );
    this.updateStepUI();

    const overlay = this.add.rectangle(
      this.scale.width / 2,
      this.scale.height / 2,
      this.scale.width,
      this.scale.height,
      0x55d6ff,
      0.08,
    );
    overlay.setDepth(9);
    this.tweens.add({
      targets: overlay,
      alpha: 0.22,
      duration: 350,
      yoyo: true,
      repeat: 3,
    });

    for (let i = 0; i < 8; i++) {
      const lamp = this.add.circle(
        90 + i * 88,
        122 + (i % 2) * 28,
        7,
        0xfff0a8,
        0,
      );
      lamp.setDepth(8);
      this.tweens.add({
        targets: lamp,
        alpha: 0.85,
        scale: 1.8,
        duration: 500,
        delay: i * 90,
        yoyo: true,
      });
    }
  }

  private cleanupViz(): void {
    // no viz to clean up
  }
}
