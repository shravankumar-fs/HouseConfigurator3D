export interface Border {
  getWidth(): number;
  getHeight(): number;
  getDepth(): number;
  getMinX(): number;
  getMaxX(): number;
  getMinY(): number;
  getMaxY(): number;
  getMinZ(): number;
  getMaxZ(): number;
}
