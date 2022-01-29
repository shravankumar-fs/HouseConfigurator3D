import { ControlButton } from './ControlButton';

export class ButtonPanel {
  buttonList: ControlButton[] = [];
  styles = [
    {
      top: '0%',
      left: '50%',
    },
    {
      top: '100%',
      left: '50%',
    },
    {
      top: '50%',
      left: '0%',
    },
    {
      top: '50%',
      left: '100%',
    },
  ];

  constructor(private x: number, private y: number) {}

  addButton(button: ControlButton) {
    this.buttonList.push(button);
  }

  display() {
    document.getElementById('controlArray')?.remove();
    let controlArray = document.createElement('div');
    controlArray.classList.add('controlArray');
    controlArray.id = 'controlArray';
    controlArray.style.top = `${this.y}px`;
    controlArray.style.left = `${this.x}px`;

    let controlArrayButtons = document.createElement('div');
    controlArrayButtons.classList.add('controlArrayButtons');
    controlArray.appendChild(controlArrayButtons);

    this.buttonList.forEach((button, idx) => {
      button.getButton().style.top = this.styles[idx].top;
      button.getButton().style.left = this.styles[idx].left;
      controlArrayButtons.appendChild(button.getButton());
    });
    document.body.appendChild(controlArray);
  }

  remove() {
    document.getElementById('controlArray')?.remove();
  }
}
