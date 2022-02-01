import { Border } from './Border';
import { WallBorder } from './WallBorder';

export class WindowBorder implements Border {
  public name: string;
  public wbs: WallBorder[] = [];

  private width: number = -9999;
  private height: number = -9999;
  private depth: number = -9999;
  private xMin: number = 9999;
  private xMax: number = -9999;
  private yMin: number = 9999;
  private yMax: number = -9999;
  private zMin: number = 9999;
  private zMax: number = -9999;

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
      this.xMin = wb.getMinX() < this.xMin ? wb.getMinX() : this.xMin;
      this.yMin = wb.getMinY() < this.yMin ? wb.getMinY() : this.yMin;
      this.zMin = wb.getMinZ() < this.zMin ? wb.getMinZ() : this.zMin;

      this.xMax = wb.getMaxX() > this.xMax ? wb.getMaxX() : this.xMax;
      this.yMax = wb.getMaxY() > this.yMax ? wb.getMaxY() : this.yMax;
      this.zMax = wb.getMaxZ() > this.zMax ? wb.getMaxZ() : this.zMax;

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

  getMinX(): number {
    return this.xMin;
  }
  getMaxX(): number {
    return this.xMax;
  }
  getMinY(): number {
    return this.yMin;
  }
  getMaxY(): number {
    return this.yMax;
  }
  getMinZ(): number {
    return this.zMin;
  }
  getMaxZ(): number {
    return this.zMax;
  }
}
