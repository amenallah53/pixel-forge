import * as THREE from 'three'

const candleUrl = '/assets/candle.png'
const mirrorUrl = '/assets/mirror.png'
const boxUrl = '/assets/wooden_box.png'

function loadPixelTexture(url: string): THREE.Texture {
  const texture = new THREE.TextureLoader().load(url)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.magFilter = THREE.NearestFilter
  texture.minFilter = THREE.NearestFilter
  texture.generateMipmaps = false
  texture.anisotropy = 1
  return texture
}

function createSideMaterial(color: number): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: 0.82,
    metalness: 0.05,
  })
}

function createFrontMaterial(texture: THREE.Texture, opacity = 1): THREE.MeshBasicMaterial {
  return new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    opacity,
    alphaTest: 0.08,
  })
}

type CardParts = {
  group: THREE.Group
  front: THREE.Mesh
  back: THREE.Mesh
  body: THREE.Mesh
  frontMaterial: THREE.MeshBasicMaterial
  backMaterial: THREE.MeshBasicMaterial
}

function createTexturedCard(
  texture: THREE.Texture,
  width: number,
  height: number,
  depth: number,
  sideColor: number,
  backColor: number,
): CardParts {
  const group = new THREE.Group()

  const bodyGeo = new THREE.BoxGeometry(width, height, depth)
  const bodyMaterials = [
    createSideMaterial(sideColor),
    createSideMaterial(sideColor),
    createSideMaterial(sideColor),
    createSideMaterial(sideColor),
    new THREE.MeshStandardMaterial({
      color: backColor,
      roughness: 0.9,
      metalness: 0.02,
    }),
    new THREE.MeshStandardMaterial({
      color: backColor,
      roughness: 0.9,
      metalness: 0.02,
    }),
  ]
  const body = new THREE.Mesh(bodyGeo, bodyMaterials)
  group.add(body)

  const frontGeo = new THREE.PlaneGeometry(width * 0.985, height * 0.985)
  const frontMaterial = createFrontMaterial(texture)
  const front = new THREE.Mesh(frontGeo, frontMaterial)
  front.position.z = depth / 2 + 0.01
  group.add(front)

  const backMaterial = createFrontMaterial(texture, 0.85)
  const back = new THREE.Mesh(frontGeo.clone(), backMaterial)
  back.rotation.y = Math.PI
  back.position.z = -(depth / 2 + 0.01)
  group.add(back)

  return { group, front, back, body, frontMaterial, backMaterial }
}

export type ThreeDObject = {
  mesh: THREE.Group
  update?: (time: number, delta: number) => void
}

export class ThreeDWorld {
  private scene: THREE.Scene
  private camera: THREE.PerspectiveCamera
  private renderer: THREE.WebGLRenderer
  private objects: ThreeDObject[] = []
  private canvas: HTMLCanvasElement
  private time = 0
  private cx = 400
  private cy = 300
  private candleTexture = loadPixelTexture(candleUrl)
  private mirrorTexture = loadPixelTexture(mirrorUrl)
  private boxTexture = loadPixelTexture(boxUrl)

  constructor(width: number, height: number) {
    this.canvas = document.createElement('canvas')
    this.canvas.width = width
    this.canvas.height = height
    this.canvas.style.position = 'absolute'
    this.canvas.style.top = '0'
    this.canvas.style.left = '0'
    this.canvas.style.width = '100%'
    this.canvas.style.height = '100%'
    this.canvas.style.pointerEvents = 'none'
    this.canvas.style.zIndex = '5'
    this.canvas.style.opacity = '0.95'

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: true,
    })
    this.renderer.setSize(width, height)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.setClearColor(0x000000, 0)
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1.18
    this.renderer.outputColorSpace = THREE.SRGBColorSpace

    this.scene = new THREE.Scene()

    this.camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 100)
    this.camera.position.set(0, 0, 14.5)
    this.camera.lookAt(0, 0, 0)

    const ambient = new THREE.AmbientLight(0x382f42, 0.55)
    this.scene.add(ambient)

    const key = new THREE.DirectionalLight(0xffe9cf, 1.45)
    key.position.set(4, 6, 8)
    this.scene.add(key)

    const fill = new THREE.DirectionalLight(0x6aa6ff, 0.4)
    fill.position.set(-5, 2, 6)
    this.scene.add(fill)

    const rim = new THREE.DirectionalLight(0xffffff, 0.25)
    rim.position.set(0, -5, 4)
    this.scene.add(rim)

    const hemi = new THREE.HemisphereLight(0x223366, 0x442211, 0.45)
    this.scene.add(hemi)
  }

  setOrigin(ox: number, oy: number): void {
    this.cx = ox
    this.cy = oy
  }

  to3D(sx: number, sy: number): { x: number; y: number; z: number } {
    return {
      x: (sx - this.cx) / 55,
      y: (this.cy - sy) / 55,
      z: 0,
    }
  }

  getCanvas(): HTMLCanvasElement {
    return this.canvas
  }

  addObject(obj: ThreeDObject): void {
    this.scene.add(obj.mesh)
    this.objects.push(obj)
  }

  removeObject(obj: ThreeDObject): void {
    this.scene.remove(obj.mesh)
    const idx = this.objects.indexOf(obj)
    if (idx >= 0) this.objects.splice(idx, 1)
    this.disposeObject(obj.mesh)
  }

  clear(): void {
    for (const obj of this.objects) {
      this.scene.remove(obj.mesh)
      this.disposeObject(obj.mesh)
    }
    this.objects = []
  }

  createCandle(sx: number, sy: number): ThreeDObject {
    const pos = this.to3D(sx, sy)
    const { group, frontMaterial } = createTexturedCard(this.candleTexture, 0.82, 0.98, 0.18, 0x6d553f, 0x2d1c12)
    const auraMaterial = new THREE.MeshBasicMaterial({
      color: 0xffa640,
      transparent: true,
      opacity: 0.1,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    const haloMaterial = new THREE.MeshBasicMaterial({
      color: 0xffaa55,
      transparent: true,
      opacity: 0.15,
      blending: THREE.AdditiveBlending,
    })

    group.rotation.set(-0.03, 0.08, 0.01)
    group.position.set(pos.x, pos.y, pos.z)
    group.scale.set(1.28, 1.28, 1.28)

    const aura = new THREE.Mesh(
      new THREE.PlaneGeometry(1.3, 1.45),
      auraMaterial,
    )
    aura.position.z = -0.12
    group.add(aura)

    const light = new THREE.PointLight(0xff9a33, 1.15, 4.5)
    light.position.set(0, 0.24, 0.45)
    group.add(light)

    const halo = new THREE.Mesh(
      new THREE.SphereGeometry(0.32, 10, 10),
      haloMaterial,
    )
    halo.position.set(0, 0.42, 0.08)
    group.add(halo)

    return {
      mesh: group,
      update: (t: number, dt: number) => {
        const flicker = 1 + 0.08 * Math.sin(t * 14) + 0.05 * Math.sin(t * 23)
        frontMaterial.opacity = 0.95 + 0.02 * Math.sin(t * 5)
        auraMaterial.opacity = 0.08 + 0.05 * Math.sin(t * 8)
        haloMaterial.opacity = 0.11 + 0.05 * Math.sin(t * 10)
        light.intensity = 0.95 + 0.18 * Math.sin(t * 12)
        group.rotation.z = 0.01 * Math.sin(t * 1.4)
        group.scale.setScalar(1.26 + 0.02 * flicker)

        if (dt > 0) {
          aura.scale.x = 1 + 0.03 * Math.sin(t * 4)
          aura.scale.y = 1 + 0.05 * Math.sin(t * 3)
        }
      },
    }
  }

  create3DBox(sx: number, sy: number): ThreeDObject {
    const pos = this.to3D(sx, sy)
    const { group } = createTexturedCard(this.boxTexture, 1.02, 0.98, 0.72, 0x876544, 0x4e3925)
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0x9b7b55,
      transparent: true,
      opacity: 0.06,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    const shadowMaterial = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.12,
      depthWrite: false,
    })

    group.rotation.set(-0.03, 0.15, 0.02)
    group.position.set(pos.x, pos.y, pos.z)
    group.scale.set(1.1, 1.1, 1.1)

    const glow = new THREE.Mesh(
      new THREE.PlaneGeometry(1.18, 1.06),
      glowMaterial,
    )
    glow.position.z = -0.38
    group.add(glow)

    const shadow = new THREE.Mesh(
      new THREE.PlaneGeometry(1.2, 0.34),
      shadowMaterial,
    )
    shadow.rotation.x = -Math.PI / 2
    shadow.position.set(0, -0.55, 0.42)
    group.add(shadow)

    return {
      mesh: group,
      update: (t: number) => {
        glowMaterial.opacity = 0.04 + 0.02 * Math.sin(t * 2)
        shadowMaterial.opacity = 0.1 + 0.03 * Math.sin(t * 1.5)
        group.rotation.y = 0.15 + 0.02 * Math.sin(t * 0.7)
      },
    }
  }

  create3DMirror(sx: number, sy: number, rotation: number): ThreeDObject {
    const pos = this.to3D(sx, sy)
    const { group, frontMaterial } = createTexturedCard(this.mirrorTexture, 0.92, 1.1, 0.18, 0xb8996b, 0x473421)
    frontMaterial.opacity = 0.94
    const sheenMaterial = new THREE.MeshBasicMaterial({
      color: 0xa6ddff,
      transparent: true,
      opacity: 0.08,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    const frameGlowMaterial = new THREE.MeshBasicMaterial({
      color: 0xffdca8,
      transparent: true,
      opacity: 0.03,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })

    group.rotation.set(-0.02, 0.08, -rotation)
    group.position.set(pos.x, pos.y, pos.z)
    group.scale.set(1.15, 1.15, 1.15)

    const sheen = new THREE.Mesh(
      new THREE.PlaneGeometry(0.78, 0.92),
      sheenMaterial,
    )
    sheen.position.z = 0.11
    group.add(sheen)

    const frameGlow = new THREE.Mesh(
      new THREE.PlaneGeometry(1.02, 1.2),
      frameGlowMaterial,
    )
    frameGlow.position.z = -0.08
    group.add(frameGlow)

    return {
      mesh: group,
      update: (t: number) => {
        frontMaterial.opacity = 0.92 + 0.03 * Math.sin(t * 0.8)
        sheenMaterial.opacity = 0.05 + 0.03 * Math.sin(t * 0.6)
        frameGlowMaterial.opacity = 0.02 + 0.02 * Math.sin(t * 0.9)
      },
    }
  }

  render(delta: number = 0.016): void {
    this.time += delta
    for (const obj of this.objects) {
      if (obj.update) obj.update(this.time, delta)
    }
    this.renderer.render(this.scene, this.camera)
  }

  resize(width: number, height: number): void {
    this.canvas.width = width
    this.canvas.height = height
    this.renderer.setSize(width, height)
    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
  }

  destroy(): void {
    this.clear()
    this.candleTexture.dispose()
    this.mirrorTexture.dispose()
    this.boxTexture.dispose()
    this.renderer.dispose()
    this.canvas.remove()
  }

  private disposeObject(object: THREE.Object3D): void {
    object.traverse((child) => {
      const mesh = child as THREE.Mesh
      if (mesh.geometry) {
        mesh.geometry.dispose()
      }

      const material = mesh.material
      if (Array.isArray(material)) {
        for (const mat of material) {
          mat.dispose()
        }
      } else if (material) {
        material.dispose()
      }
    })
  }
}
