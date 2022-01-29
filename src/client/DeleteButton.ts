import { ControlButton } from './ControlButton';

export class DeleteBtn implements ControlButton {
  button!: HTMLButtonElement;

  constructor() {
    this.button = document.createElement('button');
    this.button.innerHTML = 'Delete';
    this.button.id = 'deleteBtn';
    this.button.classList.add('controlButton');
  }

  getButton() {
    return this.button;
  }
}
