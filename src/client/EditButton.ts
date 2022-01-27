import { HTMLAddElement } from './HTMLAddElement';

export class EditButtton implements HTMLAddElement {
  button!: HTMLButtonElement;

  constructor(private x: number, private y: number) {}
  add(): void {
    document.getElementById('editBtn')?.remove();
    this.button = document.createElement('button');
    this.button.innerHTML = 'edit';
    this.button.id = 'editBtn';
    this.button.style.position = 'absolute';
    this.button.style.top = `${this.y}px`;
    this.button.style.left = `${this.x}px`;
    this.button.style.transform = 'translate(-50%,-50%)';
    this.button.style.zIndex = `100`;
    document.body.appendChild(this.button);
  }

  getButton() {
    return this.button;
  }
}
