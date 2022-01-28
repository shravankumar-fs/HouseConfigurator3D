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
    if (this._border.getDepth() > this._border.getWidth()) {
      this._type = 'side';
    } else {
      this._type = 'main';
    }
  }

  public get oWall() {
    return this._wall;
  }

  public get wall() {
    return this._shadowWall;
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
    this._shadowWall = this._wall;
  }
}
