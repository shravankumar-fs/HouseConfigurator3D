import * as THREE from 'three';
import { TextureLoader } from 'three';

export class EnvironmentManager {
  private _scene!: THREE.Scene;
  private _camera!: THREE.PerspectiveCamera;
  private _renderer!: THREE.WebGLRenderer;

  constructor() {
    this.initScene();
    this.initCamera();
    this.initRenderer();
    this.initLights();
    this.addGround();
  }
  initLights() {
    this.initLight(new THREE.Vector3(0, 45, 0), 0xffffff, 2, 60, 1);
    // this.initLight(new THREE.Vector3(0, -45, 0), 0xffffff, 1.5, 60, 1);
    this.initLight(new THREE.Vector3(0, 0, -45), 0xffffff, 1.5, 60, 1);
    this.initLight(new THREE.Vector3(0, 0, 45), 0xffffff, 1.5, 60, 1);
    this.initLight(new THREE.Vector3(45, 0, 0), 0xffffff, 1.5, 60, 1);
    this.initLight(new THREE.Vector3(-45, 0, 0), 0xffffff, 1.5, 60, 1);
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
    this._scene.fog = new THREE.Fog(0x001f00, 50, 200);
    this.scene.background = new TextureLoader().load('images/sky.jpg');
  }

  initCamera() {
    this._camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this._camera.position.set(0, 10, 25);
  }

  initRenderer() {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      this._renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
      });
    } else {
      this._renderer = new THREE.WebGLRenderer({
        antialias: true,
      });
    }
    this._renderer.setSize(window.innerWidth, window.innerHeight);
  }

  addGround() {
    let groundG = new THREE.CircleBufferGeometry(200, 1000);
    let tex = new THREE.TextureLoader().load('images/grass.jpg');
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(100, 100);
    let groundM = new THREE.MeshBasicMaterial({ map: tex });
    let ground = new THREE.Mesh(groundG, groundM);
    ground.rotation.x -= Math.PI / 2;
    ground.position.y = -0.2;
    this._scene.add(ground);
  }

  onWindowResize() {
    this._camera.aspect = window.innerWidth / window.innerHeight;
    this._camera.updateProjectionMatrix();
    this._renderer.setSize(window.innerWidth, window.innerHeight);
    this.render();
  }

  render() {
    this._renderer.render(this._scene, this._camera);
  }
}
