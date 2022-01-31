import { ControlButton } from './ControlButton';

export class AnimateButton implements ControlButton {
  button!: HTMLButtonElement;

  constructor() {
    this.button = document.createElement('button');
    this.button.innerHTML = 'Animate';
    this.button.id = 'animateBtn';
    this.button.classList.add('controlButton');
  }

  getButton() {
    return this.button;
  }
}
