import { ControlButton } from './ControlButton';

export class EditButton implements ControlButton {
  button!: HTMLButtonElement;

  constructor() {
    this.button = document.createElement('button');
    this.button.innerHTML = 'Edit';
    this.button.id = 'editBtn';
    this.button.classList.add('controlButton');
  }

  getButton() {
    return this.button;
  }
}
