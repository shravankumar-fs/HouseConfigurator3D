import * as THREE from 'three';
import { TextureLoader } from 'three';

export class EnvironmentManager {
  private _scene!: THREE.Scene;
  private _camera!: THREE.PerspectiveCamera;
  private _renderer!: THREE.WebGLRenderer;
  private _predefinedCanvas!: HTMLCanvasElement;

  constructor() {
    this._predefinedCanvas = document.getElementById(
      'canvas'
    ) as HTMLCanvasElement;
    this.adjustCanvasSize();
    this.initScene();
    this.initCamera();
    this.initRenderer();
    this.initLights();
    // this.addGround();
  }
  initLights() {
    this.initLight(new THREE.Vector3(0, 45, 0), 0xffffff, 2, 60, 1);
    this.initLight(new THREE.Vector3(0, -45, 0), 0xffffff, 1.5, 60, 1);
    this.initLight(new THREE.Vector3(0, 0, -45), 0xffffff, 1.5, 60, 1);
    this.initLight(new THREE.Vector3(0, 0, 45), 0xffffff, 1.5, 60, 1);
    this.initLight(new THREE.Vector3(45, 0, 0), 0xffffff, 1.5, 60, 1);
    this.initLight(new THREE.Vector3(-45, 0, 0), 0xffffff, 1.5, 60, 1);

    let directionalLight = new THREE.DirectionalLight(0xffffff, 10);
    directionalLight.position.set(0, 70, 50);
    this._scene.add(directionalLight);
  }
  initLight(
    pos: THREE.Vector3,
    color: number,
    intensity: number,
    distance: number,
    decay: number
  ) {
    let light = new THREE.PointLight(color, intensity, distance, decay);
    light.position.set(pos.x, pos.y, pos.z);
    this._scene.add(light);
  }

  public get scene() {
    return this._scene;
  }

  public get camera() {
    return this._camera;
  }
  public get renderer() {
    return this._renderer;
  }

  initScene() {
    this._scene = new THREE.Scene();
    this._scene.fog = new THREE.Fog(0xafff00, 70, 120);
    this.scene.background = new THREE.Color(0xffffff);
    this.scene.background = new TextureLoader().load('images/sky.jpg');
  }

  initCamera() {
    this._camera = new THREE.PerspectiveCamera(
      75,
      this._predefinedCanvas.width / this._predefinedCanvas.height,
      0.1,
      1000
    );

    this._camera.position.set(0, 10, 45);
  }

  initRenderer() {
    if (this._predefinedCanvas) {
      this._renderer = new THREE.WebGLRenderer({
        canvas: this._predefinedCanvas,
        antialias: true,
      });
      this._renderer.setSize(
        this._predefinedCanvas.width,
        this._predefinedCanvas.height
      );
    } else {
      this._renderer = new THREE.WebGLRenderer({
        antialias: true,
      });
      this._renderer.physicallyCorrectLights = true;
      this._renderer.setSize(window.innerWidth, window.innerHeight);
    }
  }

  addGround() {
    let groundG = new THREE.CircleBufferGeometry(50, 100);
    let tex = new THREE.TextureLoader().load('images/grass.jpg');
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(50, 50);
    let groundM = new THREE.MeshBasicMaterial({
      map: tex,
      transparent: true,
      opacity: 0.9,
    });
    let ground = new THREE.Mesh(groundG, groundM);
    ground.rotation.x -= Math.PI / 2;
    ground.position.y = -0.2;
    this._scene.add(ground);
  }

  onWindowResize() {
    this.adjustCanvasSize();
    this._camera.aspect =
      this._predefinedCanvas.width / this._predefinedCanvas.height;
    this._camera.updateProjectionMatrix();
    this._renderer.setSize(
      this._predefinedCanvas.width,
      this._predefinedCanvas.height
    );

    this.render();
  }

  private adjustCanvasSize() {
    this._predefinedCanvas.height = (window.innerHeight * 5) / 5;
    this._predefinedCanvas.width = (window.innerWidth * 5) / 5;
  }

  render() {
    this._renderer.render(this._scene, this._camera);
  }
}
