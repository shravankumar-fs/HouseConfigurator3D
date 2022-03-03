import * as THREE from 'three';

export class ScaleButton {
  private origin: THREE.Vector3;
  presentDistance: number = 0;
  pastDistance: number = 0;

  constructor(
    private button: THREE.Mesh,
    private min: number,
    private max: number,
    public type: string
  ) {
    this.origin = this.button.position.clone();
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
