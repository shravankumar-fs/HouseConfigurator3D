export class ScaleButton {
  private origin: THREE.Vector3;
  presentDistance: number = 0;
  pastDistance: number = 0;
  constructor(
    public button: THREE.Object3D,
    private min: number,
    private max: number,
    public type: string
  ) {
    this.origin = this.button.position.clone();
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
