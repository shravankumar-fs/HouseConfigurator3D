import * as THREE from 'three';

export class WallBorder {
  private boundingBox: THREE.Box3 = new THREE.Box3();

  private width: number = 0;
  private height: number = 0;
  private depth: number = 0;
  public xMin: number = 0;
  public xMax: number = 0;
  public yMin: number = 0;
  public yMax: number = 0;
  public zMin: number = 0;
  public zMax: number = 0;

  constructor(wall: THREE.Mesh) {
    wall.geometry.computeBoundingBox();
    if (wall.geometry.boundingBox) {
      this.boundingBox.copy(wall.geometry.boundingBox);
      wall.updateMatrixWorld(true);
      this.boundingBox.applyMatrix4(wall.matrixWorld);
    }
    this.xMin = this.boundingBox.min.x;
    this.xMax = this.boundingBox.max.x;

    this.yMin = this.boundingBox.min.y;
    this.yMax = this.boundingBox.max.y;

    this.zMin = this.boundingBox.min.z;
    this.zMax = this.boundingBox.max.z;

    this.width = this.xMax - this.xMin;
    this.height = this.yMax - this.yMin;
    this.depth = this.zMax - this.zMin;
  }

  getBoundingBox(): THREE.Box3 {
    return this.boundingBox;
  }

  getWidth(): number {
    return this.width;
  }

  getHeight(): number {
    return this.height;
  }

  getDepth(): number {
    return this.depth;
  }
}
