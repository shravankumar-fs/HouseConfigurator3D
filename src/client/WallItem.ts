import { WallBorder } from './WallBorder';

export class WallItem {
  private _name: string = '';
  private _shadowWall: THREE.Mesh;
  private _border: WallBorder;
  private _type: string = '';

  constructor(private _wall: THREE.Mesh) {
    this._name = _wall.name;
    this._shadowWall = this._wall;
    this._border = new WallBorder(this._wall);
    this._type =
      this._border.getDepth() > this._border.getWidth() ? 'side' : 'main';
  }

  public get oWall() {
    return this._wall;
  }

  public get wall() {
    return this._shadowWall;
  }

  public set wall(wallObject: THREE.Mesh) {
    this._shadowWall = wallObject;
  }

  public get name() {
    return this._name;
  }

  public get border() {
    return this._border;
  }

  public get type() {
    return this._type;
  }

  public resetWall() {
    (this._shadowWall as THREE.Mesh).geometry = (
      this._wall as THREE.Mesh
    ).geometry.clone();
  }
}
