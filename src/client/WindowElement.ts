import { WallBorder } from './WallBorder';

export class WindowElement {
  public name: string;
  public wbs: WallBorder[] = [];

  private width: number = -9999;
  private height: number = -9999;
  private depth: number = -9999;
  public xMin: number = 9999;
  public xMax: number = -9999;
  public yMin: number = 9999;
  public yMax: number = -9999;
  public zMin: number = 9999;
  public zMax: number = -9999;

  constructor(public _window: THREE.Group) {
    this.name = _window.name;
    _window.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        let wb = new WallBorder(child as THREE.Mesh);
        this.wbs.push(wb);
      }
    });
    this.calculateBounds();
  }

  private calculateBounds() {
    this.wbs.forEach((wb) => {
      this.xMin = wb.xMin < this.xMin ? wb.xMin : this.xMin;
      this.yMin = wb.yMin < this.yMin ? wb.yMin : this.yMin;
      this.zMin = wb.zMin < this.zMin ? wb.zMin : this.zMin;

      this.xMax = wb.xMax > this.xMax ? wb.xMax : this.xMax;
      this.yMax = wb.yMax > this.yMax ? wb.yMax : this.yMax;
      this.zMax = wb.zMax > this.zMax ? wb.zMax : this.zMax;

      this.width = this.xMax - this.xMin;
      this.height = this.yMax - this.yMin;
      this.depth = this.zMax - this.zMin;
    });
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
