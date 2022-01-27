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
    this._scene.fog = new THREE.Fog(0x90ff90, 0.1, 500);
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
      });
    } else {
      this._renderer = new THREE.WebGLRenderer();
    }
    this._renderer.shadowMap.enabled = true;
    this._renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this._renderer.setSize(window.innerWidth, window.innerHeight);
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
