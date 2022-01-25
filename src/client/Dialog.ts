import * as THREE from 'three';
import { DialogInt } from './DialogInt';

export class Dialog implements DialogInt {
  meshItem: THREE.Mesh;

  constructor(
    item: THREE.Mesh,
    private type: string,
    private meshCache: THREE.Mesh[]
  ) {
    this.meshItem = item;
    if (!meshCache.includes(this.meshItem)) meshCache.push(this.meshItem);
  }

  colors: string[] = [
    'rgb(31,111,143)',
    'rgb(223,175,0)',
    'rgb(249,249,251)',
    'rgb(253,244,227)',
    'rgb(253,100,100)',
    'rgb(63,0,0)',
  ];
  textures: string[] = [
    'resources/models/wtext0.jpg',
    'resources/models/wtext1.jpg',
    'resources/models/wtext2.jpg',
    'resources/models/wtext3.jpg',
    'resources/models/wtext4.jpg',
    'resources/models/wtext5.jpg',
  ];

  addDialog(): void {
    document.querySelectorAll('.dialog').forEach((d) => d.remove());
    this.meshCache.forEach((mesh) => {
      this.adjustTransparency(mesh);
    });
    (this.meshItem.material as THREE.MeshLambertMaterial).transparent = true;
    (this.meshItem.material as THREE.MeshLambertMaterial).opacity = 0.5;

    let dialog = this.createElement('div', 'dialog', 'dialog');
    this.fillDialogueContent(dialog as HTMLDivElement);
    document.body.appendChild(dialog);

    let selItems = document.querySelectorAll('.colorItem');
    let selectedColor = '';
    selItems.forEach((item) => {
      item.addEventListener('click', () => {
        selItems.forEach((i) => i.classList.remove('selected'));
        item.classList.add('selected');

        selectedColor = (item as HTMLElement).style.backgroundColor;
      });
    });

    let selTexture = document.querySelectorAll('.textureItem');
    let selectedTexture = '';
    selTexture.forEach((item) => {
      item.addEventListener('click', () => {
        selTexture.forEach((i) => i.classList.remove('selected'));
        item.classList.add('selected');

        let url = (item as HTMLElement).style.backgroundImage;
        selectedTexture = url.slice(4, -1).replace(/"/g, '');
      });
    });

    let cancel = document.getElementById('cancel');
    let confirm = document.getElementById('confirm');
    cancel?.addEventListener('click', () => {
      this.adjustTransparency(this.meshItem);
      dialog.remove();
    });
    confirm?.addEventListener('click', () => {
      if (selectedTexture) {
        if (selectedTexture.indexOf('0') == -1) {
          let text = new THREE.TextureLoader().load(selectedTexture);
          text.wrapS = THREE.RepeatWrapping;
          text.wrapT = THREE.RepeatWrapping;
          text.repeat.set(6, 6);
          (this.meshItem.material as THREE.MeshLambertMaterial).map = text;
        } else {
          (this.meshItem.material as THREE.MeshLambertMaterial).map = null;
        }
      }
      if (selectedColor) {
        (this.meshItem.material as THREE.MeshLambertMaterial).color =
          new THREE.Color(selectedColor);
      }
      if (selectedTexture || selectedColor) {
        this.adjustTransparency(this.meshItem);
      }
      dialog.remove();
    });
  }

  fillDialogueContent(dialog: HTMLDivElement) {
    let colorSet = this.getDialogueColors();
    dialog.appendChild(colorSet);

    let textureSet = this.getDialogueTextures();
    dialog.appendChild(textureSet);

    let actions = this.getActionPanel();
    dialog.appendChild(actions);
  }

  private getDialogueColors() {
    let colorDialogue = this.createElement(
      'div',
      'colorDialogue',
      'subDialogue'
    );
    let title = this.createElement('div', 'dcTitle', 'title');
    title.innerHTML = `${this.type} Color`;
    colorDialogue.appendChild(title);

    let colorSet = this.createElement('div', 'colorSet', 'set');
    this.colors.forEach((color) => {
      let colorElement = this.createElement(
        'span',
        'color' + Math.random().toPrecision(3).replace('.', ''),
        'colorItem'
      );
      colorElement.style.background = color;
      colorSet.appendChild(colorElement);
    });
    colorDialogue.appendChild(colorSet);
    return colorDialogue;
  }

  private getDialogueTextures() {
    let textureDialogue = this.createElement(
      'div',
      'textureDialogue',
      'subDialogue'
    );
    let title = this.createElement('div', 'dtTitle', 'title');
    title.innerHTML = `${this.type} Texture`;
    textureDialogue.appendChild(title);

    let textureSet = this.createElement('div', 'textureSet', 'set');
    this.textures.forEach((texture) => {
      let textureElement = this.createElement(
        'span',
        'texture' + Math.random().toPrecision(3).replace('.', ''),
        'textureItem'
      );
      textureElement.style.background = `url(${texture})`;
      textureSet.appendChild(textureElement);
    });
    textureDialogue.appendChild(textureSet);

    return textureDialogue;
  }

  private getActionPanel() {
    let actions = this.createElement('div', 'dActions', 'actionBtns');
    let cancel = this.createElement('button', 'cancel', 'action');
    cancel.innerHTML = 'Cancel';
    let confirm = this.createElement('button', 'confirm', 'action');
    confirm.innerHTML = 'Confirm';
    actions.appendChild(cancel);
    actions.appendChild(confirm);

    return actions;
  }

  private createElement(type: string, id?: string, classNames?: string) {
    let el = document.createElement(type);
    if (id) el.id = id;
    if (classNames) {
      classNames.split(',').forEach((c) => el.classList.add(c));
    }
    return el;
  }

  private adjustTransparency(mesh: THREE.Mesh) {
    if (mesh.name.toLowerCase().includes('window')) {
      (mesh.material as THREE.MeshLambertMaterial).transparent = true;
      (mesh.material as THREE.MeshLambertMaterial).opacity = 0.2;
    } else {
      (mesh.material as THREE.MeshLambertMaterial).transparent = false;
      (mesh.material as THREE.MeshLambertMaterial).opacity = 1;
    }
    (mesh.material as THREE.MeshLambertMaterial).needsUpdate = true;
  }
}
