import * as THREE from 'three';

export class ScaleButton {
  private origin: THREE.Vector3;
  presentDistance: number = 0;
  pastDistance: number = 0;
  button: THREE.Mesh;

  constructor(
    public name: string,
    private min: number,
    private max: number,
    public type: string
  ) {
    this.button = this.createScaleButton(name);
    this.origin = this.button.position.clone();
  }

  private createScaleButton(name: string): THREE.Mesh {
    let g1 = new THREE.PlaneGeometry(2, 2, 100, 100);
    let m1 = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      map: new THREE.TextureLoader().load('images/arrow.png'),
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9,
    });
    let mc = new THREE.Mesh(g1, m1);
    mc.name = name;
    return mc;
  }

  getButton() {
    return this.button;
  }

  getDistance() {
    if (this.type == 'x') {
      return this.button.position.x - this.origin.x;
    }
    return this.button.position.z - this.origin.z;
  }

  getMin() {
    return this.min;
  }

  getMax() {
    return this.max;
  }
}
